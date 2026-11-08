const assert=require('node:assert/strict');
require('../server/speech-server.cjs');
const {englishLevelProgress}=require('../src/englishLevelProgress.ts');
const {journeyUnits}=require('../src/journeyContent.ts');
const {neighborhoodPlaces,placeMissions}=require('../src/neighborhood.ts');
const {trailLayout,trailPoint}=require('../src/adventureMapGeometry.ts');
const unit=journeyUnits.find(u=>u.area==='english'),empty={selected:null,checked:false},passed={selected:unit.correct,checked:true},wrong={selected:(unit.correct+1)%3,checked:true};
let state=englishLevelProgress(unit,empty,empty,null,false);assert.equal(state.next.id,'choose');assert.deepEqual(state.nodes.map(n=>n.ready),[true,false,false]);
state=englishLevelProgress(unit,wrong,passed,null,false);assert.equal(state.listenDone,false);assert(!state.nodes[2].ready);
state=englishLevelProgress(unit,passed,empty,null,false);assert.equal(state.next.id,'listen');
state=englishLevelProgress(unit,passed,passed,null,false);assert.equal(state.next.id,'speak');assert(!state.complete);
const voice={lessonId:unit.id,referenceText:unit.phrase,assessmentType:'pronunciation',provider:'azure-speech',score:89.9,accuracy:80,fluency:80,completeness:80,transcript:unit.phrase,words:[],assessedAt:'2026-11-06T00:00:00Z'};
assert(!englishLevelProgress(unit,passed,passed,voice,true).complete,'A sub-90% voice score cannot finish a level.');voice.score=90;
assert(!englishLevelProgress(unit,passed,passed,voice,false).complete,'Passing a voice score must still be explicitly saved.');
assert(englishLevelProgress(unit,passed,passed,voice,true).complete);
assert(!englishLevelProgress(unit,passed,passed,{...voice,lessonId:'other'},true).complete);
assert(!englishLevelProgress(unit,wrong,passed,voice,true).complete);
for(const place of neighborhoodPlaces){assert(placeMissions(place).length);for(const width of [320,390,760])for(const font of [1,1.4,2])for(const translated of [false,true]){const layout=trailLayout(font,translated,place.lessons.length);for(let i=0;i<place.lessons.length;i++){const point=trailPoint(i,width,layout.spacing,layout.start);assert(point.x-34>=0&&point.x+34<=width);assert(point.y+34<layout.height);}}}
console.log('PASS: game checkpoints unlock in order; quizzes plus real 90% speech and saving required; 10 world maps use phone-safe DMV trail geometry.');
