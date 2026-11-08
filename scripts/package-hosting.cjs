// Explicit allowlist: no .env files or Azure keys are included in the deployment.
const fs=require('node:fs/promises'),path=require('node:path');
async function main(){
 const root=path.resolve(__dirname,'..'),destination=path.join(root,'output/azure-app');
 await fs.mkdir(destination,{recursive:true});
 for(const file of ['server/speech-server.cjs','server/hosted-server.cjs','server/narration.cjs','server/narration-texts.cjs','src/journeyContent.ts','src/voiceAssessment.ts','src/familyEnglish.ts','src/socialDialogues.ts','src/communityConversations.ts','src/lessons.ts']){
  const target=path.join(destination,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(root,file),target);
 }
 require('../server/speech-server.cjs');
 const {buildNarrationTexts}=require('../server/narration-texts.cjs');
 await fs.writeFile(path.join(destination,'server/narration-texts.json'),JSON.stringify(buildNarrationTexts()));
 await fs.cp(path.join(root,'output/hosted-web'),path.join(destination,'web'),{recursive:true});
 const web=path.join(destination,'web');
 await fs.writeFile(path.join(web,'app-icon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="#204E40"/><path d="M45 62 Q72 48 96 65 Q120 48 147 62 V133 Q120 119 96 136 Q72 119 45 133 Z" fill="white"/><path d="M96 65 V136" stroke="#DAF17A" stroke-width="7"/></svg>');
 await fs.writeFile(path.join(web,'manifest.webmanifest'),JSON.stringify({name:'My English Journey',short_name:'My Journey',start_url:'/',scope:'/',display:'standalone',background_color:'#F8F7EF',theme_color:'#204E40',icons:[{src:'/app-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]}));
 const html=await fs.readFile(path.join(web,'index.html'),'utf8');
 await fs.writeFile(path.join(web,'index.html'),html.replace('</head>','<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials"><meta name="theme-color" content="#204E40"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="My Journey"></head>'));
 await fs.writeFile(path.join(destination,'package.json'),JSON.stringify({name:'myenglishjourney-hosted',version:'1.0.0',private:true,engines:{node:'>=22'},scripts:{start:'node server/hosted-server.cjs'},dependencies:{typescript:'5.9.2','ffmpeg-static':'5.3.0'}},null,2));
 console.log('Prepared output/azure-app using an explicit file allowlist. Credentials are not included.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
