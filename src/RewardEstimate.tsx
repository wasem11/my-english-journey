import {theme} from './theme';
import React,{useCallback,useState} from 'react';
import {View,Text,StyleSheet,TouchableOpacity} from 'react-native';
import {useFocusEffect} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Ionicons} from '@expo/vector-icons';
import {journeyUnits} from './journeyContent';
import {adventureLevels,sanitizeCompleted} from './dmvAdventure';
import {VOICE_PROGRESS_KEY,VOICE_TARGET} from './voiceAssessment';
import {DRIVING_REWARD_SCORES_KEY,REWARD_RULE,REWARD_NOTE,rewardSummary,rewardContributions,RewardArea,RewardContribution} from './rewards';

const parse=(value:string|null,fallback:unknown)=>{try{return value?JSON.parse(value):fallback;}catch{return fallback;}};
const areaNames={english:'Everyday English',social:'Conversations',driving:'Driving'};
function contributionTitle(item:RewardContribution){
 if(item.area==='driving'){
  const index=adventureLevels.findIndex(level=>level.id===item.id);
  return index>=0?`Level ${index+1}: ${adventureLevels[index].title}`:'Completed driving level';
 }
 return journeyUnits.find(unit=>unit.id===item.id)?.title||'Completed lesson';
}
export default function RewardEstimate({area,refreshKey='',compact=false}:{area?:RewardArea;refreshKey?:string;compact?:boolean}){
 const [value,setValue]=useState<ReturnType<typeof rewardSummary>|null>(null);
 const [entries,setEntries]=useState<RewardContribution[]>([]),[failed,setFailed]=useState(false),[expanded,setExpanded]=useState(false);
 useFocusEffect(useCallback(()=>{
  let live=true;
  void AsyncStorage.multiGet(['mejJourneyDoneV1',VOICE_PROGRESS_KEY,'dmvAdventureCompletedV1',DRIVING_REWARD_SCORES_KEY]).then(rows=>{
   if(!live)return;
   const data=Object.fromEntries(rows),savedScores=parse(data[DRIVING_REWARD_SCORES_KEY],{});
   const scores=savedScores&&typeof savedScores==='object'&&!Array.isArray(savedScores)?savedScores:{};
   const done=parse(data.mejJourneyDoneV1,[]),voices=parse(data[VOICE_PROGRESS_KEY],{}),driving=sanitizeCompleted(parse(data.dmvAdventureCompletedV1,[]));
   setValue(rewardSummary(journeyUnits,done,voices,driving,scores));
   setEntries(rewardContributions(journeyUnits,done,voices,driving,scores));setFailed(false);
  }).catch(()=>{if(live)setFailed(true);});
  return()=>{live=false;};
 },[refreshKey]));
 const shown=entries.filter(item=>!area||item.area===area),total=value?(area?value[area]:value.total):0;
 const label=area?`${areaNames[area]} reward estimate`:'Your reward estimate';
 return <View style={[s.container,compact&&{marginVertical:0}]}>
  <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label}${value&&!failed?`, $${total}`:''}. ${expanded?'Hide':'Show'} completed lesson earnings`} accessibilityState={{expanded}} onPress={()=>setExpanded(open=>!open)} activeOpacity={.85} style={[s.card,compact&&s.compactCard]}>
   {compact?<View style={s.row}><Text style={[s.label,{flex:1}]}>{label}: {failed?'Unavailable':value?`$${total}`:'Loading...'} · Tap for details</Text><Ionicons name={expanded?'chevron-up':'chevron-down'} size={16} color={theme.green}/></View>:<>
   <View style={s.row}><Ionicons name="gift-outline" size={23} color={theme.green}/><View style={{flex:1}}><Text style={s.label}>{label}</Text><Text style={s.amount}>{failed?'Unavailable':value?`$${total}`:'Loading...'}</Text></View><Ionicons name={expanded?'chevron-up':'chevron-down'} size={22} color={theme.green}/></View>
   {!area&&value&&!failed&&<View style={s.breakdown}>{(['english','social','driving'] as const).map(key=><Text key={key} style={s.detail}>{areaNames[key]}: ${value[key]}</Text>)}</View>}
   <Text style={s.rule}>{REWARD_RULE}</Text>
   {area&&<Text style={s.note}>{area==='driving'?'Pass with 4/5 for $1. A perfect 5/5 earns the $2 bonus.':`Complete the quiz and listening checks with at least ${VOICE_TARGET}% in speaking. A perfect 100% best saved speaking score earns the $2 bonus.`}</Text>}
   <Text style={s.note}>{REWARD_NOTE}</Text><Text style={s.link}>{expanded?'Hide completed lessons':'See completed lessons & earnings'}</Text></>}
  </TouchableOpacity>
  {expanded&&<View style={s.panel}>
   <Text accessibilityRole="header" style={s.title}>How your estimate adds up</Text>
   {failed?<Text accessibilityRole="alert" style={s.body}>Could not load your saved rewards. Reopen this screen to try again.</Text>:!value?<Text style={s.body}>Loading completed lessons...</Text>:shown.length===0?<Text style={s.body}>No completed lessons here yet. Your first mastered lesson or driving level will appear with its reward.</Text>:<>
    <Text style={s.body}>{shown.length} completed {shown.length===1?'lesson or level':'lessons and levels'}. Each appears once, with your best saved score.</Text>
    {(['english','social','driving'] as const).filter(key=>!area||key===area).map(key=>{
     const items=shown.filter(item=>item.area===key);
     if(!items.length)return null;
     return <View key={key} style={s.group}><View style={s.groupHeading}><Text accessibilityRole="header" style={s.groupTitle}>{areaNames[key]}</Text><Text style={s.subtotal}>${items.reduce((sum,item)=>sum+item.total,0)}</Text></View>
      {items.map(item=><View key={`${item.area}:${item.id}`} style={s.lesson}>
       <View style={s.lessonTop}><Text style={s.lessonTitle}>{contributionTitle(item)}</Text><Text style={s.lessonAmount}>${item.total}</Text></View>
       <Text style={s.score}>{item.score===null?'Completed earlier. Score was not saved.':`${item.area==='driving'?'Best level score':'Best speaking score'}: ${item.score}%`}</Text>
       <View style={s.line}><Text style={s.body}>Completion reward</Text><Text style={s.money}>${item.base}</Text></View>
       <View style={s.line}><Text style={s.body}>Perfect score bonus</Text><Text style={s.money}>${item.bonus}</Text></View>
       {item.score===null&&<Text style={s.note}>Only the $1 completion reward is counted. Replay and score a perfect 100% to add the $2 bonus.</Text>}
      </View>)}
     </View>;
    })}
    <View style={s.total}><Text style={s.groupTitle}>Total reward estimate</Text><Text style={s.totalAmount}>${total}</Text></View>
    <Text style={s.note}>A $2 bonus is added once when a completed level reaches a perfect 100%. Repeating it does not add another completion reward or bonus.</Text>
   </>}
   <TouchableOpacity accessibilityRole="button" onPress={()=>setExpanded(false)} style={s.close}><Text style={s.closeText}>Close breakdown</Text></TouchableOpacity>
  </View>}
 </View>;
}
const s=StyleSheet.create({
 container:{marginVertical:15},card:{backgroundColor:theme.soft,borderWidth:1,borderColor:theme.line,borderRadius:theme.radius,padding:18},compactCard:{backgroundColor:theme.paper,borderWidth:0,borderRadius:0,paddingHorizontal:14,paddingVertical:12,minHeight:44,justifyContent:'center'},row:{flexDirection:'row',alignItems:'center',gap:12},label:{fontSize:12,fontWeight:'800',color:theme.green},amount:{fontSize:30,fontWeight:'900',color:theme.green,marginTop:4},breakdown:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:13},detail:{fontSize:11,color:theme.green,fontWeight:'700'},rule:{fontSize:12,lineHeight:19,color:theme.ink,marginTop:12},note:{fontSize:11,lineHeight:18,color:theme.muted,marginTop:7},link:{fontSize:12,fontWeight:'800',color:theme.green,marginTop:14},
 panel:{backgroundColor:theme.surface,borderWidth:1,borderColor:theme.line,borderRadius:theme.radius,padding:18,marginTop:10},title:{fontSize:21,lineHeight:28,fontWeight:'800',letterSpacing:-.4,color:theme.ink},body:{fontSize:12,lineHeight:20,color:theme.muted,marginTop:6,flexShrink:1},group:{marginTop:20},groupHeading:{flexDirection:'row',justifyContent:'space-between',gap:12,alignItems:'center',paddingBottom:10},groupTitle:{fontSize:15,lineHeight:22,fontWeight:'800',color:theme.ink,flexShrink:1},subtotal:{fontSize:17,fontWeight:'800',color:theme.green},lesson:{borderTopWidth:1,borderColor:theme.line,paddingVertical:15},lessonTop:{flexDirection:'row',gap:14,alignItems:'flex-start'},lessonTitle:{flex:1,fontSize:15,lineHeight:23,fontWeight:'700',color:theme.ink},lessonAmount:{fontSize:18,lineHeight:24,fontWeight:'800',color:theme.green},score:{fontSize:11,lineHeight:18,color:theme.muted,marginTop:6,marginBottom:5},line:{flexDirection:'row',justifyContent:'space-between',gap:12,alignItems:'baseline'},money:{fontSize:12,fontWeight:'700',color:theme.ink},total:{borderTopWidth:1,borderColor:theme.line,paddingTop:17,flexDirection:'row',gap:12,justifyContent:'space-between',alignItems:'center'},totalAmount:{fontSize:25,fontWeight:'800',color:theme.green},close:{minHeight:48,backgroundColor:theme.sage,borderRadius:theme.buttonRadius,alignItems:'center',justifyContent:'center',padding:12,marginTop:16},closeText:{fontSize:13,fontWeight:'800',color:theme.green},
});
