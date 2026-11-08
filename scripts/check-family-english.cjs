const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,path)=>module._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,path);
const {journeyUnits}=require('../src/journeyContent.ts');
const {familyEnglishUnits,familyEnglishProfile}=require('../src/familyEnglish.ts');
assert.equal(familyEnglishProfile.youngerAge,4);assert.equal(familyEnglishProfile.olderAge,9);assert.equal(familyEnglishProfile.olderGrade,4);
assert.equal(familyEnglishUnits.length,32);assert.equal(new Set(journeyUnits.map(u=>u.id)).size,journeyUnits.length);
for(const unit of journeyUnits){
 assert(unit.choices[unit.correct],`Missing answer: ${unit.id}`);
 for(const field of ['title','dariTitle','prompt','promptDari','explain','explainDari','phrase','phraseDari'])assert(unit[field]?.trim(),`${unit.id}: missing ${field}`);
 for(const choice of unit.choices)assert(choice.en&&/[\u0600-\u06ff]/.test(choice.dari));
 const exact=unit.choices.findIndex(c=>c.en===unit.phrase);
 if(exact>=0)assert.equal(unit.correct,exact,`Taught phrase marked wrong: ${unit.id}`);
 const listening=unit.choices.map((c,i)=>i===unit.correct?{en:unit.phrase,dari:unit.phraseDari}:c);
 assert.equal(listening[unit.correct].en,unit.phrase);
 assert.equal(new Set(listening.map(c=>c.en)).size,listening.length,`Ambiguous listening choices: ${unit.id}`);
}
for(const unit of familyEnglishUnits){
 assert.equal(unit.choices[unit.correct].en,unit.phrase);
 assert.equal(unit.dialogue.length,2);assert.equal(unit.dialogue[0].en,unit.phrase);
 unit.dialogue.forEach(line=>assert(line.en&&/[\u0600-\u06ff]/.test(line.dari)));
}
for(const id of ['grocery-help','paying-card','bus-stop','late-arrival','phone-call','leave-message','need-help','understand','food-allergy','library-card','work-schedule','email-reply','ask-playground','teacher-meeting','school-absence','birthday-invite','doctor-symptoms','dentist-visit','join-group','ask-clarification']){
 const unit=journeyUnits.find(u=>u.id===id);assert(unit,`Legacy lesson removed: ${id}`);assert.equal(unit.choices[unit.correct].en,unit.phrase);
}
console.log(`PASS: ${familyEnglishUnits.length} tailored lessons, ${journeyUnits.length} total; bilingual content, reply dialogues, legacy answer-key repairs, exact listening phrases, stable lesson IDs. English: ${journeyUnits.filter(u=>u.area==='english').length}; Social: ${journeyUnits.filter(u=>u.area==='social').length}.`);
