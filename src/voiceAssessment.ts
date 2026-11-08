export const VOICE_TARGET=90;
export const VOICE_PROGRESS_KEY='mejJourneyVoiceV1';
export type VoiceAssessment={lessonId:string;referenceText:string;assessmentType:'pronunciation';provider:'azure-speech';score:number;transcript:string;accuracy:number;fluency:number;completeness:number;words:{word:string;accuracy:number;error:string}[];assessedAt:string};
export function parseVoiceAssessment(value:unknown,lessonId:string,referenceText:string):VoiceAssessment {
 const v=value as VoiceAssessment;
 if(!v||v.lessonId!==lessonId||v.referenceText!==referenceText||v.assessmentType!=='pronunciation'||v.provider!=='azure-speech'||typeof v.transcript!=='string'||!v.transcript.trim())throw new Error('The service did not return a valid voice assessment for this lesson.');
 for(const key of ['score','accuracy','fluency','completeness'] as const)if(typeof v[key]!=='number'||!Number.isFinite(v[key])||v[key]<0||v[key]>100)throw new Error('The service returned an invalid voice score. Please try again.');
 if(!Array.isArray(v.words)||typeof v.assessedAt!=='string')throw new Error('The voice assessment is incomplete. Please try again.');
 for(const w of v.words)if(!w||typeof w.word!=='string'||typeof w.error!=='string'||typeof w.accuracy!=='number'||!Number.isFinite(w.accuracy)||w.accuracy<0||w.accuracy>100)throw new Error('The word feedback is invalid. Please try again.');
 return v;
}
export function voicePassed(value:unknown,lessonId:string,referenceText:string):boolean {try{return parseVoiceAssessment(value,lessonId,referenceText).score>=VOICE_TARGET;}catch{return false;}}
export function lessonPassed(quizCorrect:boolean,listeningCorrect:boolean,voice:unknown,lessonId:string,referenceText:string):boolean {return quizCorrect&&listeningCorrect&&voicePassed(voice,lessonId,referenceText);}
export function masteredJourneyIds(units:{id:string;phrase:string}[],quizIds:unknown,assessments:unknown):string[]{
 if(!Array.isArray(quizIds)||!assessments||typeof assessments!=='object')return [];
 return units.filter(u=>quizIds.includes(u.id)&&voicePassed((assessments as Record<string,unknown>)[u.id],u.id,u.phrase)).map(u=>u.id);
}
