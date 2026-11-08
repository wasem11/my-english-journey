const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {createHostedServer}=require('../server/hosted-server.cjs');
async function main(){
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'mej-hosted-check-'));
 const origin='https://family.example',code='private-test-code';
 await fs.mkdir(path.join(directory,'web'));await fs.writeFile(path.join(directory,'web/index.html'),'Journey home');
 let calls=0;const mock=http.createServer((req,res)=>{calls++;res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));});
 const pagesOrigin='https://family.github.io';
 const env={PUBLIC_ORIGIN:origin,FRONTEND_ORIGINS:pagesOrigin,FAMILY_ACCESS_CODE:code,SESSION_SECRET:'a'.repeat(64),WEB_ROOT:path.join(directory,'web'),USAGE_FILE:path.join(directory,'usage.json'),DAILY_SPEECH_LIMIT:'1'};
 assert.throws(()=>createHostedServer({env:{}}));
 const server=createHostedServer({env,converterReady:true,speechServer:mock});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const home=await fetch(base,{redirect:'manual'});assert.equal(home.status,303);assert.equal(home.headers.get('location'),'/login');
  assert.equal((await fetch(base+'/api/speech-status')).status,401);
  assert.equal((await fetch(base+'/healthz')).status,200);
  assert.equal((await fetch(base+'/login',{method:'POST',body:'code='+code})).status,403);
  assert.equal((await fetch(base+'/login',{method:'POST',headers:{Origin:origin},body:'code=incorrect'})).status,401);
  const loggedIn=await fetch(base+'/login',{method:'POST',headers:{Origin:origin},body:'code='+code,redirect:'manual'});
  assert.equal(loggedIn.status,303);const cookie=loggedIn.headers.get('set-cookie');
  for(const flag of ['HttpOnly','Secure','SameSite=Strict'])assert(cookie.includes(flag));
  const headers={Cookie:cookie.split(';')[0],Origin:origin};
  const appHome=await fetch(base,{headers});assert.equal(await appHome.text(),'Journey home');assert.equal(appHome.headers.get('cache-control'),'no-store','HTML must not retain an old app version');
  assert.equal((await fetch(base+'/api/speech-status',{headers})).status,200);
  assert.equal((await fetch(base+'/api/speech-status',{headers:{Cookie:headers.Cookie+'tampered'}})).status,401);
  assert.equal((await fetch(base+'/api/mobile-session',{method:'POST',body:'code='+code})).status,403,'Mobile login still requires the expected origin.');
  assert.equal((await fetch(base+'/api/mobile-session',{method:'POST',headers:{Origin:origin},body:'code=incorrect'})).status,401);
  const mobile=await fetch(base+'/api/mobile-session',{method:'POST',headers:{Origin:origin},body:'code='+code});assert.equal(mobile.status,200);
  const session=await mobile.json();assert.equal(typeof session.token,'string');assert(session.expiresAt>Date.now()+29*86400000);
  const nativeHeaders={Authorization:'Bearer '+session.token,Origin:origin};
  assert.equal((await fetch(base+'/api/refresh-session',{method:'POST',headers:{Origin:origin}})).status,401,'Renewal must require an existing valid session.');
  const renewed=await fetch(base+'/api/refresh-session',{method:'POST',headers:nativeHeaders});assert.equal(renewed.status,200);assert((await renewed.json()).expiresAt>Date.now()+29*86400000);
  const expiredValue=`${Date.now()-1000}.expired`,signature=require('node:crypto').createHmac('sha256',env.SESSION_SECRET).update(expiredValue).digest('base64url');
  assert.equal((await fetch(base+'/api/refresh-session',{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${expiredValue}.${signature}`}})).status,401,'Expired credentials cannot mint new sessions.');

  assert.equal((await fetch(base+'/api/speech-status',{headers:nativeHeaders})).status,200,'The native app must access speech without a browser cookie.');
  assert.equal((await fetch(base+'/api/speech-status',{headers:{Authorization:nativeHeaders.Authorization+'tampered'}})).status,401);
  assert.equal((await fetch(base+'/',{headers:nativeHeaders,redirect:'manual'})).status,303,'Native tokens only authorize API routes.');
  const preflight=await fetch(base+'/api/speech-assessment',{method:'OPTIONS',headers:{Origin:pagesOrigin,'Access-Control-Request-Headers':'authorization'}});
  assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),pagesOrigin);assert(preflight.headers.get('access-control-allow-headers').includes('Authorization'));
  const denied=await fetch(base+'/api/speech-status',{headers:{Origin:pagesOrigin}});assert.equal(denied.status,401);assert.equal(denied.headers.get('access-control-allow-origin'),pagesOrigin,'The public frontend must be able to read sign-in errors.');
  const webLogin=await fetch(base+'/api/mobile-session',{method:'POST',headers:{Origin:pagesOrigin},body:'code='+code});assert.equal(webLogin.status,200);
  const webToken=(await webLogin.json()).token;
  assert.equal((await fetch(base+'/api/speech-status',{headers:{Origin:pagesOrigin,Authorization:'Bearer '+webToken}})).status,200);
  assert.equal((await fetch(base+'/api/speech-status',{headers:{Origin:'https://untrusted.example',Authorization:'Bearer '+webToken}})).status,403);
  assert.equal((await fetch(base+'/api/speech-assessment',{method:'OPTIONS',headers:{Origin:'https://untrusted.example'}})).status,403);
  assert.equal((await fetch(base+'/api/speech-assessment',{method:'POST',headers})).status,200);
  assert.equal((await fetch(base+'/api/speech-assessment',{method:'POST',headers})).status,429);
  assert.equal(JSON.parse(await fs.readFile(env.USAGE_FILE)).count,1);
  assert.equal((await fetch(base+'/%2e%2e%2fserver%2f.env',{headers})).status,404);
  assert.equal(calls,4);
  console.log('PASS: private login, signed secure session, cross-origin rejection, protected API/static files, daily persistent assessment limit, and credential path protection.');
 }finally{await new Promise(r=>server.close(r));await fs.unlink(path.join(directory,'web/index.html'));await fs.rmdir(path.join(directory,'web'));await fs.unlink(env.USAGE_FILE).catch(()=>{});await fs.rmdir(directory);}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
