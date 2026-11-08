const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createSpeechServer,ffmpegExecutable}=require('./speech-server.cjs');
function createHostedServer({env=process.env,converterReady=false,speechServer}={}){
 const secret=env.SESSION_SECRET||'',code=env.FAMILY_ACCESS_CODE||'',origin=env.PUBLIC_ORIGIN||'';
 if(secret.length<32||code.length<8||!/^https:\/\/[^/]+$/.test(origin))throw new Error('Hosted mode requires a private session secret, family access code, and HTTPS public origin.');
 const allowedOrigins=new Set([origin,...(env.FRONTEND_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean)]);
 const root=path.resolve(env.WEB_ROOT||path.join(__dirname,'../web'));
 const usageFile=env.USAGE_FILE||path.join(__dirname,'../data/speech-usage.json');
 const limit=Number(env.DAILY_SPEECH_LIMIT)||100;
 const attempts=new Map();let active=0;
 const speech=speechServer||createSpeechServer({env:{...env,ALLOWED_ORIGINS:[...allowedOrigins].join(',')},converterReady});
 const sign=value=>crypto.createHmac('sha256',secret).update(value).digest('base64url');
 const equal=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);};
 function authorized(req){
  const bearer=pathnameForAuth(req).startsWith('/api/')&&req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):'';
  const token=bearer||(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('mej_session='))?.slice(12)||'';
  const [expires,nonce,signature]=token.split('.');
  return !!nonce&&!!signature&&Number(expires)>Date.now()&&equal(signature,sign(`${expires}.${nonce}`));
 }
 function pathnameForAuth(req){try{return new URL(req.url,'http://localhost').pathname;}catch{return '';}}
 function spend(){
  const day=new Date().toISOString().slice(0,10);let usage={day,count:0};
  try{const saved=JSON.parse(fs.readFileSync(usageFile,'utf8'));if(saved.day===day){if(!Number.isInteger(saved.count)||saved.count<0)throw new Error('Invalid usage counter');usage=saved;}}
  catch(error){if(error.code!=='ENOENT')throw error;}
  if(usage.count>=limit)return false;
  fs.mkdirSync(path.dirname(usageFile),{recursive:true});
  fs.writeFileSync(usageFile+'.tmp',JSON.stringify({day,count:usage.count+1}));fs.renameSync(usageFile+'.tmp',usageFile);return true;
 }
 const login=error=>`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#204E40"><title>My English Journey</title><style>body{margin:0;background:#F8F7EF;color:#193C35;font:18px system-ui;display:grid;min-height:100dvh;place-items:center}main{box-sizing:border-box;background:white;padding:28px;border-radius:24px;width:min(92vw,420px)}h1{font-size:28px}input,button{box-sizing:border-box;width:100%;padding:16px;border-radius:12px;font:inherit;margin:12px 0}input{border:1px solid #E3E7DC}button{background:#204E40;color:white;border:0;font-weight:700}p{line-height:1.6}.error{color:#ad3040}</style><main><h1>My English Journey</h1><p>Enter your family access code to start learning.</p><form method="post" action="/login"><label for="code">Family access code</label><input id="code" name="code" type="password" required autocomplete="current-password" maxlength="128"><button>Start my journey</button></form>${error?'<p class="error" role="alert">'+error+'</p>':''}<p lang="fa" dir="rtl">برای شروع یادگیری، رمز خانوادگی خود را وارد کنید.</p></main></html>`;
 return http.createServer(async(req,res)=>{
  const send=(status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type==='application/json'?JSON.stringify(body):body);};
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Strict-Transport-Security','max-age=31536000');
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return send(400,{error:'Invalid address.'});}
  const requestOrigin=req.headers.origin;
  if(pathname.startsWith('/api/')&&requestOrigin){
   if(!allowedOrigins.has(requestOrigin))return send(403,{error:'This app origin is not configured.'});
   res.setHeader('Access-Control-Allow-Origin',requestOrigin);res.setHeader('Vary','Origin');
   res.setHeader('Access-Control-Expose-Headers','X-Narration-Voice');
  }
  if(pathname.startsWith('/api/')&&req.method==='OPTIONS'){
   if(!requestOrigin||!allowedOrigins.has(requestOrigin))return send(403,{error:'This app origin is not configured.'});
   res.writeHead(204,{'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'});res.end();return;
  }
  if(pathname==='/healthz'&&req.method==='GET')return send(converterReady?200:503,{ready:converterReady});
  if(req.method==='POST'&&!(pathname.startsWith('/api/')?allowedOrigins.has(req.headers.origin):req.headers.origin===origin))return send(403,{error:'Open the app using its normal address.'});
  const mobileLogin=pathname==='/api/mobile-session';
  if(pathname==='/login'||mobileLogin){
   if(req.method==='GET'&&!mobileLogin)return send(200,login(''),'text/html; charset=utf-8');
   if(req.method!=='POST')return send(405,{error:'Method not allowed.'});
   const ip=req.socket.remoteAddress||'unknown',now=Date.now();
   for(const [key,value] of attempts)if(now>value.until)attempts.delete(key);
   const record=attempts.get(ip)||{count:0,until:now+3600000};record.count++;attempts.set(ip,record);
   const loginError=(status,message)=>mobileLogin?send(status,{error:message}):send(status,login(message),'text/html; charset=utf-8');
   if(record.count>20||attempts.size>1000)return loginError(429,'Too many attempts. Please try again later.');
   let body='';try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>1024)return send(413,{error:'Request too large.'});}}catch{return send(400,{error:'Try again.'});}
   if(!equal(new URLSearchParams(body).get('code')||'',code))return loginError(401,'That code did not match. Please try again.');
   attempts.delete(ip);const lifetime=30*86400000;const value=`${now+lifetime}.${crypto.randomBytes(16).toString('hex')}`;
   if(mobileLogin)return send(200,{token:`${value}.${sign(value)}`,expiresAt:now+lifetime});
   res.writeHead(303,{'Location':'/','Cache-Control':'no-store','Set-Cookie':`mej_session=${value}.${sign(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`});res.end();return;
  }
  if(!authorized(req)){
   if(pathname.startsWith('/api/'))return send(401,{error:'Please reopen the app and enter your family access code.'});
   res.writeHead(303,{'Location':'/login','Cache-Control':'no-store'});res.end();return;
  }
  if(pathname==='/api/refresh-session'){
   if(req.method!=='POST')return send(405,{error:'Method not allowed.'});
   const expiresAt=Date.now()+30*86400000,value=`${expiresAt}.${crypto.randomBytes(16).toString('hex')}`;
   return send(200,{token:`${value}.${sign(value)}`,expiresAt});
  }
  if(pathname.startsWith('/api/')){
   if(pathname==='/api/speech-assessment'&&req.method==='POST'){
    if(active>=2)return send(429,{error:'Another recording is being scored. Please try again shortly.'});
    try{if(!spend())return send(429,{error:'Today’s speaking practice limit has been reached. Please return tomorrow.'});}catch{return send(503,{error:'Speaking practice is temporarily unavailable.'});}
    active++;res.once('close',()=>active--);
   }
   speech.emit('request',req,res);return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return send(405,{error:'Method not allowed.'});
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root)return send(404,{error:'Not found.'});
  try{
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   if(!fs.existsSync(file)&&!path.extname(file))file=path.join(root,'index.html');
   const stat=fs.statSync(file);if(!stat.isFile())return send(404,{error:'Not found.'});
   const types={'.webmanifest':'application/manifest+json','.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.ico':'image/x-icon'};
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':path.extname(file)==='.html'?'no-store':'private, max-age=3600'});
   if(req.method==='HEAD')res.end();else fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  }catch{send(404,{error:'Not found.'});}
 });
}
if(require.main===module){
 const {spawnSync}=require('node:child_process');
 const converterReady=spawnSync(ffmpegExecutable(),['-version'],{windowsHide:true,stdio:'ignore'}).status===0;
 createHostedServer({converterReady}).listen(Number(process.env.PORT)||8080,process.env.HOST||'0.0.0.0',()=>console.log('My English Journey hosted server started.'));
}
module.exports={createHostedServer};
