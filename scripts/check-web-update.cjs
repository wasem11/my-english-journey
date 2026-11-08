const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const current='a'.repeat(40),next='b'.repeat(40);
const source=ts.transpileModule(fs.readFileSync('src/webAppUpdate.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function check(path,build,offline=false){const exports={},reloaded=[],requests=[];const href='https://family.github.io'+path;vm.runInNewContext(source,{exports,process:{env:{EXPO_PUBLIC_WEB_BUILD_ID:current}},URL,AbortController,setTimeout,clearTimeout,window:{location:{pathname:new URL(href).pathname,href,replace:url=>reloaded.push(url)}},fetch:async(url,options)=>{requests.push(options);if(offline)throw Error('Offline');return {ok:true,json:async()=>({build})};},require:()=>({Platform:{OS:'web'}})});await exports.checkWebAppUpdate();return {reloaded,requests};}
(async()=>{
 assert.equal((await check('/my-english-journey/',next)).reloaded.length,1);
 assert.equal((await check('/my-english-journey/',current)).reloaded.length,0);
 assert.equal((await check('/my-english-journey/journey-lesson',next)).requests.length,0,'Updates must never interrupt lessons or recordings.');
 assert.equal((await check('/my-english-journey/?appVersion='+next,next)).reloaded.length,0,'A deployment must not create a reload loop.');
 assert.equal((await check('/my-english-journey/',next,true)).reloaded.length,0);
 assert.equal((await check('/my-english-journey/','invalid')).reloaded.length,0);
 assert.equal((await check('/my-english-journey/',next)).requests[0].cache,'no-store');
 console.log('PASS: Home Screen updates refresh only the homepage, bypass stale caches, avoid loops, and leave active lessons/offline sessions alone.');
})().catch(e=>{console.error(e);process.exitCode=1;});
