const fs=require('node:fs/promises'),assert=require('node:assert/strict');
const site='https://wasem11.github.io/my-english-journey/',origin=new URL(site).origin;
const request=(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(25000)});
async function main(){
 const home=await request(site);assert.equal(home.status,200);const html=await home.text();
 const script=html.match(/src="([^"]*entry-[^\"]+\.js)"/)?.[1];assert(script?.startsWith('/my-english-journey/_expo/'));
 const bundle=await request(new URL(script,site));assert.equal(bundle.status,200);assert((await bundle.text()).includes('Connect voice'));
 const manifest=await request(site+'manifest.webmanifest').then(r=>r.json());assert.equal(manifest.scope,'/my-english-journey/');
 const deep=await request(site+'conversations?place=community-shops');assert([200,404].includes(deep.status));assert((await deep.text()).includes(script),'Deep links must serve the SPA fallback.');
 console.log('PASS: public HTTPS page, repository-relative bundle, mobile manifest, and deep-link fallback.');
 const settings=JSON.parse(await fs.readFile('server/.hosting.env','utf8')),api=settings.PUBLIC_ORIGIN;
 const preflight=await request(api+'/api/speech-assessment',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Headers':'authorization'}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),origin);
 const locked=await request(api+'/api/speech-status',{headers:{Origin:origin}});assert.equal(locked.status,401);assert.equal(locked.headers.get('access-control-allow-origin'),origin);
 const login=await request(api+'/api/mobile-session',{method:'POST',headers:{Origin:origin},body:new URLSearchParams({code:settings.FAMILY_ACCESS_CODE})});assert.equal(login.status,200);const session=await login.json();
 const headers={Origin:origin,Authorization:'Bearer '+session.token};
 const status=await request(api+'/api/speech-status',{headers}).then(r=>r.json());assert.equal(status.target,90);assert.equal(status.ready,true);
 const audio=await request(api+'/api/narration?v=jenny-slow-v1&text='+encodeURIComponent('Could I have the receipt, please?'),{headers});assert.equal(audio.status,200);assert.equal(audio.headers.get('access-control-allow-origin'),origin);assert.equal(audio.headers.get('x-narration-voice'),'en-US-JennyNeural');assert((await audio.arrayBuffer()).byteLength>500);
 console.log('PASS: Pages-origin preflight, protected voice access, family sign-in, 90% target, and actual Jenny narration.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
