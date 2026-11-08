import React,{useCallback,useRef,useState} from 'react';
import {AppState,View,Text,ScrollView,TouchableOpacity,StyleSheet,TextInput,StatusBar,useWindowDimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useFocusEffect,useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameCharacter from '../src/GameCharacter';
import DriverJeep from '../src/DriverJeep';
import {theme as C} from '../src/theme';
import {journeyUnits} from '../src/journeyContent';
import {VOICE_PROGRESS_KEY,masteredJourneyIds} from '../src/voiceAssessment';
import {adventureLevels,sanitizeCompleted} from '../src/dmvAdventure';
import {localDay} from '../src/homeLearning';
import {recordVisit,visitMessage,VISIT_STREAK_KEY,VisitStreak} from '../src/visitStreak';
const parse=(value:string|null,fallback:unknown)=>{try{return value?JSON.parse(value):fallback;}catch{return fallback;}};
type Icon=React.ComponentProps<typeof Ionicons>['name'];
export default function Home(){
 const router=useRouter(),insets=useSafeAreaInsets(),{width,fontScale}=useWindowDimensions(),scroll=useRef<ScrollView>(null);
 const wide=width>=780,compact=width<370||fontScale>1.2;
 const [mastered,setMastered]=useState<string[]>([]),[driving,setDriving]=useState<string[]>([]);
 const [name,setName]=useState(''),[editing,setEditing]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(new Date()),[visit,setVisit]=useState<VisitStreak|null>(null);
 useFocusEffect(useCallback(()=>{
  let live=true,loading=false,lastDay='';
  const refresh=async()=>{
   if(loading)return;loading=true;const date=new Date();
   try{
    const rows=await AsyncStorage.multiGet(['mejJourneyDoneV1',VOICE_PROGRESS_KEY,'dmvAdventureCompletedV1','learnerName',VISIT_STREAK_KEY]);
    if(!live)return;const data=Object.fromEntries(rows),streak=recordVisit(parse(data[VISIT_STREAK_KEY],null),date);
    await AsyncStorage.setItem(VISIT_STREAK_KEY,JSON.stringify(streak));
    if(!live)return;
    setMastered(masteredJourneyIds(journeyUnits,parse(data.mejJourneyDoneV1,[]),parse(data[VOICE_PROGRESS_KEY],{})));
    setDriving(sanitizeCompleted(parse(data.dmvAdventureCompletedV1,[])));setName(data.learnerName||'');setVisit(streak);setNow(date);setError('');lastDay=localDay(date);
   }catch{if(live)setError('Could not load your saved progress. Please reopen the app.');}finally{loading=false;}
  };
  void refresh();
  const foreground=()=>{if(typeof document!=='undefined'&&!document.hidden)void refresh();};
  const listener=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',foreground);
  const midnight=setInterval(()=>{if(localDay(new Date())!==lastDay&&(typeof document==='undefined'?AppState.currentState==='active':!document.hidden))void refresh();},60000);
  return()=>{live=false;listener.remove();clearInterval(midnight);if(typeof document!=='undefined')document.removeEventListener('visibilitychange',foreground);};
 },[]));
 const english=journeyUnits.filter(unit=>unit.area==='english'),social=journeyUnits.filter(unit=>unit.area==='social');
 const greeting=now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':'Good evening';
 const message=visit?visitMessage(visit):null;
 const area=(value:'english'|'social')=>router.push({pathname:'/journey',params:{area:value}});
 const course=(title:string,description:string,icon:Icon,bg:string,accent:string,done:number,total:number,go:()=>void,jeep=false)=><TouchableOpacity key={title} accessibilityRole="button" accessibilityLabel={`${title}, ${done} of ${total} levels complete`} activeOpacity={.85} onPress={go} style={[s.course,{backgroundColor:bg},wide&&s.wideCourse]}>
  <View style={[s.courseIcon,{backgroundColor:accent}]}>{jeep?<DriverJeep width={55} height={53}/>:<Ionicons name={icon} size={27} color="white"/>}</View>
  <View style={{flex:1}}><Text style={s.courseTitle}>{title}</Text><Text style={s.description}>{description}</Text><Text style={s.meta}>{done} / {total} {jeep?'levels complete':'skills mastered'}</Text></View><Ionicons name="arrow-forward" size={21} color={C.green}/>
 </TouchableOpacity>;
 return <View style={s.root}><StatusBar barStyle="dark-content"/><ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content,{paddingTop:insets.top+16,paddingLeft:18+insets.left,paddingRight:18+insets.right,paddingBottom:20}]}>
  <View style={s.row}><View style={s.brandIcon}><Ionicons name="leaf" size={21} color={C.lime}/></View><Text style={s.brandName}>My English Journey</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit your name" onPress={()=>setEditing(value=>!value)} style={s.avatar}><GameCharacter height={35} portrait/></TouchableOpacity></View>
  {editing&&<View style={s.nameCard}><Text style={s.description}>What should we call you?</Text><TextInput accessibilityLabel="Your name" placeholder="Your first name" placeholderTextColor={C.muted} value={name} onChangeText={setName} maxLength={35} style={s.input}/><TouchableOpacity accessibilityRole="button" style={s.save} onPress={()=>{void AsyncStorage.setItem('learnerName',name.trim()).then(()=>{setName(name.trim());setEditing(false);}).catch(()=>setError('Could not save your name. Please try again.'));}}><Text style={s.saveText}>Save my name</Text></TouchableOpacity></View>}
  <Text style={s.greeting}>{greeting}{name?`, ${name}`:''}</Text>
  <Text style={[s.headline,compact&&{fontSize:28,lineHeight:34}]}>A little braver, every day.</Text>
  <Text style={s.sectionTitle}>Where will you go today?</Text>
  <View style={[s.courses,wide&&{flexDirection:'row',flexWrap:'wrap'}]}>
   {course('Everyday English','School days, shopping, and everyday life.','book-outline','#E3EDE9','#447866',english.filter(unit=>mastered.includes(unit.id)).length,english.length,()=>area('english'))}
   {course('Conversations','Meet people and practice real conversations.','chatbubbles-outline','#F7E5DA','#AD6548',social.filter(unit=>mastered.includes(unit.id)).length,social.length,()=>area('social'))}
   {course('California Driving','Learn the rules. Explore the map.','car-sport-outline','#E8EDCC','#DCE4B9',driving.length,adventureLevels.length,()=>router.push('/dmv-adventure'),true)}
  </View>
  {message&&<View accessibilityLiveRegion="polite" style={s.streak}><View style={s.streakIcon}><Ionicons name="flame" size={23} color="#BB7135"/></View><View style={{flex:1}}><Text style={s.streakTitle}>{message.title}</Text><Text style={s.streakMessage}>{message.message}</Text></View></View>}
  {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
 </ScrollView><View style={[s.navOuter,{paddingBottom:Math.max(insets.bottom,8)}]}><View style={s.nav}>{([{label:'Home',icon:'home-outline',go:()=>scroll.current?.scrollTo({y:0,animated:true}),active:true},{label:'Learn',icon:'book-outline',go:()=>area('english')},{label:'Drive',icon:'car-sport-outline',go:()=>router.push('/dmv-adventure')},{label:'Progress',icon:'stats-chart-outline',go:()=>router.push('/progress')}] as {label:string;icon:Icon;go:()=>void;active?:boolean}[]).map(item=><TouchableOpacity key={item.label} accessibilityRole="button" accessibilityState={{selected:!!item.active}} onPress={item.go} style={[s.navItem,item.active&&s.navActive]}><Ionicons name={item.icon} size={22} color={item.active?C.green:C.muted}/><Text style={[s.navLabel,item.active&&{color:C.green,fontWeight:'900'}]}>{item.label}</Text></TouchableOpacity>)}</View></View></View>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:C.paper},content:{width:'100%',maxWidth:1000,alignSelf:'center'},row:{flexDirection:'row',alignItems:'center',gap:10},brandIcon:{width:37,height:40,borderRadius:14,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},brandName:{fontSize:17,fontWeight:'900',letterSpacing:-.5,color:C.ink,flex:1},avatar:{width:43,height:43,borderRadius:23,backgroundColor:'#E7EBDD',alignItems:'center',justifyContent:'center'},greeting:{color:C.muted,fontSize:13,fontWeight:'600',marginTop:21},headline:{fontSize:32,lineHeight:38,fontWeight:'900',letterSpacing:-1,color:C.ink,marginTop:7,maxWidth:700},sectionTitle:{fontSize:15,fontWeight:'700',color:C.green,marginTop:20,marginBottom:12},courses:{gap:11},course:{padding:16,borderRadius:22,minHeight:112,flexDirection:'row',alignItems:'center',gap:13},wideCourse:{flexGrow:1,flexBasis:280},courseIcon:{width:53,height:56,borderRadius:18,alignItems:'center',justifyContent:'center'},courseTitle:{fontSize:19,lineHeight:25,fontWeight:'800',letterSpacing:-.4,color:C.ink},description:{fontSize:12,lineHeight:18,color:C.muted,marginTop:4},meta:{fontSize:10,lineHeight:16,fontWeight:'600',color:C.green,marginTop:6},streak:{backgroundColor:'#F5ECD9',borderRadius:20,padding:15,marginTop:16,flexDirection:'row',alignItems:'center',gap:12},streakIcon:{width:39,height:42,borderRadius:15,backgroundColor:'#FAF3E5',alignItems:'center',justifyContent:'center'},streakTitle:{fontSize:16,lineHeight:22,fontWeight:'800',color:C.green},streakMessage:{fontSize:12,lineHeight:18,color:C.muted,marginTop:3},navOuter:{backgroundColor:C.paper,borderTopWidth:1,borderColor:C.line,paddingTop:8},nav:{width:'100%',maxWidth:960,alignSelf:'center',flexDirection:'row',justifyContent:'space-around',paddingHorizontal:12,gap:4},navItem:{minHeight:51,flex:1,maxWidth:140,alignItems:'center',justifyContent:'center',gap:4,borderRadius:17,padding:7},navActive:{backgroundColor:'#E8EFDC'},navLabel:{fontSize:9,color:C.muted,fontWeight:'600'},nameCard:{backgroundColor:'white',borderWidth:1,borderColor:C.line,padding:18,borderRadius:19,marginTop:17},input:{minHeight:48,borderBottomWidth:1,borderColor:C.line,fontSize:20,color:C.ink,marginTop:10,paddingVertical:8},save:{marginTop:12,padding:13,backgroundColor:C.green,borderRadius:13,alignItems:'center'},saveText:{color:'white',fontWeight:'800'},error:{color:'#A34D3F',fontSize:12,lineHeight:20,marginTop:16}
});
