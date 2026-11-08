import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const API_URL=(process.env.EXPO_PUBLIC_API_URL||(Platform.OS==='web'&&typeof window!=='undefined'?window.location.origin:'')).replace(/\/$/,'');
export const EXTERNAL_WEB_API=Platform.OS==='web'&&typeof window!=='undefined'&&!!API_URL&&API_URL!==window.location.origin;
const bearerSession=Platform.OS!=='web'||EXTERNAL_WEB_API;
const SESSION_KEY='mejFamilySessionV1';
let token:string|null=null;
const listeners=new Set<()=>void>();
const changed=new Set<()=>void>();
const accessRequests=new Set<()=>void>();
export const requestVoiceAccess=()=>accessRequests.forEach(listener=>listener());
export const onVoiceAccessRequested=(listener:()=>void)=>{accessRequests.add(listener);return()=>{accessRequests.delete(listener);};};
export const onSessionChanged=(listener:()=>void)=>{changed.add(listener);return()=>{changed.delete(listener);};};
export const hasFamilySession=()=>!!token;
export const onSessionExpired=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export function nativeAuthHeaders():Record<string,string>{return bearerSession&&token?{Authorization:`Bearer ${token}`} : {};}
// Independent durable storage for installed iPhone web apps when Web Storage fails.
function browserSession(mode:'read'|'write'|'delete',value?:string):Promise<string|null>{
 if(typeof indexedDB==='undefined')return Promise.resolve(null);
 return new Promise(resolve=>{
  let settled=false,db:IDBDatabase|undefined;
  const done=(result:string|null=null)=>{if(settled)return;settled=true;clearTimeout(timeout);db?.close();resolve(result);};
  const timeout=setTimeout(()=>done(),2500);
  try{
   const opening=indexedDB.open('mej-voice-session',1);
   opening.onupgradeneeded=()=>{if(!opening.result.objectStoreNames.contains('session'))opening.result.createObjectStore('session');};
   opening.onerror=()=>done();opening.onblocked=()=>done();
   opening.onsuccess=()=>{
    db=opening.result;if(settled){db.close();return;}
    try{
     const transaction=db.transaction('session',mode==='read'?'readonly':'readwrite'),store=transaction.objectStore('session');
     let result:string|null=null;
     if(mode==='read'){const request=store.get(SESSION_KEY);request.onsuccess=()=>{result=typeof request.result==='string'?request.result:null;};}
     else if(mode==='write')store.put(value,SESSION_KEY);else store.delete(SESSION_KEY);
     transaction.oncomplete=()=>done(result);transaction.onerror=()=>done();transaction.onabort=()=>done();
    }catch{done();}
   };
  }catch{done();}
 });
}
async function saveSession(value:string){
 if(Platform.OS==='web'){
  token=value;
  try{window.localStorage.setItem(SESSION_KEY,value);try{window.sessionStorage.removeItem(SESSION_KEY);}catch{}}
  catch{try{window.sessionStorage.setItem(SESSION_KEY,value);}catch{/* Restricted browsing: retain memory only. */}}
  await browserSession('write',value);
 }else await SecureStore.setItemAsync(SESSION_KEY,value);
 token=value;
}
export async function restoreNativeSession(){
 if(token)return true;
 if(Platform.OS==='web'){
  let saved:string|null=null;
  try{saved=window.localStorage.getItem(SESSION_KEY);}catch{}
  if(!saved){try{saved=window.sessionStorage.getItem(SESSION_KEY);}catch{}}
  if(!saved)saved=await browserSession('read');
  if(saved)await saveSession(saved);
 }else token=await SecureStore.getItemAsync(SESSION_KEY);
 return !!token;
}
export async function clearNativeSession(){
 const hadToken=!!token;token=null;
 if(Platform.OS==='web'){for(const kind of ['localStorage','sessionStorage'] as const){try{window[kind].removeItem(SESSION_KEY);}catch{}}await browserSession('delete');}
 else await SecureStore.deleteItemAsync(SESSION_KEY);
 if(hadToken){listeners.forEach(listener=>listener());changed.forEach(listener=>listener());}
}
export async function apiFetch(path:string,options:RequestInit={}){
 if(bearerSession&&!token)await restoreNativeSession();
 const requestToken=token;
 const headers=new Headers(options.headers);
 for(const [key,value] of Object.entries(nativeAuthHeaders()))headers.set(key,value);
 if(Platform.OS!=='web'&&options.method&&options.method!=='GET')headers.set('Origin',API_URL);
 const response=await fetch(`${API_URL}${path}`,{...options,headers});
 if(response.status===401&&bearerSession&&requestToken===token)await clearNativeSession();
 return response;
}
export async function checkNativeSession(){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
 try{
  const response=await apiFetch('/api/speech-status',{signal:controller.signal});
  const previous=token;
  // Renew well before expiry; a temporary outage must not erase a remembered phone.
  if(response.ok&&previous&&Number(previous.split('.')[0])<Date.now()+7*86400000){
   try{
    const renewal=await apiFetch('/api/refresh-session',{method:'POST',signal:controller.signal});
    const result=renewal.ok?await renewal.json():null;
    if(result&&typeof result.token==='string'&&token===previous)await saveSession(result.token);
   }catch{/* Existing valid session remains usable while renewal is offline. */}
  }
  return response;
 }finally{clearTimeout(timeout);}
}
export async function signInNative(code:string){
 if(!/^https:\/\//.test(API_URL))throw new Error('The app’s secure voice service has not been configured.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`${API_URL}/api/mobile-session`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',...(Platform.OS!=='web'?{Origin:API_URL}:{})},body:new URLSearchParams({code}).toString(),signal:controller.signal});
  const result=await response.json();
  if(!response.ok||typeof result.token!=='string')throw new Error(result.error||'Could not sign in. Please try again.');
  await saveSession(result.token);changed.forEach(listener=>listener());
 }finally{clearTimeout(timeout);}
}
