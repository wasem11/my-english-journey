// Local development backend. Speech credentials stay here, never in EXPO_PUBLIC_*.
const http=require('node:http');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const {journeyUnits}=require('../src/journeyContent.ts');
const {lessons}=require('../src/lessons.ts');
const {VOICE_TARGET}=require('../src/voiceAssessment.ts');
const {createNarration}=require('./narration.cjs');
const {narrationTexts}=require('./narration-texts.cjs');
const MAX_BYTES=8*1024*1024;
function ffmpegExecutable(env=process.env){
 if(env.FFMPEG_PATH&&env.FFMPEG_PATH!=='ffmpeg')return env.FFMPEG_PATH;
 try{return require('ffmpeg-static')||'ffmpeg';}catch{return 'ffmpeg';}
}

function convertAudio(audio,ffmpeg){
 return (async()=>{
  const directory=await fsp.mkdtemp(path.join(os.tmpdir(),'mej-voice-'));
  const input=path.join(directory,'recording');
  try{
   await fsp.writeFile(input,audio);
   const pcm=await new Promise((resolve,reject)=>{
    const child=spawn(ffmpeg,['-v','error','-nostdin','-i',input,'-vn','-t','26','-ac','1','-ar','16000','-f','s16le','pipe:1'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
    const chunks=[];let size=0;const timer=setTimeout(()=>{child.kill();reject(new Error('Audio conversion timed out.'));},15000);
    child.stdout.on('data',chunk=>{size+=chunk.length;if(size>16000*2*26){child.kill();}else chunks.push(chunk);});
    child.stderr.resume();
    child.on('error',()=>{clearTimeout(timer);reject(new Error('Audio conversion is unavailable.'));});
    child.on('close',code=>{clearTimeout(timer);code===0?resolve(Buffer.concat(chunks)):reject(new Error('The recording could not be decoded. Please record again.'));});
   });
   if(pcm.length<16000||pcm.length>16000*2*25.5)throw new Error('Please record a phrase between one and 25 seconds.');
   const wav=Buffer.alloc(44+pcm.length);wav.write('RIFF',0);wav.writeUInt32LE(36+pcm.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length,40);pcm.copy(wav,44);return wav;
  }finally{await fsp.unlink(input).catch(()=>{});await fsp.rmdir(directory).catch(()=>{});}
 })();
}
function parseAzureResult(body,lesson){
 const best=body?.NBest?.[0];
 if(body?.RecognitionStatus!=='Success'||!best||(body.Duration||0)>30*10000000)throw new Error('Clear speech was not detected. Please say the full phrase and try again.');
 // REST full-text scores are direct fields; SDK-style nested scores are also accepted.
 const scores=best.PronunciationAssessment||best;
 const value=(key)=>{const n=scores[key];if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>100)throw new Error('The speech provider did not return a valid pronunciation score.');return n;};
 const transcript=best.Display||body.DisplayText||best.Lexical;
 if(typeof transcript!=='string'||!transcript.trim())throw new Error('No speech was recognized. Please try again.');
 return {lessonId:lesson.id,referenceText:lesson.phrase,assessmentType:'pronunciation',provider:'azure-speech',score:value('PronScore'),accuracy:value('AccuracyScore'),fluency:value('FluencyScore'),completeness:value('CompletenessScore'),transcript,assessedAt:new Date().toISOString(),words:(best.Words||[]).map(w=>({word:w.Word,accuracy:(w.PronunciationAssessment||w).AccuracyScore??0,error:(w.PronunciationAssessment||w).ErrorType||'None'}))};
}
function recognitionEndpoint(endpoint){
 const base=(endpoint||'').trim().replace(/\/$/,'');
 if(/^https:\/\/[a-z0-9-]+\.cognitiveservices\.azure\.com$/i.test(base))return `${base}/stt/speech/recognition/conversation/cognitiveservices/v1`;
 const regional=base.match(/^https:\/\/([a-z0-9]+)\.api\.cognitive\.microsoft\.com$/i);
 return regional?`https://${regional[1]}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`:null;
}
function createSpeechServer({env=process.env,fetchImpl=fetch,convert=convertAudio,converterReady=false}={}){
 const endpoint=(env.AZURE_SPEECH_ENDPOINT||'').replace(/\/$/,'');
 const key=env.AZURE_SPEECH_KEY;
 const allowed=new Set((env.ALLOWED_ORIGINS||'http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006').split(',').map(s=>s.trim()));
 const recognitionUrl=recognitionEndpoint(endpoint);
 const ready=!!key&&!!recognitionUrl&&converterReady;
 const narrate=createNarration({env,fetchImpl,texts:narrationTexts()});
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  if(origin&&!allowed.has(origin))return send(403,{error:'This app origin is not configured.'});
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'});res.end();return;}
  const url=new URL(req.url,'http://localhost');
  if(await narrate(req,res,url))return;
  if(req.method==='GET'&&url.pathname==='/api/speech-status')return send(200,{ready,assessmentType:'pronunciation',target:VOICE_TARGET});
  if(req.method!=='POST'||url.pathname!=='/api/speech-assessment')return send(404,{error:'Not found.'});
  if(!ready)return send(503,{error:'Voice scoring is not connected yet.'});
  try{
   const contentType=req.headers['content-type']||'';if(!contentType.startsWith('multipart/form-data;'))return send(415,{error:'Upload a microphone recording.'});
   const chunks=[];let bytes=0;
   for await(const chunk of req){bytes+=chunk.length;if(bytes>MAX_BYTES){send(413,{error:'The recording is too large.'});req.resume();return;}chunks.push(chunk);}
   const form=await new Request('http://localhost/upload',{method:'POST',headers:{'Content-Type':contentType},body:Buffer.concat(chunks)}).formData();
   const id=form.get('lessonId');
   const unit=journeyUnits.find(l=>l.id===id);
   const legacy=lessons.find(l=>l.id===id);
   const lesson=unit||legacy&&{id:legacy.id,phrase:legacy.sample};
   if(!lesson)return send(400,{error:'Unknown speaking lesson.'});
   const file=form.get('audio');if(!file||typeof file.arrayBuffer!=='function'||!file.size||file.size>MAX_BYTES)return send(400,{error:'A nonempty microphone recording is required.'});
   const wav=await convert(Buffer.from(await file.arrayBuffer()),ffmpegExecutable(env));
   const header=Buffer.from(JSON.stringify({ReferenceText:lesson.phrase,GradingSystem:'HundredMark',Granularity:'Word',Dimension:'Comprehensive',EnableMiscue:true})).toString('base64');
   const response=await fetchImpl(`${recognitionUrl}?language=en-US&format=detailed`,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':key,'Pronunciation-Assessment':header,'Content-Type':'audio/wav; codecs=audio/pcm; samplerate=16000',Accept:'application/json'},body:wav,signal:AbortSignal.timeout(25000)});
   if(!response.ok)return send(502,{error:'The speech provider could not score this recording. Please try again later.'});
   return send(200,parseAzureResult(await response.json(),lesson));
  }catch(error){return send(422,{error:error.name==='TimeoutError'?'Voice scoring timed out. Please try again.':/record|speech|phrase|pronunciation|Audio conversion/i.test(error.message)?error.message:'Could not assess the recording. Please try again.'});}
 });
}
if(require.main===module){
 const child=spawn(ffmpegExecutable(),['-version'],{windowsHide:true,stdio:'ignore'});
 let started=false;
 const start=(converterReady)=>{if(started)return;started=true;const server=createSpeechServer({converterReady});const port=Number(process.env.PORT)||3001;server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Voice assessment backend listening on port ${port}. Provider connection ${process.env.AZURE_SPEECH_KEY&&process.env.AZURE_SPEECH_ENDPOINT&&converterReady?'configured':'not configured'}.`));};
 child.on('error',()=>start(false));child.on('close',code=>start(code===0));
}
module.exports={createSpeechServer,parseAzureResult,convertAudio,recognitionEndpoint,ffmpegExecutable};
