import type {JourneyUnit} from './journeyContent';
export const localDay=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function homeLearning(units:JourneyUnit[],mastered:string[],activity:Record<string,number>,now=new Date()){
 const today=localDay(now),active=(key:string)=>Number.isFinite(activity[key])&&activity[key]>0;
 const english=units.filter(u=>u.area==='english'),social=units.filter(u=>u.area==='social');
 const ordinal=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000),phrase=english[ordinal%english.length];
 const next=english.find(u=>!mastered.includes(u.id))||social.find(u=>!mastered.includes(u.id))||phrase;
 const cursor=new Date(now);if(!active(today))cursor.setDate(cursor.getDate()-1);
 let streak=0;while(active(localDay(cursor))&&streak<3660){streak++;cursor.setDate(cursor.getDate()-1);}
 const monday=new Date(now);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
 const week=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const key=localDay(d);return {key,label:['M','T','W','T','F','S','S'][i],done:active(key),today:key===today};});
 return {next,phrase,week,streak,todayDone:active(today),englishDone:english.filter(u=>mastered.includes(u.id)).length,socialDone:social.filter(u=>mastered.includes(u.id)).length,englishTotal:english.length,socialTotal:social.length,practiceDays:Object.keys(activity).filter(key=>key<=today&&active(key)).length};
}
