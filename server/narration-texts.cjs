const fs=require('node:fs'),path=require('node:path');
function buildNarrationTexts(){
 const {journeyUnits}=require('../src/journeyContent.ts');
 const {lessons}=require('../src/lessons.ts');
 const {adventureLevels,orderedRound}=require('../src/dmvAdventure.ts');
 const texts=journeyUnits.flatMap(unit=>[unit.prompt,unit.phrase,...(unit.dialogue||[]).map(line=>line.en)]);
 texts.push(...lessons.flatMap(lesson=>[lesson.scene,lesson.sample]),'Correct! Great driving.','Keep learning. Read the explanation.');
 adventureLevels.forEach((level,index)=>{
  texts.push(`Level ${index+1}. ${level.title}`);
  level.rounds.forEach(raw=>{const round=orderedRound(raw);texts.push(round.prompt,`${round.prompt} ${round.choices.map((choice,i)=>`${String.fromCharCode(65+i)}. ${choice.en}`).join('. ')}`);});
 });
 return [...new Set(texts)];
}
function narrationTexts(){const snapshot=path.join(__dirname,'narration-texts.json');return fs.existsSync(snapshot)?JSON.parse(fs.readFileSync(snapshot,'utf8')):buildNarrationTexts();}
module.exports={narrationTexts,buildNarrationTexts};
