// Keep the cloud update's API address and environment identical to the iPhone build.
const {spawnSync}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),profile=require('../eas.json').build.production;
const message=process.argv.slice(2).join(' ').trim();
if(!message){console.error('Usage: npm run update:ios -- "Describe the tested change"');process.exit(1);}
if(!process.env.npm_execpath){console.error('Run this command through npm run update:ios.');process.exit(1);}
const env={...process.env,...profile.env,EAS_NO_VCS:'1',EAS_PROJECT_ROOT:root};
for(const check of ['check-conversations.cjs','check-voice.cjs','check-rewards.cjs']){
 const result=spawnSync(process.execPath,[path.join(__dirname,check)],{cwd:root,env,stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
const typecheck=spawnSync(process.execPath,[require.resolve('typescript/bin/tsc'),'--noEmit'],{cwd:root,env,stdio:'inherit'});
if(typecheck.status!==0)process.exit(typecheck.status||1);
const result=spawnSync(process.execPath,[process.env.npm_execpath,'exec','--yes','--package=eas-cli@latest','--','eas','update','--channel',profile.channel,'--platform','ios','--environment','production','--message',message,'--non-interactive'],{cwd:root,env,stdio:'inherit'});
if(result.error){console.error(result.error.message);process.exit(1);}
process.exit(result.status===null?1:result.status);
