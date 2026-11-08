import {voicePassed} from './voiceAssessment';
export function englishLevelProgress(unit:{id:string;phrase:string;correct:number;area?:string},quiz:{selected:number|null;checked:boolean},listening:{selected:number|null;checked:boolean},voice:unknown,finished:boolean){
 const quizDone=quiz.checked&&quiz.selected===unit.correct;
 const listenDone=quizDone&&listening.checked&&listening.selected===unit.correct;
 const speakingPassed=voicePassed(voice,unit.id,unit.phrase);
 const complete=finished&&quizDone&&listenDone&&speakingPassed;
 const nodes=[
  {id:'choose',title:unit.area==='social'?'Start the conversation':'Choose your reply',dari:'جواب خود را انتخاب کنید',done:quizDone,ready:true},
  {id:'listen',title:unit.area==='social'?'Hear the reply':'Listen & recognize',dari:'بشنوید و تشخیص دهید',done:listenDone,ready:quizDone},
  {id:'speak',title:unit.area==='social'?'Say your reply':'Speak with confidence',dari:'با اعتماد به نفس گپ بزنید',done:complete,ready:quizDone&&listenDone},
 ];
 return {quizDone,listenDone,speakingPassed,complete,nodes,next:nodes.find(node=>!node.done)||nodes[2]};
}
