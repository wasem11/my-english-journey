import {handbookGroups} from './dmvHandbookExpansion';
import starter from './dmvAdventureStarter.json';
import {dmvQuestionBank} from './dmvQuestionBank';
import {dmvDari} from './dmvDari';
import {adventureExtras,handbook,section} from './dmvAdventureExtras';

export type RegionId='coast'|'city'|'mountains'|'desert'|'valley'|'redwoods';
export type AdventureRound={id:string;prompt:string;promptDari:string;choices:{en:string;dari:string}[];correct:number;why:string;whyDari:string;sign?:string;source?:string};
export type AdventureLevel={id:string;title:string;dari:string;region:RegionId;rounds:AdventureRound[]};
export type AdventureRegion={id:RegionId;name:string;dari:string;emoji:string;color:string;ground:string;accent:string;description:string;descriptionDari:string;scenery:string[]};
export const adventureRegions:AdventureRegion[]=[
 {id:'coast',name:'Pacific Coast',dari:'ساحل اقیانوس آرام',emoji:'🌊',color:'#39695B',ground:'#E3EDE9',accent:'#A7C5BD',description:'Start here: signs, yielding, and pedestrians.',descriptionDari:'از اینجا آغاز کنید: علایم، حق تقدم و عابران پیاده.',scenery:['🌊','🌴','⛵','🌴']},
 {id:'city',name:'California City',dari:'شهر کالیفورنیا',emoji:'🌆',color:'#496452',ground:'#ECEBDD',accent:'#BCC6AD',description:'Traffic lights, intersections, and safe turns.',descriptionDari:'چراغ‌های ترافیک، چهارراه‌ها و پیچیدن مصون.',scenery:['🏢','🏠','🌳','🏙️']},
 {id:'mountains',name:'Sierra Mountains',dari:'کوه‌های سیرا',emoji:'🏔️',color:'#446B60',ground:'#E4ECE5',accent:'#A9BEB3',description:'Curves, hill parking, fog, rain, and following space.',descriptionDari:'پیچ‌های سرک، پارک در شیب، مه، باران و فاصلهٔ مصون.',scenery:['🏔️','🌲','🏔️','🌲']},
 {id:'desert',name:'Mojave Desert',dari:'دشت موهاوی',emoji:'🌵',color:'#98664D',ground:'#F5E6D4',accent:'#D9B697',description:'Stay alert: passengers, distractions, impairment, and emergencies.',descriptionDari:'هوشیار بمانید: مسافران، حواس‌پرتی، اختلال و حالات اضطراری.',scenery:['🌵','☀️','🏜️','🌵']},
 {id:'valley',name:'Central Valley',dari:'درهٔ مرکزی',emoji:'🌻',color:'#667447',ground:'#E8EDCC',accent:'#B8C48E',description:'Freeways, lane markings, parking, and driver responsibilities.',descriptionDari:'شاهراه‌ها، خط‌های لین، پارک و مسئولیت‌های راننده.',scenery:['🌻','🚜','🌳','🌾']},
 {id:'redwoods',name:'Redwood Forest',dari:'جنگل ردوود',emoji:'🌲',color:'#315E48',ground:'#DDE8D8',accent:'#99B18E',description:'Share the road, recognize warnings, and cross railways safely.',descriptionDari:'شریک ساختن سرک، شناخت هشدارها و عبور مصون از خط آهن.',scenery:['🌲','🌲','🦌','🌲']}
];

const chapterSources:Record<string,string>={Signs:'laws-and-rules-of-the-road',Signals:'laws-and-rules-of-the-road','Right of way':'laws-and-rules-of-the-road',Speed:'safe-driving-cont2','Lane use':'navigating-the-roads',Parking:'navigating-the-roads-cont1','Sharing road':'laws-and-rules-of-the-road-cont1',Safety:'safe-driving','Alcohol and drugs':'alcohol-and-drugs',Emergencies:'safe-driving-cont2',Documents:'financial-responsibility-insurance-requirements-and-collisions'};
function bankRound(number:number):AdventureRound {
 const id=`ca-${String(number).padStart(3,'0')}`;
 const extra=adventureExtras.find(q=>q.id===id);
 if(extra)return {id,prompt:extra.question,promptDari:extra.questionDari,choices:extra.options.map((en,i)=>({en,dari:extra.optionsDari[i]})),correct:extra.answer,why:extra.explanation,whyDari:extra.explanationDari,source:extra.source};
 const q=dmvQuestionBank.find(q=>q.id===id),d=dmvDari[id];
 if(!q||!d)throw new Error(`Missing bilingual DMV question ${id}`);
 return {id,prompt:q.question,promptDari:d.question,choices:q.options.map((en,i)=>({en,dari:d.options[i]})),correct:q.answer,why:q.explanation,whyDari:d.explanation,source:section(chapterSources[q.topic]||'laws-and-rules-of-the-road')};
}
type Stop=[string,string,number,number,number];
const routes:{region:RegionId;stops:Stop[]}[]=[
 {region:'city',stops:[
  ['Red and yellow lights','چراغ‌های سرخ و زرد',11,12,13],['Green lights and arrows','چراغ سبز و فلش‌ها',14,15,16],
  ['Signals and safe turns','چراغ‌ها و پیچیدن مصون',17,18,76],['Who goes first?','اول کی می‌رود؟',19,20,21],
  ['Stops and emergency vehicles','توقف و موترهای اضطراری',22,23,24],['Roundabouts and turn lanes','میدان‌ها و لین پیچیدن',25,26,77]]},
 {region:'mountains',stops:[
  ['A speed that fits the road','سرعت مناسب سرک',27,28,30],['Rain and stopping distance','باران و فاصلهٔ توقف',29,31,32],
  ['Parking on a slope','پارک در شیب',41,42,83],['Narrow mountain roads','سرک‌های تنگ کوهستانی',78,79,46],
  ['See clearly in bad weather','دید روشن در هوای خراب',80,81,61],['Space, skids, and rest','فاصله، لغزش و استراحت',82,60,56]]},
 {region:'desert',stops:[
  ['Buckle up and focus','کمربند و تمرکز',54,55,84],['Protect your attention','حفظ توجه',86,57,59],
  ['Alcohol and judgment','الکول و قضاوت',62,63,85],['Medicines and impairment','دوا و اختلال',64,65,58],
  ['When something goes wrong','وقتی مشکلی پیش می‌آید',66,67,69],['Collisions and rail emergencies','تصادم و اضطرار خط آهن',68,70,87]]},
 {region:'valley',stops:[
  ['Read the lane markings','شناخت خط‌های لین',33,34,35],['Freeway confidence','اعتماد در شاهراه',36,37,38],
  ['Turns and curb colors','پیچیدن و رنگ جدول',39,40,43],['Park and leave safely','پارک و خروج مصون',44,45,88],
  ['Your driving documents','اسناد رانندگی شما',71,72,73],['Responsible road users','استفاده‌کنندگان مسئول سرک',74,75,89]]},
 {region:'redwoods',stops:[
  ['Essential sign review','مرور علایم مهم',1,2,3],['Warnings on the forest road','هشدارهای سرک جنگلی',4,5,6],
  ['Schools and railroad signs','علایم مکتب و خط آهن',7,8,90],['Limits, turns, and bicycles','حدود، پیچیدن و بایسکل',9,10,47],
  ['Motorcycles, trucks, and buses','موترسایکل، لاری و بس',48,49,50],['Give everyone enough room','برای همه جای کافی بدهید',51,52,53]]}
];
export const adventureLevels:AdventureLevel[]=[
 ...(starter as AdventureLevel[]).map(level=>({...level,rounds:level.rounds.map(round=>({...round,source:handbook}))})),
 ...routes.flatMap(route=>route.stops.map(([title,dari,...ids],i)=>({id:`${route.region}-${i+1}`,title,dari,region:route.region,rounds:ids.map(bankRound)}))),
 ...handbookGroups.flatMap(g=>Array.from({length:g.questions.length/3},(_,i)=>({id:`handbook-${g.questions[i*3].id}`,title:`${g.chapter} ${i+1}`,dari:g.questions[i*3].questionDari,region:g.region,rounds:g.questions.slice(i*3,i*3+3).map(q=>bankRound(Number(q.id.slice(3))))})))
];
export const adventureRoundCount=adventureLevels.reduce((sum,l)=>sum+l.rounds.length,0);
export function sanitizeCompleted(value:unknown):string[]{return Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==='string'&&adventureLevels.some(l=>l.id===id)))]:[];}
export function nextLevelIndex(completed:string[]):number {const next=adventureLevels.findIndex(l=>!completed.includes(l.id));return next<0?adventureLevels.length:next;}
export function hasMasteredCalifornia(completed:string[]):boolean {return adventureLevels.every(level=>completed.includes(level.id));}
export function canPlayLevel(index:number,completed:string[]):boolean {return index>=0&&index<adventureLevels.length&&(completed.includes(adventureLevels[index].id)||index===nextLevelIndex(completed));}
export function completeLevel(id:string,completed:string[]):string[]{return completed.includes(id)?completed:[...completed,id];}
// Stable per-question rotation avoids teaching that every correct answer is A.
export function orderedRound(round:AdventureRound):AdventureRound {
 const shift=[...round.id].reduce((sum,ch)=>sum+ch.charCodeAt(0),0)%round.choices.length;
 return {...round,choices:[...round.choices.slice(shift),...round.choices.slice(0,shift)],correct:(round.correct-shift+round.choices.length)%round.choices.length};
}
