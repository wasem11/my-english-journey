import {Platform} from 'react-native';
const build=process.env.EXPO_PUBLIC_WEB_BUILD_ID;
let checking=false;
// Check only on the homepage, never interrupt an active lesson or recording.
export async function checkWebAppUpdate(){
 if(Platform.OS!=='web'||!build||checking||typeof window==='undefined'||!/^\/my-english-journey\/?$/.test(window.location.pathname))return;
 checking=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);
 try{
  const response=await fetch(`/my-english-journey/app-version.json?t=${Date.now()}`,{cache:'no-store',signal:controller.signal});
  if(!response.ok)return;const version=await response.json();
  if(typeof version.build!=='string'||!/^[a-f0-9]{40}$/.test(version.build)||version.build===build)return;
  const url=new URL(window.location.href);
  if(url.searchParams.get('appVersion')===version.build)return;
  url.searchParams.set('appVersion',version.build);window.location.replace(url.toString());
 }catch{/* Keep the current app usable when offline. */}finally{checking=false;clearTimeout(timeout);}
}
