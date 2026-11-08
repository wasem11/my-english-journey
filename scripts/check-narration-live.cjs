const fs=require('node:fs/promises');
const {createSpeechServer}=require('../server/speech-server.cjs');
const {journeyUnits}=require('../src/journeyContent.ts');
const {adventureLevels,orderedRound}=require('../src/dmvAdventure.ts');
const {VOICE}=require('../server/narration.cjs');
const {VOICE_TARGET}=require('../src/voiceAssessment.ts');
async function main(){
 let server,base,headers={};
 try{
  if(process.argv.includes('--hosted')){
   const settings=JSON.parse(await fs.readFile('server/.hosting.env','utf8'));base=settings.PUBLIC_ORIGIN;
   const locked=await fetch(base+'/api/narration?text='+encodeURIComponent(journeyUnits[0].phrase));if(locked.status!==401)throw new Error('Narration must require family login.');
   const login=await fetch(base+'/login',{method:'POST',headers:{Origin:base},body:new URLSearchParams({code:settings.FAMILY_ACCESS_CODE}),redirect:'manual'});
   if(login.status!==303)throw new Error('Family login failed.');headers={Cookie:login.headers.get('set-cookie').split(';')[0]};
   const mobileLogin=await fetch(base+'/api/mobile-session',{method:'POST',headers:{Origin:base},body:new URLSearchParams({code:settings.FAMILY_ACCESS_CODE})});
   if(!mobileLogin.ok)throw new Error('Native family login failed.');
   const mobileSession=await mobileLogin.json(),mobileHeaders={Authorization:'Bearer '+mobileSession.token};
   const mobileStatus=await fetch(base+'/api/speech-status',{headers:mobileHeaders});
   if(!mobileStatus.ok||(await mobileStatus.json()).target!==VOICE_TARGET)throw new Error('Native speech access failed.');
   const mobileAudio=await fetch(base+'/api/narration?v=jenny-slow-v1&text='+encodeURIComponent(journeyUnits[0].phrase),{headers:mobileHeaders,signal:AbortSignal.timeout(45000)});
   if(!mobileAudio.ok||!mobileAudio.headers.get('content-type')?.includes('audio/mpeg'))throw new Error('Native narration access failed.');
   await mobileAudio.arrayBuffer();console.log('Native family sign-in, private speech access, and Jenny narration verified.');
  }else{server=createSpeechServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
  if(!server){
   const home=await fetch(base+'/?update=jenny-slow-v1',{headers});if(home.headers.get('cache-control')!=='no-store')throw new Error('Old-page caching is still enabled.');
   const html=await home.text(),expected=(await fs.readFile('output/azure-app/web/index.html','utf8')).match(/entry-[a-z0-9]+\.js/)?.[0];
   if(!expected||!html.includes(expected))throw new Error('The current frontend build is not live yet.');
   if(!html.includes('crossorigin="use-credentials"'))throw new Error('The private app manifest must request the family session.');
   const manifest=await fetch(base+'/manifest.webmanifest',{headers});
   if(!manifest.ok||!manifest.headers.get('content-type')?.includes('application/manifest+json'))throw new Error('Phone installation manifest is not served correctly.');
   if((await manifest.json()).display!=='standalone')throw new Error('Phone app display mode is missing.');
   console.log('Current frontend build, no-store HTML, and private phone installation manifest verified.');
  }
  const status=await fetch(base+'/api/speech-status',{headers}).then(r=>r.json());
  if(status.target!==VOICE_TARGET)throw new Error('The live speaking target does not match the app.');
  console.log(`Speaking target verified: ${VOICE_TARGET}%.`);
  const response=await fetch(base+'/api/narration?v=jenny-slow-v1&text='+encodeURIComponent(journeyUnits[0].phrase),{headers,signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`Narration returned ${response.status}`);
  const audio=Buffer.from(await response.arrayBuffer());await fs.mkdir('output',{recursive:true});await fs.writeFile('output/human-english-sample.mp3',audio);
  if(response.headers.get('x-narration-voice')!==VOICE)throw new Error('The previous English voice is still running.');
  console.log(JSON.stringify({test:'Actual neural English narration',hosted:!server,voice:response.headers.get('x-narration-voice'),type:response.headers.get('content-type'),bytes:audio.length,sample:'output/human-english-sample.mp3'}));
  const round=orderedRound(adventureLevels[0].rounds[0]);
  const dmvText=`${round.prompt} ${round.choices.map((choice,i)=>`${String.fromCharCode(65+i)}. ${choice.en}`).join('. ')}`;
  const dmv=await fetch(base+'/api/narration?v=jenny-slow-v1&text='+encodeURIComponent(dmvText),{headers,signal:AbortSignal.timeout(45000)});
  if(!dmv.ok||dmv.headers.get('x-narration-voice')!==VOICE)throw new Error(`DMV voice verification failed (${dmv.status}).`);
  const dmvAudio=Buffer.from(await dmv.arrayBuffer());await fs.writeFile('output/human-dmv-sample.mp3',dmvAudio);
  console.log(JSON.stringify({test:'Actual DMV question and choices narration',voice:VOICE,bytes:dmvAudio.length,sample:'output/human-dmv-sample.mp3'}));
  const social=journeyUnits.find(unit=>unit.id==='community-checkout');
  const character=await fetch(base+'/api/narration?v=jenny-slow-v1&text='+encodeURIComponent(social.dialogue[0].en),{headers,signal:AbortSignal.timeout(45000)});
  if(!character.ok||character.headers.get('x-narration-voice')!==VOICE)throw new Error(`Conversation character narration failed (${character.status}).`);
  const characterAudio=Buffer.from(await character.arrayBuffer());
  if(characterAudio.length<500)throw new Error('Conversation speech sample is empty.');
  console.log(JSON.stringify({test:'Actual conversation character dialogue',voice:VOICE,bytes:characterAudio.length}));
 }finally{if(server?.listening)await new Promise(r=>server.close(r));}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
