import {Platform} from 'react-native';
import {Audio as ExpoAudio} from 'expo-av';
import {nativeAuthHeaders,EXTERNAL_WEB_API,apiFetch} from './nativeSession';

const API=(process.env.EXPO_PUBLIC_API_URL||(Platform.OS==='web'&&typeof window!=='undefined'?window.location.origin:'')).replace(/\/$/,'');
let webPlayer:HTMLAudioElement|null=null,nativePlayer:ExpoAudio.Sound|null=null,generation=0;
type PlaybackHooks={onStart?:()=>void;onEnd?:()=>void};
let playbackEnded:(()=>void)|null=null;
let webObjectUrl:string|null=null;
export async function stopEnglishAudio(){
 const ended=playbackEnded;playbackEnded=null;ended?.();
 generation++;
 if(webPlayer){webPlayer.pause();webPlayer.removeAttribute('src');webPlayer.load();webPlayer=null;}
 if(webObjectUrl){URL.revokeObjectURL(webObjectUrl);webObjectUrl=null;}
 const current=nativePlayer;nativePlayer=null;if(current)await current.unloadAsync().catch(()=>{});
}
export async function speakEnglish(text:string,hooks:PlaybackHooks={}){
 const stopping=stopEnglishAudio(),attempt=generation;await stopping;if(attempt!==generation)return;
 if(!API)throw new Error('Ava needs a connection to the app’s voice service. Please open the online app and try again.');
 const uri=`${API}/api/narration?v=ava2&text=${encodeURIComponent(text)}`;
 let finished=false;
 const ended=()=>{if(!finished&&attempt===generation){finished=true;playbackEnded=null;hooks.onEnd?.();}};
 playbackEnded=ended;
 try{
  if(Platform.OS==='web'){
   let source=uri;
   if(EXTERNAL_WEB_API){const response=await apiFetch(`/api/narration?v=ava2&text=${encodeURIComponent(text)}`);if(!response.ok)throw new Error('Connect voice practice to hear this conversation.');const blob=await response.blob();if(attempt!==generation)return;source=URL.createObjectURL(blob);webObjectUrl=source;}
   const player=new window.Audio(source);webPlayer=player;player.preload='auto';player.onended=ended;player.onerror=ended;await player.play();if(attempt===generation&&!finished)hooks.onStart?.();
  }else{
   const {sound}=await ExpoAudio.Sound.createAsync({uri,headers:nativeAuthHeaders()},{shouldPlay:false});
   if(attempt!==generation){await sound.unloadAsync();return;}nativePlayer=sound;sound.setOnPlaybackStatusUpdate?.(status=>{if(status.isLoaded&&status.didJustFinish)ended();});await sound.playAsync();if(attempt===generation&&!finished)hooks.onStart?.();
  }
 }catch{ended();if(attempt===generation)throw new Error('Could not play the natural voice. Check your connection and tap Listen again.');}
}
