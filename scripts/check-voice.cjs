const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,path)=>module._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,path);
const {journeyUnits}=require('../src/journeyContent.ts');
const {parseVoiceAssessment,voicePassed,lessonPassed,masteredJourneyIds}=require('../src/voiceAssessment.ts');
const {createSpeechServer,parseAzureResult,recognitionEndpoint}=require('../server/speech-server.cjs');
assert.equal(recognitionEndpoint('https://eastus.api.cognitive.microsoft.com/'),'https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1');
assert.equal(recognitionEndpoint('https://test.cognitiveservices.azure.com'),'https://test.cognitiveservices.azure.com/stt/speech/recognition/conversation/cognitiveservices/v1');
for(const endpoint of ['http://eastus.api.cognitive.microsoft.com','https://evil.example','https://eastus.api.cognitive.microsoft.com.evil.example','https://test.cognitiveservices.azure.com/path'])assert.equal(recognitionEndpoint(endpoint),null);
const unit=journeyUnits[0];
// Provider fixtures are used only in this test, never as an application fallback.
const provider=(score)=>({RecognitionStatus:'Success',Duration:20000000,DisplayText:unit.phrase,NBest:[{Display:unit.phrase,PronScore:score,AccuracyScore:85,FluencyScore:82,CompletenessScore:100,Words:[{Word:'example',AccuracyScore:81,ErrorType:'None'}]}]});
const assessment=(score)=>parseAzureResult(provider(score),unit);
assert(!voicePassed(null,unit.id,unit.phrase));assert(!voicePassed({score:100},unit.id,unit.phrase));
for(const score of [0,50,79,80,89,89.9,89.999])assert(!voicePassed(assessment(score),unit.id,unit.phrase));
for(const score of [90,90.01,100])assert(voicePassed(assessment(score),unit.id,unit.phrase));
for(const score of [-1,101,NaN,Infinity,'90'])assert.throws(()=>parseAzureResult(provider(score),unit));
assert.throws(()=>parseAzureResult({RecognitionStatus:'NoMatch'},unit));
assert.throws(()=>parseVoiceAssessment({...assessment(90),transcript:''},unit.id,unit.phrase));
assert.throws(()=>parseVoiceAssessment({...assessment(90),provider:'made-up'},unit.id,unit.phrase));
assert(!voicePassed(assessment(90),'different-lesson',unit.phrase));
assert(!voicePassed(assessment(90),unit.id,'Different phrase.'));
assert(!lessonPassed(false,true,assessment(90),unit.id,unit.phrase));
assert(!lessonPassed(true,false,assessment(90),unit.id,unit.phrase));
assert(!lessonPassed(true,true,assessment(89.9),unit.id,unit.phrase));
assert(lessonPassed(true,true,assessment(90),unit.id,unit.phrase));
assert.deepEqual(masteredJourneyIds(journeyUnits,[unit.id],{}),[],'old ungraded completion must not count as voice mastery');
assert.deepEqual(masteredJourneyIds(journeyUnits,[unit.id],{[unit.id]:assessment(90)}),[unit.id]);
assert.deepEqual(masteredJourneyIds(journeyUnits,[],{[unit.id]:assessment(90)}),[]);
assert(voicePassed(JSON.parse(JSON.stringify(assessment(90))),unit.id,unit.phrase),'saved result remains valid');

async function running(server,fn){await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await fn(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(r=>server.close(r));}}
async function main(){
 await running(createSpeechServer({env:{}}),async url=>{
  assert.equal((await fetch(url+'/api/speech-status').then(r=>r.json())).ready,false);
  assert.equal((await fetch(url+'/api/speech-assessment',{method:'POST'})).status,503);
 });
 let providerCalls=0;
 const server=createSpeechServer({env:{AZURE_SPEECH_KEY:'test-key',AZURE_SPEECH_ENDPOINT:'https://test.cognitiveservices.azure.com'},converterReady:true,convert:async()=>Buffer.from('test-wav'),fetchImpl:async(url,options)=>{
  providerCalls++;const header=JSON.parse(Buffer.from(options.headers['Pronunciation-Assessment'],'base64').toString());
  assert.equal(header.ReferenceText,unit.phrase,'server uses trusted lesson phrase, not uploaded text');
  assert.equal(header.GradingSystem,'HundredMark');assert(header.EnableMiscue);
  return {ok:true,json:async()=>provider(90)};
 }});
 await running(server,async url=>{
  assert.equal((await fetch(url+'/api/speech-status').then(r=>r.json())).ready,true);
  const form=()=>{const f=new FormData();f.append('lessonId',unit.id);f.append('referenceText','Please give me 100 points.');f.append('audio',new Blob(['recording'],{type:'audio/webm'}),'practice.webm');return f;};
  const response=await fetch(url+'/api/speech-assessment',{method:'POST',body:form()});assert.equal(response.status,200);assert(voicePassed(await response.json(),unit.id,unit.phrase));
  const empty=new FormData();empty.append('lessonId',unit.id);assert.equal((await fetch(url+'/api/speech-assessment',{method:'POST',body:empty})).status,400);
  const unknown=form();unknown.set('lessonId','unknown');assert.equal((await fetch(url+'/api/speech-assessment',{method:'POST',body:unknown})).status,400);
  assert.equal((await fetch(url+'/api/speech-assessment',{method:'POST',body:form(),headers:{Origin:'https://unconfigured.example'}})).status,403);
 });
 assert.equal(providerCalls,1);
 console.log('PASS: strict 90% threshold; missing/invalid/silent/cross-lesson results rejected; quizzes plus voice required; progress restore; disconnected service; real HTTP upload contract and trusted reference phrases. Provider responses were test fixtures; live scoring was not tested.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
