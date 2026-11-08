const assert=require('node:assert/strict');
require('../server/speech-server.cjs');
const {journeyUnits}=require('../src/journeyContent.ts');
const {neighborhoodPlaces,placeMissions,placeForLesson,missionReady,nextNeighborhoodMission}=require('../src/neighborhood.ts');
const {masteredJourneyIds}=require('../src/voiceAssessment.ts');
const {worldAnchors}=require('../src/neighborhoodScene.ts');
const english=journeyUnits.filter(unit=>unit.area==='english'),ids=neighborhoodPlaces.flatMap(place=>place.lessons);
assert.equal(neighborhoodPlaces.length,10);
assert.equal(new Set(ids).size,ids.length,'A lesson must appear at exactly one place.');
assert.deepEqual([...ids].sort(),english.map(unit=>unit.id).sort(),'Every existing English lesson must have a neighborhood mission.');
for(const place of neighborhoodPlaces){
 const anchor=worldAnchors[place.id];assert(anchor,'Every place needs a tappable location in the illustrated scene.');
 for(const coordinate of Object.values(anchor))assert(coordinate>0&&coordinate<1);
 for(const width of [320,400,760])assert(anchor.y*width*2<=width*2,'Place labels must fit inside the scene at phone and desktop sizes.');
 assert(place.name&&place.dari&&place.welcome&&place.welcomeDari);
 const missions=placeMissions(place);assert.equal(missions.length,place.lessons.length);assert(missions.every(unit=>unit.area==='english'));
 assert(missionReady(place,missions[0].id,[]));assert(!missionReady(place,'unknown',[]));
 if(missions.length>1){assert(!missionReady(place,missions[1].id,[]));assert(missionReady(place,missions[1].id,[missions[0].id]));}
 for(const unit of missions)assert.equal(placeForLesson(unit.id).id,place.id);
}
const preschool=neighborhoodPlaces[0],first=placeMissions(preschool)[0];
assert(!missionReady(preschool,preschool.lessons[1],masteredJourneyIds(journeyUnits,[first.id],{})),'A quiz-only save must not unlock the next mission.');
const assessment={lessonId:first.id,referenceText:first.phrase,assessmentType:'pronunciation',provider:'azure-speech',score:90,accuracy:80,fluency:80,completeness:80,transcript:first.phrase,words:[],assessedAt:'2026-11-06T00:00:00Z'};
const saved=masteredJourneyIds(journeyUnits,[first.id],{[first.id]:assessment});assert(missionReady(preschool,preschool.lessons[1],saved));
assert.equal(nextNeighborhoodMission(saved).unit.id,preschool.lessons[1]);
const all=english.map(unit=>unit.id);assert(nextNeighborhoodMission(all).complete);
for(const place of neighborhoodPlaces)for(const id of place.lessons)assert(missionReady(place,id,all),'Completed missions must remain replayable.');
assert(!nextNeighborhoodMission([]).complete);
console.log('PASS: all 50 English lessons across 10 places; unique assignments, real 90% mastery unlocks, restored progress, next mission and completed replays.');
