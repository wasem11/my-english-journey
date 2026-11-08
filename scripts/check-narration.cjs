const assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {createSpeechServer}=require('../server/speech-server.cjs');
const {journeyUnits}=require('../src/journeyContent.ts');
const {adventureLevels,orderedRound}=require('../src/dmvAdventure.ts');
async function main(){
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'mej-narration-test-'));let calls=0;
 const unit=journeyUnits[0],key='private-test-key';
 const env={AZURE_SPEECH_KEY:key,AZURE_SPEECH_ENDPOINT:'https://eastus.api.cognitive.microsoft.com',NARRATION_CACHE_DIR:directory};
 const server=createSpeechServer({env,fetchImpl:async(url,options)=>{
  calls++;assert.equal(url,'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1');
  assert(options.body.includes('en-US-JennyNeural'));assert(!options.body.includes('express-as'));assert(options.body.includes('rate="-35%"'));
  assert(!options.body.includes('fa-IR'));return {ok:true,arrayBuffer:async()=>Buffer.alloc(256,1)};
 }});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const uri=base+'/api/narration?text='+encodeURIComponent(unit.phrase);
  const responses=await Promise.all([fetch(uri),fetch(uri)]);
  for(const response of responses){assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'audio/mpeg');assert.equal((await response.arrayBuffer()).byteLength,256);}
  assert.equal(calls,1,'parallel requests share synthesis');
  assert.equal((await fetch(uri)).status,200);assert.equal(calls,1,'replays use cache');
  const round=orderedRound(adventureLevels[0].rounds[0]);
  const dmvText=`${round.prompt} ${round.choices.map((choice,i)=>`${String.fromCharCode(65+i)}. ${choice.en}`).join('. ')}`;
  assert.equal((await fetch(base+'/api/narration?text='+encodeURIComponent(dmvText))).status,200,'DMV questions and answers use the same voice');
  assert.equal(calls,2);
  assert.equal((await fetch(base+'/api/narration?text=Unapproved%20text')).status,400);
  assert.equal((await fetch(base+'/api/narration?text='+encodeURIComponent(unit.phraseDari))).status,400,'no unapproved Persian/Dari substitution');
  await fs.writeFile(path.join(directory,'monthly-usage.json'),JSON.stringify({month:new Date().toISOString().slice(0,7),characters:400000}));
  assert.equal((await fetch(base+'/api/narration?text='+encodeURIComponent(unit.prompt))).status,429);
  assert.equal(calls,2);assert.equal((await fetch(uri)).status,200,'cached audio remains usable at quota');
  console.log('PASS: Jenny neural voice for English and DMV, trusted content only, parallel deduplication, cached replay, and persistent monthly generation cap. Provider audio was a test fixture.');
 }finally{await new Promise(r=>server.close(r));for(const file of await fs.readdir(directory))await fs.unlink(path.join(directory,file));await fs.rmdir(directory);}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
