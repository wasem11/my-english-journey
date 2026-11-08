import {voicePassed} from './voiceAssessment';
export function englishLevelProgress(unit:{id:string;phrase:string;correct:number;area?:string},quiz:{selected:number|null;checked:boolean},listening:{selected:number|null;checked:boolean},voice:unknown,finished:boolean,listeningCorrect=unit.correct){
 const listenDone=listening.checked&&listening.selected===listeningCorrect;
 const quizDone=listenDone&&quiz.checked&&quiz.selected===unit.correct;
 const speakingPassed=voicePassed(voice,unit.id,unit.phrase);
 const complete=finished&&quizDone&&listenDone&&speakingPassed;
 const nodes=[
  {id:'listen',title:unit.area==='social'?'Hear the reply':'Listen & recognize',dari:'بشنوید و تشخیص دهید',done:listenDone,ready:true},
  {id:'choose',title:unit.area==='social'?'Start the conversation':'Choose your reply',dari:'جواب خود را انتخاب کنید',done:quizDone,ready:listenDone},
  {id:'speak',title:unit.area==='social'?'Say your reply':'Speak with confidence',dari:'با اعتماد به نفس گپ بزنید',done:complete,ready:quizDone&&listenDone},
 ];
 return {quizDone,listenDone,speakingPassed,complete,nodes,next:nodes.find(node=>!node.done)||nodes[2]};
}
