const fs=require('node:fs/promises'),path=require('node:path'),{spawnSync}=require('node:child_process');
async function main(){
 const root=path.resolve(__dirname,'..'),out=path.join(root,'output/github-pages'),base='/my-english-journey/';
 const env={...process.env,EXPO_NO_DOTENV:'1',MEJ_GITHUB_PAGES:'1',EXPO_PUBLIC_API_URL:'https://myenglishjourney-family-1105.azurewebsites.net'};
 const result=spawnSync(process.execPath,[path.join(root,'node_modules/expo/bin/cli'),'export','--platform','web','--output-dir',out],{cwd:root,env,stdio:'inherit'});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
 const html=await fs.readFile(path.join(out,'index.html'),'utf8');
 const prepared=html.replace('</head>',`<link rel="manifest" href="${base}manifest.webmanifest"><link rel="apple-touch-icon" href="${base}app-icon.png"><meta name="theme-color" content="#204E40"><meta name="apple-mobile-web-app-capable" content="yes"></head>`);
 await fs.writeFile(path.join(out,'index.html'),prepared);
 await fs.writeFile(path.join(out,'404.html'),prepared);
 await fs.writeFile(path.join(out,'.nojekyll'),'');
 await fs.copyFile(path.join(root,'assets/app-icon.png'),path.join(out,'app-icon.png'));
 await fs.writeFile(path.join(out,'manifest.webmanifest'),JSON.stringify({name:'My English Journey',short_name:'My Journey',start_url:base,scope:base,display:'standalone',background_color:'#F8F7EF',theme_color:'#204E40',icons:[{src:`${base}app-icon.png`,sizes:'1024x1024',type:'image/png',purpose:'any'}]}));
 if(!prepared.includes(base+'_expo/'))throw new Error('The Pages bundle must use the repository base path.');
 console.log('GitHub Pages mobile web export prepared in output/github-pages.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
