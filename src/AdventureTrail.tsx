import DriverJeep from './DriverJeep';
import {theme} from './theme';
import React,{useEffect,useRef,useState} from 'react';
import {Animated,AccessibilityInfo,Easing,Image,StyleSheet,Text,TouchableOpacity,View,useWindowDimensions} from 'react-native';
import {AdventureRegion,adventureLevels,canPlayLevel} from './dmvAdventure';
import {trailPoint,parkedPoint,trailLayout,trailLabelBounds} from './adventureMapGeometry';

export default function AdventureTrail({region,completed,currentIndex,onStart,translated,fullScreen=false,onFocusPoint,initialIndex,onArrive}:{region:AdventureRegion;completed:string[];currentIndex:number;onStart:(index:number)=>void;translated:boolean;fullScreen?:boolean;onFocusPoint?:(y:number)=>void;initialIndex?:number;onArrive?:()=>void}){
 const arrival=useRef(onArrive);arrival.current=onArrive;
 const {fontScale}=useWindowDimensions();
 const levels=adventureLevels.map((level,index)=>({level,index})).filter(x=>x.level.region===region.id);
 const [reduce,setReduce]=useState<boolean|null>(null);
 useEffect(()=>{let live=true;void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(live)setReduce(value);});return()=>{live=false;};},[]);
 const [width,setWidth]=useState(350),[driving,setDriving]=useState(false);
 const progress=useRef(new Animated.Value(0)).current;
 const bob=useRef(new Animated.Value(0)).current;
 const [pose,setPose]=useState({x:0,y:0});
 const previous=useRef<{region:string;local:number}|null>(null);
 const local=levels.findIndex(x=>x.index===currentIndex);
 const finished=levels.every(x=>completed.includes(x.level.id));
 const carLocal=local>=0?local:finished?levels.length-1:-1;
 const {height,spacing,start}=trailLayout(fontScale,translated,levels.length);
 const point=(i:number)=>trailPoint(i,width,spacing,start);
 const parking=(i:number)=>i<0?{...parkedPoint(0,width,spacing,start),y:start-150}:parkedPoint(i,width,spacing,start);
 useEffect(()=>{if(carLocal>=0)onFocusPoint?.(point(carLocal).y);},[carLocal,width,spacing,start,onFocusPoint]);
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(bob,{toValue:-3,duration:700,useNativeDriver:true}),Animated.timing(bob,{toValue:2,duration:700,useNativeDriver:true})]));loop.start();return()=>loop.stop();},[bob]);
 useEffect(()=>{
  if(reduce===null)return;
  const id=progress.addListener(({value})=>{const first=Math.floor(value),end=Math.min(first+1,levels.length-1),u=value-first;const a=parking(first),b=parking(end);setPose({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u});});
  const old=initialIndex!==undefined?{region:region.id,local:Math.max(-1,levels.findIndex(x=>x.index===initialIndex))}:previous.current;progress.stopAnimation();setDriving(false);
  if(carLocal>=0){
   if(old?.region===region.id&&old.local>=-1&&carLocal!==old.local&&(initialIndex!==undefined||carLocal===old.local+1)){
    progress.setValue(old.local);setDriving(true);Animated.timing(progress,{toValue:carLocal,duration:reduce?300:1600,easing:Easing.inOut(Easing.cubic),useNativeDriver:false}).start(({finished})=>{setDriving(false);if(finished)arrival.current?.();});
   }else{progress.setValue(carLocal);setPose(parking(carLocal));}
  }
  previous.current={region:region.id,local:carLocal};
  return()=>{progress.stopAnimation();progress.removeListener(id);};
 },[carLocal,width,region.id,levels.length,progress,spacing,start,reduce,initialIndex]);
 return <View onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={[s.map,{height,backgroundColor:region.ground,borderColor:region.accent},fullScreen&&{borderRadius:0,borderWidth:0,marginTop:0,flexGrow:1}]}>
  <View pointerEvents="none" style={[s.sky,{backgroundColor:region.accent}]}><Text style={s.skyText}>{region.emoji}   ☁️                 ☀️</Text></View>
  {levels.map(({level},i)=><React.Fragment key={`scenery-${level.id}`}>
   {region.id==='mountains'?<View pointerEvents="none" style={[s.mountain,{top:100+i*spacing,left:i%2?-45:width-100,borderBottomColor:region.accent}]}><View style={s.snow}/></View>:region.id==='city'?<View pointerEvents="none" style={[s.building,{top:105+i*spacing,left:i%2?8:width-65,backgroundColor:region.accent}]}><Text style={s.windows}>▫ ▫{'\n'}▫ ▫{'\n'}▫ ▫</Text></View>:<View pointerEvents="none" style={[s.landform,{backgroundColor:region.accent,top:130+i*spacing,left:i%2?-90:width-100,transform:[{rotate:i%2?'22deg':'-22deg'}]}]}/>}
   <Text pointerEvents="none" style={[s.scenery,{top:125+i*spacing,left:i%2?12:width-61}]}>{region.scenery[i%region.scenery.length]}</Text>
  </React.Fragment>)}
  {levels.slice(0,-1).map(({level},i)=>{
   const a=point(i),b=point(i+1),length=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
   return <React.Fragment key={`road-${level.id}`}><View pointerEvents="none" style={[s.road,{width:length+18,left:(a.x+b.x)/2-(length+18)/2,top:(a.y+b.y)/2-25,transform:[{rotate:`${angle}deg`}]}]}/>{[.25,.5,.75].map(t=><View key={t} pointerEvents="none" style={[s.dash,{left:a.x+(b.x-a.x)*t-11,top:a.y+(b.y-a.y)*t-2,transform:[{rotate:`${angle}deg`}]}]}/>)}</React.Fragment>;
  })}
  <View style={s.banner}><Text style={[s.bannerTitle,{color:region.color}]}>{region.emoji} {region.name}</Text><Text style={s.bannerSub}>{levels.filter(x=>completed.includes(x.level.id)).length}/{levels.length} {translated?'levels • سطح‌ها':'levels complete'}</Text></View>
  {levels.map(({level,index},i)=>{const p=point(i),label=trailLabelBounds(i,width,fontScale),done=completed.includes(level.id),ready=canPlayLevel(index,completed);return <TouchableOpacity key={level.id} accessibilityRole="button" accessibilityLabel={`Level ${index+1}: ${level.title}. ${done?'Complete':ready?'Ready':'Locked'}`} disabled={!ready} onPress={()=>onStart(index)} style={[s.node,{left:p.x-32,top:p.y-32,backgroundColor:done?theme.lime:ready?theme.green:theme.disabled,borderColor:ready?theme.lime:theme.soft}]}><Text style={[s.number,done&&{color:theme.ink},!ready&&{color:theme.muted}]}>{done?'✓':ready?index+1:'🔒'}</Text><View style={[s.label,{width:label.width,left:label.left-p.x+32}]}><Text style={s.labelText}>{level.title}</Text>{translated&&<Text style={s.labelDari}>{level.dari}</Text>}</View></TouchableOpacity>;})}
  {carLocal>=0&&<Animated.View style={[s.car,{left:pose.x-39,top:pose.y-43,transform:[{translateY:bob}]}]}><TouchableOpacity accessibilityRole="button" accessibilityLabel={finished?'Replay last level':`Start level ${currentIndex+1}`} disabled={driving} onPress={()=>onStart(levels[carLocal].index)}><DriverJeep/><Text style={s.carLabel}>{driving?'💨':finished?'↻':'▶'}</Text></TouchableOpacity></Animated.View>}
  <View style={s.finish}><Text style={[s.bannerTitle,{color:region.color}]}>{finished?'🏁 Region complete!':'🏁 Keep exploring'}</Text>{translated&&<Text style={s.labelDari}>{finished?'این منطقه تکمیل شد!':'به کشف کردن ادامه بدهید'}</Text>}</View>
 </View>;
}
const s=StyleSheet.create({
 mountain:{position:'absolute',width:0,height:0,borderLeftWidth:75,borderRightWidth:75,borderBottomWidth:115,borderLeftColor:'transparent',borderRightColor:'transparent'},snow:{position:'absolute',top:0,left:-23,width:0,height:0,borderLeftWidth:23,borderRightWidth:23,borderBottomWidth:36,borderLeftColor:'transparent',borderRightColor:'transparent',borderBottomColor:theme.paper},building:{position:'absolute',width:55,height:112,borderTopLeftRadius:6,borderTopRightRadius:6,opacity:.65},windows:{fontSize:25,color:theme.paper,textAlign:'center',lineHeight:30},map:{borderRadius:26,borderWidth:2,overflow:'hidden',position:'relative',marginTop:14},sky:{position:'absolute',top:0,left:0,right:0,height:110,borderBottomLeftRadius:100,borderBottomRightRadius:60,opacity:.55},skyText:{fontSize:31,paddingTop:16,paddingLeft:16},landform:{position:'absolute',width:190,height:95,borderRadius:70,opacity:.45},scenery:{position:'absolute',fontSize:42,zIndex:1},road:{position:'absolute',height:50,borderRadius:25,backgroundColor:'#64717B',borderWidth:5,borderColor:'#B0BAC0',zIndex:2},dash:{position:'absolute',height:4,width:22,borderRadius:2,backgroundColor:theme.olive,zIndex:3},banner:{position:'absolute',top:18,left:18,right:18,padding:12,borderRadius:17,backgroundColor:'#FFFFFFEB',zIndex:6,alignItems:'center'},bannerTitle:{fontSize:17,fontWeight:'900'},bannerSub:{fontSize:11,color:theme.muted,marginTop:4},node:{position:'absolute',height:64,width:64,borderRadius:35,borderWidth:5,alignItems:'center',justifyContent:'center',zIndex:6,elevation:3},number:{fontSize:22,color:'white',fontWeight:'900'},label:{position:'absolute',top:62,width:166,backgroundColor:'#FFFFfff2',padding:7,borderRadius:11},labelText:{fontSize:13,lineHeight:18,color:theme.ink,textAlign:'center',fontWeight:'800'},labelDari:{fontSize:14,lineHeight:22,color:theme.muted,textAlign:'right',writingDirection:'rtl',marginTop:3},car:{position:'absolute',zIndex:8,width:78},jeep:{width:78,height:65,resizeMode:'contain'},carLabel:{alignSelf:'center',backgroundColor:theme.lime,color:theme.ink,borderRadius:12,paddingHorizontal:9,paddingVertical:2,fontSize:12,fontWeight:'900'},finish:{position:'absolute',bottom:18,left:22,right:22,padding:14,borderRadius:16,backgroundColor:'#FFFFFFDB',alignItems:'center'}
});
