const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
async function check(os,storageBlocked=false){
 let saved=null,nextStatus=200,calls=[],pending401=null,signIns=0;const exports={};
 const source=ts.transpileModule(fs.readFileSync('src/nativeSession.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,process:{env:{EXPO_PUBLIC_API_URL:'https://family.example'}},window:{location:{origin:'https://family.github.io'},sessionStorage:{getItem:()=>{if(storageBlocked)throw new Error('Storage denied');return saved;},setItem:(key,value)=>{if(storageBlocked)throw new Error('Storage denied');saved=value;},removeItem:()=>{if(storageBlocked)throw new Error('Storage denied');saved=null;}}},Headers,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch:async(url,options={})=>{calls.push({url,options});if(url.endsWith('/api/stale'))return new Promise(resolve=>{pending401=()=>resolve({status:401});});return {ok:nextStatus===200,status:nextStatus,json:async()=>url.endsWith('/api/mobile-session')?{token:++signIns===1?'signed-test-session':'renewed-session-'+signIns}:{ready:true}};},require:name=>{
  if(name==='react-native')return {Platform:{OS:os}};
  if(name==='expo-secure-store')return {getItemAsync:async()=>saved,setItemAsync:async(key,value)=>{saved=value;},deleteItemAsync:async()=>{saved=null;}};
  throw new Error(name);
 }});
 assert.equal(await exports.restoreNativeSession(),false);
 await exports.signInNative('family code');assert.equal(exports.hasFamilySession(),true);if(!storageBlocked)assert.equal(saved,'signed-test-session');
 assert.equal(calls[0].options.body,'code=family+code');assert.equal(calls[0].options.headers.Origin,os==='ios'?'https://family.example':undefined,'Browsers must supply their real Origin header.');
 await exports.apiFetch('/api/speech-status');assert.equal(calls.at(-1).options.headers.get('Authorization'),'Bearer signed-test-session');
 const form=new FormData();form.append('lessonId','hello');await exports.apiFetch('/api/speech-assessment',{method:'POST',body:form});
 assert.equal(calls.at(-1).options.headers.get('Origin'),os==='ios'?'https://family.example':null);assert.equal(calls.at(-1).options.headers.get('Content-Type'),null,'Multipart requests must keep the generated boundary.');
 const stale=exports.apiFetch('/api/stale');await exports.clearNativeSession();await exports.signInNative('family code');pending401();await stale;
 assert.equal(exports.hasFamilySession(),true,'An old 401 must not clear a newer sign-in.');
 let expired=0;const unsubscribe=exports.onSessionExpired(()=>expired++);nextStatus=401;
 await exports.apiFetch('/api/speech-status');assert.equal(saved,null);assert.equal(expired,1);assert.equal(exports.nativeAuthHeaders().Authorization,undefined);unsubscribe();
 await exports.apiFetch('/api/speech-status');assert.equal(expired,1,'An already disconnected request must not cause a refresh loop.');
}
async function checkRememberedPhone(){
 const persistent=new Map(),tab=new Map(),key='mejFamilySessionV1';let offlineRenewal=false,renewals=0;
 const oldToken=`${Date.now()+6*86400000}.old.signature`,newToken=`${Date.now()+30*86400000}.new.signature`;
 const storage=map=>({getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)});
 const source=ts.transpileModule(fs.readFileSync('src/nativeSession.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const boot=()=>{const exports={};vm.runInNewContext(source,{exports,process:{env:{EXPO_PUBLIC_API_URL:'https://family.example'}},window:{location:{origin:'https://family.github.io'},localStorage:storage(persistent),sessionStorage:storage(tab)},Headers,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch:async url=>{
  if(url.endsWith('/api/refresh-session')){renewals++;if(offlineRenewal)throw new TypeError('Offline');return {ok:true,status:200,json:async()=>({token:newToken})};}
  return {ok:true,status:200,json:async()=>({ready:true})};
 },require:name=>name==='react-native'?{Platform:{OS:'web'}}:{}});return exports;};
 tab.set(key,oldToken);const first=boot();assert(await first.restoreNativeSession());assert.equal(persistent.get(key),oldToken);assert.equal(tab.size,0,'Existing tab sessions migrate to persistent storage.');
 const reopened=boot();assert(await reopened.restoreNativeSession(),'A new browser tab must restore voice without the family code.');
 await reopened.checkNativeSession();assert.equal(renewals,1);assert.equal(persistent.get(key),newToken,'Remembered phones renew before expiry.');
 persistent.set(key,oldToken);const offline=boot();await offline.restoreNativeSession();offlineRenewal=true;await offline.checkNativeSession();assert(offline.hasFamilySession(),'Temporary renewal failures must preserve sign-in.');
 await offline.clearNativeSession();assert.equal(persistent.size,0);assert.equal(tab.size,0);
}
async function main(){await check('ios');await check('web');await check('web',true);await checkRememberedPhone();console.log('PASS: native Keychain and external-web tab sessions authenticate voice requests, preserve multipart boundaries, and clear expired sessions without refresh loops.');}
main().catch(error=>{console.error(error);process.exitCode=1;});
