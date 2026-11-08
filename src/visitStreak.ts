import {localDay} from './homeLearning';
export const VISIT_STREAK_KEY='mejVisitStreakV1';
export type VisitStreak={lastDay:string;count:number};
export function recordVisit(saved:unknown,now=new Date()):VisitStreak{
 const today=localDay(now),previous=new Date(now);previous.setDate(previous.getDate()-1);
 const value=saved as Partial<VisitStreak>|null;
 const valid=value&&typeof value.lastDay==='string'&&Number.isSafeInteger(value.count)&&value.count!>0;
 if(valid&&value.lastDay===today)return {lastDay:today,count:value.count!};
 return {lastDay:today,count:valid&&value.lastDay===localDay(previous)?value.count!+1:1};
}
export function visitMessage(streak:VisitStreak){
 const messages=['Keep it going. Your next small win is waiting.','A little practice today, a little more confidence tomorrow.','You made time for yourself. That matters.','One step at a time. You are building something good.','Back again. Let your confidence grow.','Your pace. Your voice. Keep showing up.','A fresh day to try something new.'];
 const [year,month,day]=streak.lastDay.split('-').map(Number);
 const index=Math.floor(Date.UTC(year,month-1,day)/86400000)%messages.length;
 return {title:streak.count===1?'You showed up today!':`${streak.count} days in a row!`,message:streak.count%7===0?`${streak.count/7} week${streak.count===7?'':'s'} of showing up. Keep it going!`:messages[index]};
}
