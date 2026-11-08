export function microphoneError(error:unknown,web:boolean){
 const name=error&&typeof error==='object'&&'name' in error?String(error.name):'';
 if(web){
  if(name==='NotAllowedError'||name==='PermissionDeniedError')return 'Microphone permission is blocked. On iPhone, open this page in Safari, open the page menu beside the address, then Website Settings and set Microphone to Allow. Reload and tap Record again. If you opened a link inside another app, open it in Safari first.';
  if(name==='NotFoundError'||name==='DevicesNotFoundError')return 'No microphone was found. Connect or enable a microphone, then tap Record again.';
  if(name==='NotReadableError'||name==='TrackStartError'||name==='AbortError')return 'Your microphone could not start. End any call or recording in another app, then tap Record again.';
  if(name==='SecurityError')return 'This browser blocked microphone access. Open the secure app link directly in Safari or Chrome and allow the microphone.';
 }
 return error instanceof Error?error.message:'Could not start recording. Please try again.';
}
