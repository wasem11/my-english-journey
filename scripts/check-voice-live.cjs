// Explicit live Azure smoke test. Uses synthetic Windows speech, never learner audio.
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process');
const {createSpeechServer}=require('../server/speech-server.cjs');
const {journeyUnits}=require('../src/journeyContent.ts');
async function main(){
 const hosted=process.argv.includes('--hosted');
 if(!hosted&&!process.env.AZURE_SPEECH_KEY)throw new Error('Configure the private server environment first.');
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'mej-live-check-'));
 const audio=path.join(directory,'sample.wav');
 const unit=journeyUnits[0];
 let server;
 try{
  await new Promise((resolve,reject)=>{
   const child=spawn('powershell.exe',['-NoProfile','-Command',"$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.Speech; $speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speaker.SetOutputToWaveFile($env:MEJ_TEST_AUDIO); $speaker.Speak($env:MEJ_TEST_PHRASE); $speaker.Dispose()"],{windowsHide:true,env:{...process.env,MEJ_TEST_AUDIO:audio,MEJ_TEST_PHRASE:unit.phrase},stdio:'ignore'});
   child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error('Windows sample speech generation failed.')));
  });
  let base,headers={};
  if(hosted){
   const settings=JSON.parse(await fs.readFile('server/.hosting.env','utf8'));base=settings.PUBLIC_ORIGIN;
   const locked=await fetch(base+'/api/speech-status');if(locked.status!==401)throw new Error('Hosted speech API must require family login.');
   const login=await fetch(base+'/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:settings.FAMILY_ACCESS_CODE}),redirect:'manual'});
   if(login.status!==303||!login.headers.get('set-cookie'))throw new Error('Hosted family login failed.');
   headers={Origin:base,Cookie:login.headers.get('set-cookie').split(';')[0]};
   const home=await fetch(base,{headers}).then(r=>r.text());if(!home.includes('manifest.webmanifest'))throw new Error('Phone app manifest is missing.');
  }else{
   server=createSpeechServer({converterReady:true});
   await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
  }
  const status=await fetch(base+'/api/speech-status',{headers}).then(r=>r.json());
  if(!status.ready)throw new Error('Backend configuration is not ready.');
  const form=new FormData();form.append('lessonId',unit.id);form.append('audio',new Blob([await fs.readFile(audio)],{type:'audio/wav'}),'sample.wav');
  const response=await fetch(base+'/api/speech-assessment',{method:'POST',headers,body:form});
  const result=await response.json();
  if(!response.ok)throw new Error(`Live assessment failed (${response.status}): ${result.error}`);
  console.log(JSON.stringify({test:hosted?'Hosted HTTPS login and live assessment of synthetic speech':'Live Azure assessment of synthetic Windows speech',lessonId:unit.id,provider:result.provider,score:result.score,accuracy:result.accuracy,fluency:result.fluency,completeness:result.completeness,wordCount:result.words.length}));
 }finally{
  if(server?.listening)await new Promise(resolve=>server.close(resolve));
  await fs.unlink(audio).catch(()=>{});await fs.rmdir(directory).catch(()=>{});
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
