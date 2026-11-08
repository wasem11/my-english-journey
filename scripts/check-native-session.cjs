const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
async function check(os){
 let saved=null,nextStatus=200,calls=[];const exports={};
 const source=ts.transpileModule(fs.readFileSync('src/nativeSession.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,process:{env:{EXPO_PUBLIC_API_URL:'https://family.example'}},window:{location:{origin:'https://family.github.io'},sessionStorage:{getItem:()=>saved,setItem:(key,value)=>{saved=value;},removeItem:()=>{saved=null;}}},Headers,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch:async(url,options={})=>{calls.push({url,options});return {ok:nextStatus===200,status:nextStatus,json:async()=>url.endsWith('/api/mobile-session')?{token:'signed-test-session'}:{ready:true}};},require:name=>{
  if(name==='react-native')return {Platform:{OS:os}};
  if(name==='expo-secure-store')return {getItemAsync:async()=>saved,setItemAsync:async(key,value)=>{saved=value;},deleteItemAsync:async()=>{saved=null;}};
  throw new Error(name);
 }});
 assert.equal(await exports.restoreNativeSession(),false);
 await exports.signInNative('family code');assert.equal(saved,'signed-test-session');
 assert.equal(calls[0].options.body,'code=family+code');assert.equal(calls[0].options.headers.Origin,os==='ios'?'https://family.example':undefined,'Browsers must supply their real Origin header.');
 await exports.apiFetch('/api/speech-status');assert.equal(calls.at(-1).options.headers.get('Authorization'),'Bearer signed-test-session');
 const form=new FormData();form.append('lessonId','hello');await exports.apiFetch('/api/speech-assessment',{method:'POST',body:form});
 assert.equal(calls.at(-1).options.headers.get('Origin'),os==='ios'?'https://family.example':null);assert.equal(calls.at(-1).options.headers.get('Content-Type'),null,'Multipart requests must keep the generated boundary.');
 let expired=0;const unsubscribe=exports.onSessionExpired(()=>expired++);nextStatus=401;
 await exports.apiFetch('/api/speech-status');assert.equal(saved,null);assert.equal(expired,1);assert.equal(exports.nativeAuthHeaders().Authorization,undefined);unsubscribe();
 await exports.apiFetch('/api/speech-status');assert.equal(expired,1,'An already disconnected request must not cause a refresh loop.');
}
async function main(){await check('ios');await check('web');console.log('PASS: native Keychain and external-web tab sessions authenticate voice requests, preserve multipart boundaries, and clear expired sessions without refresh loops.');}
main().catch(error=>{console.error(error);process.exitCode=1;});
