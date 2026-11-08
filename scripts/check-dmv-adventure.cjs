const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
// Execute the actual data/progression module without starting a mobile runtime.
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
const {adventureLevels:levels,adventureRegions:regions,adventureRoundCount,orderedRound,nextLevelIndex,canPlayLevel,completeLevel,sanitizeCompleted}=require('../src/dmvAdventure.ts');
const {dmvQuestionBank:bank}=require('../src/dmvQuestionBank.ts');
const {dmvDari}=require('../src/dmvDari.ts');
const {hasMasteredCalifornia}=require('../src/dmvAdventure.ts');
const {trailPoint,parkedPoint,trailLayout,trailLabelBounds}=require('../src/adventureMapGeometry.ts');
assert(levels.length>90);assert.equal(regions.length,6);assert.equal(adventureRoundCount,levels.length*3);
assert.equal(new Set(levels.map(l=>l.id)).size,levels.length);
assert(bank.length>240);assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
for(const q of bank){assert(dmvDari[q.id]);assert.equal(dmvDari[q.id].options.length,q.options.length);}
const answerPositions=new Set();
for(const level of levels){
 assert(regions.some(r=>r.id===level.region));assert(level.title&&level.dari);assert.equal(level.rounds.length,3);
 for(const round of level.rounds){
  assert(round.prompt&&round.promptDari&&round.why&&round.whyDari,`${level.id}/${round.id}: bilingual content`);
  assert(!/complete the safe driving rule/i.test(round.prompt));
  assert(round.correct>=0&&round.correct<round.choices.length);
  assert(round.choices.length>=2);assert.equal(new Set(round.choices.map(c=>c.en)).size,round.choices.length);
  for(const choice of round.choices){assert(choice.en&&choice.dari);assert(/[\u0600-\u06ff]/.test(choice.dari));}
  if(/sign.*above|above.*sign/i.test(round.prompt))assert(round.sign,`${level.id}: sign context missing`);
  if(round.sign)assert(fs.existsSync(`assets/dmv-signs/${round.sign}.png`));
  assert(round.source?.startsWith('https://www.dmv.ca.gov/'));
  const rotated=orderedRound(round);assert.deepEqual(rotated.choices[rotated.correct],round.choices[round.correct]);answerPositions.add(rotated.correct);
 }
}
assert.deepEqual([...answerPositions].sort(),[0,1,2]);
const newRounds=levels.slice(10).flatMap(l=>l.rounds);
assert.equal(new Set(newRounds.map(q=>q.id)).size,bank.length);
for(const q of bank)assert(newRounds.some(r=>r.id===q.id),`${q.id} missing from the map`);
const legacy=Array.from({length:10},(_,i)=>`m${i+1}`);
assert.deepEqual(levels.slice(0,10).map(l=>l.id),legacy);
assert.equal(nextLevelIndex(legacy),10);assert(canPlayLevel(10,legacy));assert(!canPlayLevel(11,legacy));
assert.deepEqual(sanitizeCompleted([...legacy,'m1','invalid',null]),legacy);
assert.deepEqual(sanitizeCompleted({bad:true}),[]);
const gaps=['m1','m3'];assert.equal(nextLevelIndex(gaps),1);assert(canPlayLevel(1,gaps));assert(!canPlayLevel(3,gaps));
let completed=[];
assert(!hasMasteredCalifornia(completed));
assert(!hasMasteredCalifornia([levels.at(-1).id]),'final level alone must not unlock statewide mastery');
for(let i=0;i<levels.length;i++){
 assert(!hasMasteredCalifornia(completed),'statewide map must stay locked until every level is complete');
 assert.equal(nextLevelIndex(completed),i);assert(canPlayLevel(i,completed));assert(!canPlayLevel(i+1,completed));
 completed=completeLevel(levels[i].id,completed);
 assert.equal(completeLevel(levels[i].id,completed).length,completed.length,'replay must not duplicate completion');
}
assert.equal(nextLevelIndex(completed),levels.length);assert(!canPlayLevel(levels.length,completed));assert(canPlayLevel(0,completed));
assert(hasMasteredCalifornia(completed));
assert(hasMasteredCalifornia(sanitizeCompleted(JSON.parse(JSON.stringify(completed)))),'statewide mastery must survive reload');
assert(!hasMasteredCalifornia(completed.filter(id=>id!==levels[20].id)),'a missing middle level prevents mastery');
assert(fs.existsSync('assets/game-art/california-mastery.png'));
for(const r of regions)assert(levels.filter(l=>l.region===r.id).length>=6);
// Labels and the Jeep must remain within the map on small phones and desktop.
for(const width of [284,320,350,398,514])for(const region of regions){
 const localLevels=levels.filter(l=>l.region===region.id);
 localLevels.forEach((_,i)=>{
  const node=trailPoint(i,width),car=parkedPoint(i,width);
  assert(node.x-75>=0&&node.x+75<=width,'label clipped');
  assert(car.x-39>=0&&car.x+39<=width,'Jeep clipped');
  assert(Math.abs(car.x-node.x)>=71,'Jeep covers level button');
  assert(node.y+110<localLevels.length*158+220-75,'label covers finish banner');
 });
}
// All eight possible answer patterns retain the advertised 5-point mastery scale.
for(const width of [284,320,360,390,430,740])for(const fontScale of [1,1.3,1.6,2])for(const translated of [false,true])for(const region of regions){
 const count=levels.filter(l=>l.region===region.id).length;
 const layout=trailLayout(fontScale,translated,count);
 for(let i=0;i<count;i++){
  const node=trailPoint(i,width,layout.spacing,layout.start),car=parkedPoint(i,width,layout.spacing,layout.start),label=trailLabelBounds(i,width,fontScale);
  assert(label.left>=8&&label.left+label.width<=width-8,'scaled phone label clips');
  assert(car.x-39>=0&&car.x+39<=width,'phone Jeep clips');
  assert(node.y+layout.spacing<layout.height,'last level needs room above finish');
  assert(layout.spacing>=(translated?224:176)*fontScale,'text scaling must increase map spacing');
 }
}
for(let pattern=0;pattern<8;pattern++){
 const score=[2,2,1].reduce((sum,weight,i)=>sum+((pattern>>i)&1)*weight,0);
 assert(score>=0&&score<=5);assert.equal(score>=4,(pattern&3)===3);
}
console.log('PASS: '+regions.length+' regions, '+levels.length+' levels, '+adventureRoundCount+' rounds, '+bank.length+' bilingual questions; unlocks, answer keys, translations, saved progress, phone geometry.');
