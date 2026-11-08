const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(api,os='ios',external=false,options={}){
 const played=[],exports={},fetched=[],order=[],sources=[],audioSession={type:'playback'};let handler,gesture=true,accessRequests=0;
 const response={ok:!options.status||options.status===200,status:options.status||200,headers:{get:()=> 'audio/mpeg'},arrayBuffer:async()=>new ArrayBuffer(8),json:async()=>({error:options.error||'Voice allowance reached.'})};
 class BrowserAudioContext{
  state='suspended';destination={};
  constructor(){order.push('create context');}
  resume(){assert(gesture,'Sound must be resumed during the tap, before awaiting the audio download.');order.push('resume');this.state='running';return Promise.resolve();}
  async decodeAudioData(){if(options.decodeError){const e=new Error('Invalid audio');e.name='EncodingError';throw e;}order.push('decode');return {length:22050,numberOfChannels:1};}
  createBufferSource(){const source={buffer:null,onended:null,connect(){},disconnect(){},stop(){},start(){order.push('start');played.push('decoded Ava recording');}};sources.push(source);return source;}
 }
 const source=ts.transpileModule(fs.readFileSync('src/englishAudio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,Error,process:{env:{EXPO_PUBLIC_API_URL:api}},encodeURIComponent,AbortController,setTimeout,clearTimeout,navigator:{audioSession},window:{location:{origin:'https://family.example'},AudioContext:BrowserAudioContext},require(name){
  if(name==='react-native')return {Platform:{OS:os}};
  if(name==='./nativeSession')return {EXTERNAL_WEB_API:external,hasFamilySession:()=>options.session!==false,requestVoiceAccess:()=>accessRequests++,nativeAuthHeaders:()=>({Authorization:'Bearer test-session'}),apiFetch:async (p,request)=>{order.push('fetch');fetched.push(p);return options.fetchImpl?options.fetchImpl(response,request):response;}};
  if(name==='expo-av')return {Audio:{Sound:{createAsync:async(input)=>({sound:{setOnPlaybackStatusUpdate:callback=>{handler=callback;},playAsync:async()=>played.push(input.uri),unloadAsync:async()=>{}}})}}};
  throw new Error('Unexpected audio provider: '+name);
 }});
 return {exports,played,fetched,order,audioSession,get accessRequests(){return accessRequests;},releaseGesture:()=>{gesture=false;},finish:()=>os==='web'?sources.at(-1).onended?.():handler?.({isLoaded:true,didJustFinish:true})};
}
async function main(){
 const offline=load('');await assert.rejects(offline.exports.speakEnglish('Hello.'),/Ava needs a connection/);assert.equal(offline.played.length,0);
 const online=load('https://family.example');await online.exports.speakEnglish('Hello.');assert(online.played[0].startsWith('https://family.example/api/narration?v=ava2&text='));
 const pages=load('https://family.example','web',true);const tapped=pages.exports.speakEnglish('Hello.');assert.deepEqual(pages.order,['create context','resume'],'Resume must occur synchronously, before the handler yields.');pages.releaseGesture();await tapped;assert.deepEqual(pages.order,['create context','resume','fetch','decode','start']);assert.equal(pages.played.length,1);
 assert.equal(pages.audioSession.type,'auto');await pages.exports.prepareEnglishRecording();assert.equal(pages.audioSession.type,'play-and-record','Recording must switch Safari away from playback-only before capture.');
 const locked=load('https://family.example','web',true,{session:false});await assert.rejects(locked.exports.speakEnglish('Hello.'),/family code/);assert.equal(locked.accessRequests,1);assert.equal(locked.fetched.length,0);
 const expired=load('https://family.example','web',true,{status:401});await assert.rejects(expired.exports.speakEnglish('Hello.'),/sign-in expired/);assert.equal(expired.accessRequests,1);
 const limited=load('https://family.example','web',true,{status:429,error:'Monthly voice allowance reached.'});await assert.rejects(limited.exports.speakEnglish('Hello.'),/Monthly voice allowance reached/);
 assert.equal(limited.fetched.length,1,'Quota errors must never trigger automatic retries.');
 let requests=0;const recovered=load('https://family.example','web',true,{fetchImpl:async response=>{if(++requests===1)throw new TypeError('Network temporarily unavailable');return response;}});
 await recovered.exports.speakEnglish('Hello.');assert.equal(requests,2);assert.equal(recovered.played.length,1);
 await recovered.exports.speakEnglish('Hello.');assert.equal(requests,2,'Recently played narration should survive a network interruption without another request.');
 let cancelSignal,downloadEntered;const downloading=new Promise(r=>downloadEntered=r);
 const cancelled=load('https://family.example','web',true,{fetchImpl:(response,request)=>{cancelSignal=request.signal;downloadEntered();return new Promise((resolve,reject)=>request.signal.addEventListener('abort',()=>{const error=new Error('Cancelled');error.name='AbortError';reject(error);}));}});
 const cancelledPlay=cancelled.exports.speakEnglish('Cancel me.');await downloading;await cancelled.exports.stopEnglishAudio();await cancelledPlay;assert.equal(cancelSignal.aborted,true);assert.equal(cancelled.fetched.length,1);assert.equal(cancelled.played.length,0);
 const invalid=load('https://family.example','web',true,{decodeError:true});await assert.rejects(invalid.exports.speakEnglish('Hello.'),/could not be decoded/);
 let release,entered;const fetching=new Promise(r=>{entered=r;});const late=load('https://family.example','web',true,{fetchImpl:response=>{entered();return new Promise(r=>{release=()=>r(response);});}});const pending=late.exports.speakEnglish('Hello.');await fetching;await late.exports.stopEnglishAudio();release();await pending;assert.equal(late.played.length,0,'Leaving a lesson must cancel pending speech.');
 for(const os of ['ios','web']){const talking=load('https://family.example',os),events=[];await talking.exports.speakEnglish('Hello.',{onStart:()=>events.push('start'),onEnd:()=>events.push('end')});assert.deepEqual(events,['start']);talking.finish();talking.finish();assert.deepEqual(events,['start','end']);await talking.exports.speakEnglish('One.',{onStart:()=>events.push('one start'),onEnd:()=>events.push('one end')});await talking.exports.speakEnglish('Two.',{onStart:()=>events.push('two start'),onEnd:()=>events.push('two end')});await talking.exports.stopEnglishAudio();assert.deepEqual(events.slice(2),['one start','one end','two start','two end']);}
 function audit(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())audit(file);else if(/\.tsx?$/.test(file))assert(!/expo-speech|speechSynthesis|Speech\.speak/.test(fs.readFileSync(file,'utf8')),`Device voice bypass remains in ${file}`);}}
 audit('app');audit('src');
 console.log('PASS: mobile sound unlocks during the tap before fetch; sign-in and service errors stay specific; cancelled downloads stay silent; native/web speech animation and Ava-only routing remain correct.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
