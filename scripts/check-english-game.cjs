const assert=require('node:assert/strict');
require('../server/speech-server.cjs');
const {englishLevelProgress}=require('../src/englishLevelProgress.ts');
const {journeyUnits}=require('../src/journeyContent.ts');
const {neighborhoodPlaces,placeMissions}=require('../src/neighborhood.ts');
const {trailLayout,trailPoint}=require('../src/adventureMapGeometry.ts');
const unit=journeyUnits.find(u=>u.area==='english'),empty={selected:null,checked:false},passed={selected:unit.correct,checked:true},wrong={selected:(unit.correct+1)%3,checked:true};
let state=englishLevelProgress(unit,empty,empty,null,false);assert.equal(state.next.id,'listen');assert.deepEqual(state.nodes.map(n=>n.ready),[true,false,false]);
state=englishLevelProgress(unit,wrong,passed,null,false);assert.equal(state.listenDone,true);assert(!state.nodes[2].ready);
state=englishLevelProgress(unit,empty,passed,null,false);assert.equal(state.next.id,'choose');
state=englishLevelProgress(unit,passed,passed,null,false);assert.equal(state.next.id,'speak');assert(!state.complete);
const voice={lessonId:unit.id,referenceText:unit.phrase,assessmentType:'pronunciation',provider:'azure-speech',score:89.9,accuracy:80,fluency:80,completeness:80,transcript:unit.phrase,words:[],assessedAt:'2026-11-06T00:00:00Z'};
assert(!englishLevelProgress(unit,passed,passed,voice,true).complete,'A sub-90% voice score cannot finish a level.');voice.score=90;
assert(!englishLevelProgress(unit,passed,passed,voice,false).complete,'Passing a voice score must still be explicitly saved.');
assert(englishLevelProgress(unit,passed,passed,voice,true).complete);
assert(!englishLevelProgress(unit,passed,passed,{...voice,lessonId:'other'},true).complete);
assert(!englishLevelProgress(unit,wrong,passed,voice,true).complete);
for(const place of neighborhoodPlaces){assert(placeMissions(place).length);for(const width of [320,390,760])for(const font of [1,1.4,2])for(const translated of [false,true]){const layout=trailLayout(font,translated,place.lessons.length);for(let i=0;i<place.lessons.length;i++){const point=trailPoint(i,width,layout.spacing,layout.start);assert(point.x-34>=0&&point.x+34<=width);assert(point.y+34<layout.height);}}}
console.log('PASS: game checkpoints unlock in order; quizzes plus real 90% speech and saving required; 10 world maps use phone-safe DMV trail geometry.');

const {createListeningExercise}=require('../src/listeningExercise.ts');
const texts=new Set(require('../server/narration-texts.cjs').narrationTexts());
for(const lesson of journeyUnits){
 const positions=new Set(),phrases=new Set();
 for(let seed=1;seed<=80;seed++){
  let value=seed;const random=()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296;};
  for(let warmup=0;warmup<8;warmup++)random();
  const exercise=createListeningExercise(lesson,random);positions.add(exercise.correct);phrases.add(exercise.phrase.en);
  assert.notEqual(exercise.phrase.en,lesson.phrase);assert.notEqual(exercise.correct,lesson.correct);
  assert.equal(exercise.choices[exercise.correct].en,exercise.phrase.en);assert(texts.has(exercise.phrase.en),`Narration unavailable: ${lesson.id}: ${exercise.phrase.en}`);
  const start=englishLevelProgress(lesson,empty,empty,null,false,exercise.correct);assert.equal(start.next.id,'listen');
  const heard={selected:exercise.correct,checked:true};const second=englishLevelProgress(lesson,empty,heard,null,false,exercise.correct);assert.equal(second.next.id,'choose');assert(second.nodes[1].ready);assert(!second.nodes[2].ready);
  const third=englishLevelProgress(lesson,{selected:lesson.correct,checked:true},heard,null,false,exercise.correct);assert.equal(third.next.id,'speak');assert(third.nodes[2].ready);
 }
 assert(positions.size>1,`Answer position never varies: ${lesson.id}`);assert(phrases.size>1,`Listening reply never varies: ${lesson.id}`);
}
console.log('PASS: all lessons listen first, choose second, speak third; distinct randomized listening replies and positions have authorized Ava audio.');
