const assert=require('node:assert/strict');
require('../server/speech-server.cjs');
const {journeyUnits}=require('../src/journeyContent.ts');
const {conversationWorlds,worldForLesson,worldsForArea,conversationCharacter,nextAreaMission}=require('../src/conversationWorlds.ts');
const {placeMissions,missionReady}=require('../src/neighborhood.ts');
const {characters,playerCharacter}=require('../src/characters.ts');
const {buildNarrationTexts}=require('../server/narration-texts.cjs');
const {englishLevelProgress}=require('../src/englishLevelProgress.ts');
const units=journeyUnits.filter(unit=>unit.area==='social'),ids=conversationWorlds.flatMap(world=>world.lessons),texts=new Set(buildNarrationTexts());
assert.equal(units.length,31);assert.equal(conversationWorlds.length,8);assert.equal(ids.length,new Set(ids).size);assert.deepEqual([...ids].sort(),units.map(unit=>unit.id).sort());
assert.equal(worldsForArea('english').length,10);assert.equal(worldsForArea('social').length,8);
assert(new Set(units.map(unit=>conversationCharacter(unit.id))).size>=15,'Conversations must introduce different community members, not reuse one host for every encounter.');
for(const [id,character] of Object.entries({'community-checkout':'cashier','community-cafe':'barista','community-library-card':'librarian','community-storytime':'coordinator','community-bus':'busDriver','community-post-office':'postalClerk','doctor-symptoms':'doctor','dentist-visit':'dentist','school-absence':'schoolOffice'}))assert.equal(conversationCharacter(id),character);
for(const world of conversationWorlds){assert(characters[world.npc]);assert(placeMissions(world).every(unit=>unit.area==='social'));assert(missionReady(world,world.lessons[0],[]));assert(!missionReady(world,world.lessons[1],[]));}
for(const unit of units){assert(worldForLesson(unit.id));assert(characters[conversationCharacter(unit.id)]);assert(unit.dialogue?.some(line=>line.speaker==='You'));assert(unit.dialogue[0].speaker!=='You','The other character must open the scene before the learner replies.');assert(unit.dialogue.some(line=>line.speaker==='You'&&line.en===unit.phrase));assert(unit.dialogue?.some(line=>line.speaker!=='You'));for(const line of unit.dialogue){assert(line.en&&line.dari);assert(texts.has(line.en),'Character speech must be allowed by the Ava narration service.');}const state=englishLevelProgress(unit,{selected:null,checked:false},{selected:null,checked:false},null,false);assert.equal(state.nodes[0].title,'Start the conversation');assert(!state.nodes[1].ready);assert(!state.nodes[2].ready);}
assert.equal(playerCharacter.heightInches,63);assert.equal(playerCharacter.identity,'Afghan American woman');assert.equal(playerCharacter.skin,'#A66D46');assert.equal(characters.player,playerCharacter);
assert(!nextAreaMission('social',[]).complete);assert(nextAreaMission('social',ids).complete);assert(!nextAreaMission('english',ids).complete,'Conversation completion must not complete English worlds.');
console.log('PASS: all 31 conversations across 8 community worlds, distinct community members, bilingual dialogue, trusted Ava lines, player identity, independent progress and checkpoint locks.');
