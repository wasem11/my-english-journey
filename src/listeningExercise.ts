import {journeyUnits, type JourneyUnit} from './journeyContent';
export function createListeningExercise(unit:JourneyUnit,random:()=>number=Math.random){
 const related=journeyUnits.filter(other=>other.area===unit.area&&other.id!==unit.id&&other.phrase!==unit.phrase);
 const sameTopic=related.filter(other=>other.topic===unit.topic);
 const alternatives=(sameTopic.length>=2?sameTopic:related).map(other=>({en:other.phrase,dari:other.phraseDari}));
 if(!alternatives.length)throw new Error(`No distinct listening reply for ${unit.id}`);
 const phrase=alternatives[Math.floor(random()*alternatives.length)];
 const choices=unit.choices.filter(choice=>choice.en!==phrase.en).slice(0,unit.choices.length-1);
 choices.push(phrase);
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
 let correct=choices.findIndex(choice=>choice.en===phrase.en);
 // Keep the listening answer independent of the situation question's position.
 if(correct===unit.correct){const other=(correct+1+Math.floor(random()*(choices.length-1)))%choices.length;[choices[correct],choices[other]]=[choices[other],choices[correct]];correct=other;}
 return {choices,correct,phrase};
}
export type ListeningExercise=ReturnType<typeof createListeningExercise>;
