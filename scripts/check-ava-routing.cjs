const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(api,os='ios',external=false){
 const played=[],exports={};let handler;const webPlayers=[],fetched=[],revoked=[];
 const source=ts.transpileModule(fs.readFileSync('src/englishAudio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const context={exports,process:{env:{EXPO_PUBLIC_API_URL:api}},encodeURIComponent,URL:{createObjectURL:()=> 'blob:private-voice',revokeObjectURL:u=>revoked.push(u)},window:{location:{origin:'https://family.example'},Audio:class{constructor(uri){this.uri=uri;webPlayers.push(this);}async play(){played.push(this.uri);}pause(){}removeAttribute(){}load(){}}},require(name){
  if(name==='react-native')return {Platform:{OS:os}};
  if(name==='./nativeSession')return {EXTERNAL_WEB_API:external,nativeAuthHeaders:()=>({Authorization:'Bearer test-session'}),apiFetch:async p=>{fetched.push(p);return {ok:true,blob:async()=>({})};}};
  if(name==='expo-av')return {Audio:{Sound:{createAsync:async(input)=>({sound:{setOnPlaybackStatusUpdate:callback=>{handler=callback;},playAsync:async()=>played.push(input.uri),unloadAsync:async()=>{}}})}}};
  throw new Error('Unexpected audio provider: '+name);
 }};
 vm.runInNewContext(source,context);return {exports,played,fetched,revoked,finish:()=>os==='web'?webPlayers.at(-1).onended?.():handler?.({isLoaded:true,didJustFinish:true})};
}
async function main(){
 const offline=load('');await assert.rejects(offline.exports.speakEnglish('Hello.'),/Ava needs a connection/);assert.equal(offline.played.length,0);
 const online=load('https://family.example');await online.exports.speakEnglish('Hello, how are you?');
 assert.equal(online.played.length,1);assert(online.played[0].startsWith('https://family.example/api/narration?v=ava2&text='));
 const pages=load('https://family.example','web',true);await pages.exports.speakEnglish('Hello.');assert.equal(pages.fetched.length,1);assert(pages.fetched[0].startsWith('/api/narration?'));assert.equal(pages.played[0],'blob:private-voice');await pages.exports.stopEnglishAudio();assert.deepEqual(pages.revoked,['blob:private-voice'],'Cross-site audio must release its private audio blob.');
 for(const os of ['ios','web']){const talking=load('https://family.example',os),events=[];await talking.exports.speakEnglish('Hello.',{onStart:()=>events.push('start'),onEnd:()=>events.push('end')});assert.deepEqual(events,['start']);talking.finish();talking.finish();assert.deepEqual(events,['start','end']);await talking.exports.speakEnglish('One.',{onStart:()=>events.push('one start'),onEnd:()=>events.push('one end')});await talking.exports.speakEnglish('Two.',{onStart:()=>events.push('two start'),onEnd:()=>events.push('two end')});await talking.exports.stopEnglishAudio();assert.deepEqual(events.slice(2),['one start','one end','two start','two end'],'Only one character can keep talking; stopping narration must stop the animation.');}
 function audit(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())audit(file);else if(/\.tsx?$/.test(file))assert(!/expo-speech|speechSynthesis|Speech\.speak/.test(fs.readFileSync(file,'utf8')),`Device voice bypass remains in ${file}`);}}
 audit('app');audit('src');
 console.log('PASS: every app voice uses the shared Ava route; unavailable service cannot fall back to a different device voice.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
