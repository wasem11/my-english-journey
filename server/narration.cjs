const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const VOICE='en-US-JennyNeural';
const escapeXml=text=>text.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
function narrationEndpoint(endpoint){
 const base=(endpoint||'').trim().replace(/\/$/,'');
 const regional=base.match(/^https:\/\/([a-z0-9]+)\.api\.cognitive\.microsoft\.com$/i);
 if(regional)return `https://${regional[1]}.tts.speech.microsoft.com/cognitiveservices/v1`;
 return /^https:\/\/[a-z0-9-]+\.cognitiveservices\.azure\.com$/i.test(base)?`${base}/tts/cognitiveservices/v1`:null;
}
function createNarration({env,fetchImpl,texts}){
 const endpoint=narrationEndpoint(env.AZURE_SPEECH_ENDPOINT),key=env.AZURE_SPEECH_KEY;
 const allowed=new Set(texts),inflight=new Map(),recent=[];
 const directory=env.NARRATION_CACHE_DIR||path.join(path.dirname(env.USAGE_FILE||path.join(__dirname,'../data/speech-usage.json')),'narration');
 return async function narration(req,res,url){
  if(req.method!=='GET'||url.pathname!=='/api/narration')return false;
  const fail=(status,error)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error}));};
  const text=url.searchParams.get('text');
  if(!text||!allowed.has(text)){fail(400,'Choose a lesson example to hear.');return true;}
  if(!key||!endpoint){fail(503,'Natural voice playback is not connected.');return true;}
  const id=crypto.createHash('sha256').update(VOICE+'-slow-v2:'+text).digest('hex'),file=path.join(directory,id+'.mp3');
  try{
   if(!fs.existsSync(file)){
    if(!inflight.has(id)){
     const job=(async()=>{
      const now=Date.now();while(recent.length&&recent[0]<now-60000)recent.shift();
      if(recent.length>=10){const error=new Error('Please wait a moment, then tap Listen again.');error.status=429;throw error;}
      recent.push(now);fs.mkdirSync(directory,{recursive:true});
      const ssml=`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${VOICE}"><prosody rate="-35%">${escapeXml(text)}</prosody></voice></speak>`;
      const budgetFile=path.join(directory,'monthly-usage.json'),month=new Date().toISOString().slice(0,7);
      let budget={month,characters:0};
      try{const saved=JSON.parse(fs.readFileSync(budgetFile,'utf8'));if(saved.month===month){if(!Number.isInteger(saved.characters)||saved.characters<0)throw new Error('Invalid narration counter');budget=saved;}}catch(error){if(error.code!=='ENOENT')throw error;}
      // Conservatively reserve markup too. Stay below the F0 500,000-character allowance.
      if(budget.characters+ssml.length>400000){const error=new Error('This month’s natural voice allowance has been reached.');error.status=429;throw error;}
      fs.writeFileSync(budgetFile,JSON.stringify({month,characters:budget.characters+ssml.length}));
      const response=await fetchImpl(endpoint,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':key,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3','User-Agent':'MyEnglishJourney'},body:ssml,signal:AbortSignal.timeout(20000)});
      if(!response.ok)throw new Error('The natural voice is temporarily unavailable. Please try again.');
      const audio=Buffer.from(await response.arrayBuffer());if(audio.length<100||audio.length>2*1024*1024)throw new Error('The natural voice recording was not received. Please try again.');
      fs.writeFileSync(file+'.tmp',audio);fs.renameSync(file+'.tmp',file);
     })();inflight.set(id,job);
    }
    try{await inflight.get(id);}finally{inflight.delete(id);}
   }
   const audio=fs.readFileSync(file);res.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':audio.length,'Cache-Control':'private, max-age=86400','X-Narration-Voice':VOICE});res.end(audio);
  }catch(error){fail(error.status||503,/allowance|moment|natural voice/i.test(error.message)?error.message:'Natural voice playback is temporarily unavailable. Please try again.');}
  return true;
 };
}
module.exports={createNarration,narrationEndpoint,VOICE};
