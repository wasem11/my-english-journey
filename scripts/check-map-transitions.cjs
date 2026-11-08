const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
require('../server/speech-server.cjs');
const {worldsForArea}=require('../src/conversationWorlds.ts');
const {adventureRegions,adventureLevels}=require('../src/dmvAdventure.ts');
function check(file,props){
 const effects=[],motions=[],positions=[];let arrived=0;
 class Value{constructor(value){this.value=value;}setValue(value){this.value=value;positions.push(value);}getTranslateTransform(){return [];}addListener(){return 1;}removeListener(){}stopAnimation(){}}
 const animated={Value,ValueXY:Value,View:'View',timing:(value,options)=>{const motion={options,start(callback){motion.finish=callback;},stop(){}};motions.push(motion);return motion;},sequence:()=>({}),loop:()=>({start(){},stop(){}})};
 const react={createElement:()=>null,Fragment:'Fragment',useRef:value=>({current:value}),useState:value=>[value===null?false:value,()=>{}],useEffect:callback=>effects.push(callback),useCallback:fn=>fn};
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText,{exports,require:name=>{
  if(name==='react')return {...react,default:react};
  if(name==='react-native')return {Animated:animated,Easing:{inOut:x=>x,cubic:x=>x},StyleSheet:{create:x=>x},useWindowDimensions:()=>({fontScale:1}),AccessibilityInfo:{isReduceMotionEnabled:async()=>false,addEventListener:()=>({remove(){}})}};
  if(name==='expo-router')return {useFocusEffect:()=>{}};
  if(name==='@expo/vector-icons')return {Ionicons:()=>null};
  if(['./GameCharacter','./DriverJeep'].includes(name))return {default:()=>null};
  if(name==='./EnglishGameScenery')return {default:()=>null,gameEnvironments:new Proxy({},{get:()=>({ground:'#fff'})})};
  return require('../src/'+name.replace('./','')+'.ts');
 }});
 exports.default({...props,onFocusPoint(){},onStart(){},onArrive(){arrived++;}});
 const cleanup=effects.map(callback=>callback());
 const travel=motions.find(m=>m.options.useNativeDriver===false);
 assert(travel,'Returning from a completed activity must animate map movement.');assert.equal(arrived,0,'Next activity must wait for arrival.');
 travel.finish({finished:false});assert.equal(arrived,0,'Cancelled movement must not open a question.');
 travel.finish({finished:true});assert.equal(arrived,1,'Next activity opens after completed movement.');
 for(const position of positions)if(position&&typeof position==='object'){assert(Number.isFinite(position.x));assert(Number.isFinite(position.y));}
 cleanup.forEach(fn=>fn?.());
}
const place=worldsForArea('english')[0];
check('src/LearningTrail.tsx',{place,nodes:[{id:'old',done:true,ready:true},{id:'next',done:false,ready:true}],fromId:'old',targetId:'next',translated:false});
const region=adventureRegions[0],levels=adventureLevels.map((level,index)=>({level,index})).filter(x=>x.level.region===region.id);
check('src/AdventureTrail.tsx',{region,completed:[levels[0].level.id],currentIndex:levels[1].index,initialIndex:levels[0].index,translated:false});
console.log('PASS: walking and Jeep movement wait for animation completion, cancel safely, and have finite map coordinates.');
