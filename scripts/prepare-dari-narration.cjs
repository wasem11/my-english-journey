// Prepare scripts for a verified Afghan Dari speaker; no synthetic voice fallback.
const fs=require('node:fs'),path=require('node:path');
require('../server/speech-server.cjs'); // Registers the project's TypeScript data loader.
const {journeyUnits}=require('../src/journeyContent.ts');
const rows=[];
for(const unit of journeyUnits){
 const add=(part,text)=>{if(text)rows.push({lessonId:unit.id,title:unit.title,part,text,file:`${unit.id}/${part}.mp3`});};
 add('question',[unit.promptDari,...unit.choices.map((choice,i)=>`${i+1}. ${choice.dari}`)].join('\n'));
 add('explanation',unit.explainDari);add('phrase',unit.phraseDari);
 for(const [i,line] of (unit.dialogue||[]).entries())add(`dialogue-${i+1}`,line.dari);
}
const target=path.resolve(__dirname,'../output/dari-narration');fs.mkdirSync(target,{recursive:true});
const quote=value=>'"'+String(value).replaceAll('"','""')+'"';
fs.writeFileSync(path.join(target,'recording-script.csv'),'\uFEFF'+[['Lesson ID','English lesson title','Part','Afghan Dari narration','Audio filename'],...rows.map(row=>[row.lessonId,row.title,row.part,row.text,row.file])].map(row=>row.map(quote).join(',')).join('\r\n'));
fs.writeFileSync(path.join(target,'recording-script.json'),JSON.stringify({language:'fa-AF',accent:'Afghan Dari only',accentVerified:false,segments:rows},null,2));
console.log(`Prepared ${rows.length} narration segments for ${journeyUnits.length} lessons. No audio generated; native accent review is required.`);
