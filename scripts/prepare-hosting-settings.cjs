const fs=require('node:fs'),crypto=require('node:crypto');
const file='server/.hosting.env';
let existing={};if(fs.existsSync(file))existing=JSON.parse(fs.readFileSync(file,'utf8'));
if(!process.env.AZURE_SPEECH_KEY||!/^https:\/\/[^/]+$/.test(process.env.MEJ_PUBLIC_ORIGIN||''))throw new Error('Private speech key and actual hosting origin are required.');
fs.writeFileSync(file,JSON.stringify({
 AZURE_SPEECH_KEY:process.env.AZURE_SPEECH_KEY,AZURE_SPEECH_ENDPOINT:process.env.AZURE_SPEECH_ENDPOINT,
 SESSION_SECRET:existing.SESSION_SECRET||crypto.randomBytes(48).toString('hex'),
 FAMILY_ACCESS_CODE:existing.FAMILY_ACCESS_CODE||crypto.randomBytes(9).toString('base64url'),
 PUBLIC_ORIGIN:process.env.MEJ_PUBLIC_ORIGIN,USAGE_FILE:'/home/data/mej/speech-usage.json',DAILY_SPEECH_LIMIT:'100',
 SCM_DO_BUILD_DURING_DEPLOYMENT:'true',HOST:'0.0.0.0',NODE_ENV:'production'
},null,2));
console.log('Private hosting settings prepared. Values suppressed.');
