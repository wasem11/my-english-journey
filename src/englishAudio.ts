import {Platform} from 'react-native';
import {Audio as ExpoAudio} from 'expo-av';
import {nativeAuthHeaders,EXTERNAL_WEB_API,apiFetch,hasFamilySession,requestVoiceAccess} from './nativeSession';

const API=(process.env.EXPO_PUBLIC_API_URL||(Platform.OS==='web'&&typeof window!=='undefined'?window.location.origin:'')).replace(/\/$/,'');
type PlaybackHooks={onStart?:()=>void;onEnd?:()=>void};
class PlaybackError extends Error {}
let context:AudioContext|null=null,webSource:AudioBufferSourceNode|null=null,nativePlayer:ExpoAudio.Sound|null=null,generation=0;
let playbackEnded:(()=>void)|null=null;

// Resume sound during the Listen tap, before awaiting a network download.
function prepareWebAudio():Promise<AudioContext>{
 const AudioContextClass=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!AudioContextClass)return Promise.reject(new PlaybackError('This browser cannot play lesson audio. Open this page in Safari or Chrome.'));
 if(!context||context.state==='closed')context=new AudioContextClass();
 const current=context;
 const session=(navigator as unknown as {audioSession?:{type:string}}).audioSession;
 if(session){try{session.type='playback';}catch{/* Unsupported audio session setting. */}}
 return current.state==='running'?Promise.resolve(current):current.resume().then(()=>current);
}
export async function stopEnglishAudio(){
 const ended=playbackEnded;playbackEnded=null;ended?.();generation++;
 const source=webSource;webSource=null;if(source){source.onended=null;try{source.stop();}catch{/* Already stopped. */}source.disconnect();}
 const current=nativePlayer;nativePlayer=null;if(current)await current.unloadAsync().catch(()=>{});
}
export async function speakEnglish(text:string,hooks:PlaybackHooks={}){
 // This must stay above the first await: Safari ties sound permission to the tap.
 const ready=Platform.OS==='web'?prepareWebAudio():null;
 const stopping=stopEnglishAudio(),attempt=generation;
 let finished=false;
 const ended=()=>{if(!finished&&attempt===generation){finished=true;playbackEnded=null;hooks.onEnd?.();}};
 try{
  const audioContext=ready?await ready:null;
  await stopping;if(attempt!==generation)return;
  if(!API)throw new PlaybackError('Ava needs a connection to the voice service. Please open the online app and try again.');
  playbackEnded=ended;
  const path=`/api/narration?v=ava2&text=${encodeURIComponent(text)}`;
  if(Platform.OS==='web'&&audioContext){
   if(EXTERNAL_WEB_API&&!hasFamilySession()){requestVoiceAccess();throw new PlaybackError('Enter your family code in Connect voice, then tap Listen again.');}
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
   let response:Response;
   try{response=await apiFetch(path,{signal:controller.signal});}finally{clearTimeout(timeout);}
   if(attempt!==generation)return;
   if(!response.ok){
    if(response.status===401){if(EXTERNAL_WEB_API)requestVoiceAccess();throw new PlaybackError(EXTERNAL_WEB_API?'Your voice sign-in expired. Connect voice with your family code, then tap Listen again.':'Your sign-in expired. Reload the app and enter your family code.');}
    const details=await response.json().catch(()=>null);
    throw new PlaybackError(typeof details?.error==='string'?details.error.slice(0,300):`The voice service could not play this line (${response.status}). Please try again.`);
   }
   if(!response.headers.get('content-type')?.includes('audio/'))throw new PlaybackError('The voice service returned an invalid recording. Please try another Listen button.');
   const audio=await audioContext.decodeAudioData(await response.arrayBuffer());
   if(attempt!==generation)return;
   if(audioContext.state!=='running')throw new PlaybackError('Your browser paused sound. Tap Listen again to enable it.');
   const source=audioContext.createBufferSource();source.buffer=audio;source.connect(audioContext.destination);source.onended=()=>{source.disconnect();if(webSource===source)webSource=null;ended();};webSource=source;source.start();hooks.onStart?.();
  }else{
   const {sound}=await ExpoAudio.Sound.createAsync({uri:API+path,headers:nativeAuthHeaders()},{shouldPlay:false});
   if(attempt!==generation){await sound.unloadAsync();return;}nativePlayer=sound;sound.setOnPlaybackStatusUpdate?.(status=>{if(status.isLoaded&&status.didJustFinish)ended();});await sound.playAsync();if(attempt===generation&&!finished)hooks.onStart?.();
  }
 }catch(error){
  ended();if(attempt!==generation)return;
  if(error instanceof PlaybackError)throw error;
  const name=error instanceof Error?error.name:'';
  if(name==='NotAllowedError')throw new Error('Your browser blocked sound. Tap Listen again to enable it.');
  if(name==='AbortError')throw new Error('The voice service took too long to respond. Please tap Listen again.');
  if(name==='EncodingError')throw new Error('The recording could not be decoded. Please try another Listen button.');
  throw new Error('Could not reach or play the voice service. Check your connection and tap Listen again.');
 }
}
