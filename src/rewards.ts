import {masteredJourneyIds,VoiceAssessment} from './voiceAssessment';
export const DRIVING_REWARD_SCORES_KEY='mejDrivingRewardScoresV1';
export const REWARD_RULE='Earn $1 per mastered lesson or driving level, plus $2 once for a perfect 100% score.';
export const REWARD_NOTE='Saved on this device. Estimates only; no automatic payments. Replays do not earn the same reward twice.';
export const rewardForScore=(score:number)=>Number.isFinite(score)&&score>=80&&score<=100?1+(score===100?2:0):0;
export type RewardArea='english'|'social'|'driving';
export type RewardContribution={id:string;area:RewardArea;score:number|null;base:number;bonus:number;total:number};
export function rewardContributions(units:{id:string;area:string;phrase:string}[],done:unknown,voices:unknown,driving:string[],drivingScores:Record<string,number>={}):RewardContribution[]{
 const mastered=masteredJourneyIds(units,done,voices),scores=voices as Record<string,VoiceAssessment>;
 const language:RewardContribution[]=units.filter(u=>(u.area==='english'||u.area==='social')&&mastered.includes(u.id)).map(u=>{
  const score=scores[u.id].score,total=rewardForScore(score);
  return {id:u.id,area:u.area as RewardArea,score,base:1,bonus:total-1,total};
 });
 const drive:RewardContribution[]=[...new Set(driving)].map(id=>{
  const saved=drivingScores[id],score=rewardForScore(saved)>0?saved:null,bonus=score!==null&&score===100?2:0;
  return {id,area:'driving',score,base:1,bonus,total:1+bonus};
 });
 return [...language,...drive];
}
export function rewardSummary(units:{id:string;area:string;phrase:string}[],done:unknown,voices:unknown,driving:string[],drivingScores:Record<string,number>={}){
 return rewardContributions(units,done,voices,driving,drivingScores).reduce((sum,item)=>{
  sum[item.area]+=item.total;sum.total+=item.total;return sum;
 },{english:0,social:0,driving:0,total:0});
}
