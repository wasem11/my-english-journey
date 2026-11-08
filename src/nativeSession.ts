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
export async function restoreNativeSession(){token=Platform.OS==='web'?window.sessionStorage.getItem(SESSION_KEY):await SecureStore.getItemAsync(SESSION_KEY);return !!token;}
export async function clearNativeSession(){const hadToken=!!token;token=null;if(Platform.OS==='web')window.sessionStorage.removeItem(SESSION_KEY);else await SecureStore.deleteItemAsync(SESSION_KEY);if(hadToken){listeners.forEach(listener=>listener());changed.forEach(listener=>listener());}}
export async function apiFetch(path:string,options:RequestInit={}){
 const headers=new Headers(options.headers);
 for(const [key,value] of Object.entries(nativeAuthHeaders()))headers.set(key,value);
 if(Platform.OS!=='web'&&options.method&&options.method!=='GET')headers.set('Origin',API_URL);
 const response=await fetch(`${API_URL}${path}`,{...options,headers});
 if(response.status===401&&bearerSession)await clearNativeSession();
 return response;
}
export async function checkNativeSession(){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
 try{return await apiFetch('/api/speech-status',{signal:controller.signal});}finally{clearTimeout(timeout);}
}
export async function signInNative(code:string){
 if(!/^https:\/\//.test(API_URL))throw new Error('The app’s secure voice service has not been configured.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(`${API_URL}/api/mobile-session`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',...(Platform.OS!=='web'?{Origin:API_URL}:{})},body:new URLSearchParams({code}).toString(),signal:controller.signal});
  const result=await response.json();
  if(!response.ok||typeof result.token!=='string')throw new Error(result.error||'Could not sign in. Please try again.');
  if(Platform.OS==='web')window.sessionStorage.setItem(SESSION_KEY,result.token);else await SecureStore.setItemAsync(SESSION_KEY,result.token);token=result.token;changed.forEach(listener=>listener());
 }finally{clearTimeout(timeout);}
}
