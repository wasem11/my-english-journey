const assert=require('node:assert/strict');
require('../server/speech-server.cjs');
const {microphoneError}=require('../src/microphoneError.ts');
for(const [name,expected] of [['NotAllowedError','Website Settings'],['NotReadableError','End any call'],['NotFoundError','No microphone'],['SecurityError','secure app link']]){
 const error=new Error('hidden provider error');error.name=name;assert(microphoneError(error,true).includes(expected));
}
assert.equal(microphoneError(new Error('Native permission instructions'),false),'Native permission instructions');
const source=require('node:fs').readFileSync('src/VoiceChallenge.tsx','utf8');
const web=source.slice(source.indexOf("const options ="),source.indexOf('} else {',source.indexOf('const options =')));
assert(web.includes('current.prepareToRecordAsync(options)'));assert(!web.includes('requestPermissionsAsync'));
assert(web.indexOf('current.prepareToRecordAsync(options)')<web.indexOf('stopEnglishAudio()'));
console.log('PASS: browser capture requests the microphone once during the tap; permission, unavailable-device, busy-device and native errors retain distinct recovery instructions.');
