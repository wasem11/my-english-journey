import type {ListeningExercise} from './listeningExercise';
import ConversationStage from './ConversationStage';
import {worldForLesson,worldsForArea,conversationCharacter} from './conversationWorlds';
import {englishLevelProgress} from './englishLevelProgress';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,Modal,StyleSheet,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {JourneyUnit,journeyUnits} from './journeyContent';
import {VoiceAssessment,VOICE_TARGET} from './voiceAssessment';
import {placeMissions} from './neighborhood';
import LearningTrail from './LearningTrail';
import {gameEnvironments} from './EnglishGameScenery';
import VoiceChallenge from './VoiceChallenge';
import FamilyConversation from './FamilyConversation';
import RewardEstimate from './RewardEstimate';
import {stopEnglishAudio} from './englishAudio';
import {theme} from './theme';
type QuizState={selected:number|null;checked:boolean;select:(index:number)=>void;check:()=>void;retry:()=>void};
type Props={autoStart?:boolean;unit:JourneyUnit;listeningExercise:ListeningExercise;quiz:QuizState;listening:QuizState;voice:VoiceAssessment|null;onAssessment:(value:VoiceAssessment|null)=>void;finished:boolean;saving:boolean;rewardAdded:number;saveError:string;audioError:string;translated:boolean;toggleDari:()=>void;say:(text:string)=>void;onComplete:()=>void;onAdvance:()=>void;onClose:()=>void};
export default function EnglishLevelGame(p:Props){
 const {unit,quiz,listening,voice}=p,place=worldForLesson(unit.id)!;
 const insets=useSafeAreaInsets(),{height}=useWindowDimensions(),scroll=useRef<ScrollView>(null);
 const [travelling,setTravelling]=useState<string|null>(null);
 const [activity,setActivity]=useState<string|null>(null),[conversation,setConversation]=useState(false),[playerSpeaking,setPlayerSpeaking]=useState(false);
 const social=unit.area==='social',displayPlace=social?{...place,npc:conversationCharacter(unit.id)}:place;
 const env=gameEnvironments[place.id];
 const level=placeMissions(place).findIndex(u=>u.id===unit.id)+1,world=worldsForArea(unit.area).findIndex(item=>item.id===place.id)+1;
 const {quizDone,listenDone,speakingPassed,nodes,next}=englishLevelProgress(unit,quiz,listening,voice,p.finished,p.listeningExercise.correct);
 const focus=useCallback((y:number)=>scroll.current?.scrollTo({y:Math.max(0,y-height*.26),animated:true}),[height]);
 const close=()=>{setActivity(null);void stopEnglishAudio();};
 useEffect(()=>{setActivity(null);setConversation(false);setTravelling(null);if(p.autoStart){const timer=setTimeout(()=>setActivity('listen'),450);return()=>clearTimeout(timer);}},[unit.id,p.autoStart]);
 useEffect(()=>{if(p.finished)setActivity(null);},[p.finished]);
 const open=(id:string)=>{if(nodes.find(node=>node.id===id)?.ready){void stopEnglishAudio();setActivity(id);}};
 useEffect(()=>{
  const cleared=activity==='listen'?listenDone:activity==='choose'?quizDone:false;
  if(!cleared)return;
  const destination=activity==='listen'?'choose':'speak';
  const timer=setTimeout(()=>{setTravelling(destination);close();},1100);
  return()=>clearTimeout(timer);
 },[activity,listenDone,quizDone]);
 useEffect(()=>{if(!p.finished)return;const timer=setTimeout(p.onAdvance,1000);return()=>clearTimeout(timer);},[p.finished,p.onAdvance]);
 const arrived=useCallback(()=>{if(travelling){if(travelling!=='speak')setActivity(travelling);setTravelling(null);}},[travelling]);
 const choices=p.listeningExercise.choices;
 return <View style={[s.root,{backgroundColor:env.ground,paddingLeft:insets.left,paddingRight:insets.right}]}>
  <View style={[s.hud,{paddingTop:insets.top+8}]}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Return to world map" onPress={p.onClose} style={s.iconButton}><Ionicons name="close" size={24} color="white"/></TouchableOpacity><View style={{flex:1}}><Text style={s.kicker}>LEVEL {level} · {env.name.toUpperCase()}</Text><Text numberOfLines={2} style={s.levelTitle}>{unit.title}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={p.translated?'Hide Afghan Dari':'Translate to Afghan Dari'} onPress={p.toggleDari} style={s.iconButton}><Ionicons name="language-outline" size={23} color="white"/></TouchableOpacity></View>
  <RewardEstimate compact area={unit.area} refreshKey={String(p.finished)}/>
  <ScrollView ref={scroll} contentContainerStyle={s.mapContent}><LearningTrail place={displayPlace} nodes={nodes} onStart={open} onFocusPoint={focus} suspended={!!activity} onArrive={arrived} translated={p.translated} variant={level+world} heading={unit.title} subheading={`Level ${level} · ${nodes.filter(n=>n.done).length}/3 checkpoints`}/></ScrollView>
  <View style={[s.dock,{paddingBottom:Math.max(insets.bottom,12)}]}><View style={{flex:1}}><Text style={s.dockKicker}>{p.finished?'LEVEL MASTERED':'NEXT CHECKPOINT'}</Text><Text style={s.dockTitle}>{p.finished?(p.rewardAdded?`+$${p.rewardAdded} reward estimate`:'Great practice. Your reward is already counted.'):next.title}</Text></View><TouchableOpacity accessibilityRole="button" onPress={()=>p.finished?p.onClose():open(next.id)} style={s.primary}><Text style={s.primaryText}>{p.finished?'World map':'Let’s play'}</Text><Ionicons name="arrow-forward" size={18} color={theme.green}/></TouchableOpacity></View>
  <Modal visible={!!activity} transparent animationType="slide" onRequestClose={close}><View style={s.overlay}><TouchableOpacity style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close checkpoint" onPress={close}/><View accessibilityViewIsModal style={[s.sheet,{maxHeight:height*.90,paddingBottom:insets.bottom}]}>
   <View style={s.sheetHeader}><View style={s.stageIcon}><Ionicons name={activity==='choose'?'chatbubble-ellipses-outline':activity==='listen'?'headset-outline':'mic-outline'} size={23} color={theme.green}/></View><View style={{flex:1}}><Text style={s.dockKicker}>LEVEL {level} · CHECKPOINT {nodes.findIndex(node=>node.id===activity)+1}/3</Text><Text style={s.sheetTitle}>{nodes.find(node=>node.id===activity)?.title}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={p.translated?'Hide Afghan Dari':'Translate checkpoint to Afghan Dari'} onPress={p.toggleDari} style={s.closeButton}><Ionicons name="language-outline" size={21} color={theme.green}/></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel="Return to level map" onPress={close} style={s.closeButton}><Ionicons name="close" size={23} color={theme.green}/></TouchableOpacity></View>
   <ScrollView contentContainerStyle={s.activityContent}>
    {!!p.audioError&&<Text accessibilityRole="alert" style={s.error}>{p.audioError}</Text>}
    {activity==='choose'?<>
     {social&&<ConversationStage unit={unit} translated={p.translated} replyReady={quizDone}/>}
     <View style={social?{marginBottom:14}:s.prompt}><Text style={social?s.body:s.question}>{unit.prompt}</Text>{p.translated&&<Text style={s.dari}>{unit.promptDari}</Text>}{!social&&<TouchableOpacity accessibilityRole="button" onPress={()=>p.say(unit.prompt)} style={s.audio}><Ionicons name="volume-high" size={19} color={theme.green}/><Text style={s.audioText}>Listen to the situation</Text></TouchableOpacity>}</View>
     {unit.choices.map((choice,i)=><TouchableOpacity key={i} accessibilityRole="button" disabled={quiz.checked} onPress={()=>quiz.select(i)} style={[s.answer,quiz.selected===i&&s.selected,quiz.checked&&i===unit.correct&&s.correct]}><View style={s.letter}><Text style={s.letterText}>{String.fromCharCode(65+i)}</Text></View><View style={{flex:1}}><Text style={s.answerText}>{choice.en}</Text>{p.translated&&<Text style={s.dari}>{choice.dari}</Text>}</View></TouchableOpacity>)}
     {quiz.checked&&<View style={[s.feedback,!quizDone&&{backgroundColor:theme.peach}]}><Text style={s.feedbackTitle}>{quizDone?'Checkpoint cleared!':'Try this one again'}</Text><Text style={s.body}>{unit.explain}</Text>{p.translated&&<Text style={s.dari}>{unit.explainDari}</Text>}</View>}
     <TouchableOpacity accessibilityRole="button" disabled={!quiz.checked&&quiz.selected===null} onPress={()=>!quiz.checked?quiz.check():quizDone?close():quiz.retry()} style={[s.action,!quiz.checked&&quiz.selected===null&&{opacity:.45}]}><Text style={s.actionText}>{!quiz.checked?'Check my reply':quizDone?'Continue to next checkpoint':'Try again'}</Text></TouchableOpacity>
    </>:activity==='listen'?<>
     {social&&<ConversationStage unit={unit} translated={p.translated} mode="listen" replyReady={listenDone} listeningReply={p.listeningExercise.phrase}/>}
     {!social&&<View style={s.prompt}><Text style={s.question}>Which phrase do you hear?</Text>{p.translated&&<Text style={s.dari}>کدام جمله را می‌شنوید؟</Text>}<TouchableOpacity accessibilityRole="button" accessibilityLabel="Play the English listening phrase" onPress={()=>p.say(p.listeningExercise.phrase.en)} style={s.audio}><Ionicons name="volume-high" size={22} color={theme.green}/><Text style={s.audioText}>Play English phrase</Text></TouchableOpacity></View>}
     {choices.map((choice,i)=><TouchableOpacity key={i} accessibilityRole="button" disabled={listening.checked} onPress={()=>listening.select(i)} style={[s.answer,listening.selected===i&&s.selected,listening.checked&&i===p.listeningExercise.correct&&s.correct]}><View style={{flex:1}}><Text style={s.answerText}>{choice.en}</Text>{p.translated&&<Text style={s.dari}>{choice.dari}</Text>}</View></TouchableOpacity>)}
     {listening.checked&&<Text style={s.body}>{listenDone?'Checkpoint cleared! You recognized the phrase.':'Listen again, then choose the matching phrase.'}</Text>}
     <TouchableOpacity accessibilityRole="button" disabled={!listening.checked&&listening.selected===null} onPress={()=>!listening.checked?listening.check():listenDone?close():listening.retry()} style={[s.action,!listening.checked&&listening.selected===null&&{opacity:.45}]}><Text style={s.actionText}>{!listening.checked?'Check listening':listenDone?'Continue to next checkpoint':'Try listening again'}</Text></TouchableOpacity>
    </>:activity==='speak'?<>
     {social&&<ConversationStage unit={unit} translated={p.translated} mode="speak" playerSpeaking={playerSpeaking}/>}
     {unit.dialogue&&<><TouchableOpacity accessibilityRole="button" disabled={playerSpeaking} onPress={()=>setConversation(value=>!value)} style={s.audio}><Ionicons name="chatbubbles-outline" size={21} color={theme.green}/><Text style={s.audioText}>{conversation?'Hide practice conversation':'Practice a short conversation first'}</Text></TouchableOpacity>{conversation&&!playerSpeaking&&<FamilyConversation unit={unit} translated={p.translated} onSpeak={p.say}/>}</>}
     <VoiceChallenge unit={unit} translated={p.translated} onAssessment={p.onAssessment} onSpeakingChange={setPlayerSpeaking}/>
     {speakingPassed&&<View style={s.feedback}><Text style={s.feedbackTitle}>Speaking target reached!</Text><Text style={s.body}>{voice!.score}% on your voice assessment. Review your score, then tap Next to save this level.</Text></View>}
     {!!p.saveError&&<Text accessibilityRole="alert" style={s.error}>{p.saveError}</Text>}
     <TouchableOpacity accessibilityRole="button" disabled={!speakingPassed||p.saving} onPress={p.onComplete} style={[s.action,(!speakingPassed||p.saving)&&{opacity:.45}]}><Text style={s.actionText}>{p.saving?'Saving level...':speakingPassed?'Next':`Reach ${VOICE_TARGET}% to finish this level`}</Text></TouchableOpacity>
    </>:null}
   </ScrollView>
  </View></View></Modal>
 </View>;
}
const s=StyleSheet.create({root:{flex:1},hud:{backgroundColor:theme.green,flexDirection:'row',gap:8,alignItems:'center',paddingHorizontal:8,paddingBottom:10},iconButton:{width:44,minHeight:44,justifyContent:'center',alignItems:'center'},kicker:{fontSize:8,lineHeight:14,fontWeight:'800',letterSpacing:1,color:theme.lime},levelTitle:{fontSize:16,lineHeight:23,fontWeight:'800',color:'white',marginTop:2},mapContent:{width:'100%',maxWidth:760,alignSelf:'center',flexGrow:1},dock:{backgroundColor:theme.paper,padding:14,flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:1,borderColor:theme.line},dockKicker:{fontSize:8,lineHeight:14,fontWeight:'800',letterSpacing:1,color:theme.muted},dockTitle:{fontSize:12,lineHeight:19,fontWeight:'700',color:theme.ink,marginTop:3},primary:{backgroundColor:theme.lime,minHeight:48,padding:13,borderRadius:16,flexDirection:'row',alignItems:'center',gap:8},primaryText:{fontSize:12,fontWeight:'800',color:theme.green},overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'#12382A80'},sheet:{width:'100%',maxWidth:640,alignSelf:'center',backgroundColor:theme.paper,borderTopLeftRadius:26,borderTopRightRadius:26,overflow:'hidden'},sheetHeader:{padding:16,borderBottomWidth:1,borderColor:theme.line,flexDirection:'row',alignItems:'center',gap:10},stageIcon:{width:45,height:45,borderRadius:16,backgroundColor:theme.olive,alignItems:'center',justifyContent:'center'},sheetTitle:{fontSize:20,lineHeight:27,fontWeight:'800',color:theme.ink},closeButton:{width:44,height:44,borderRadius:15,backgroundColor:theme.sage,alignItems:'center',justifyContent:'center'},activityContent:{padding:18,paddingBottom:30},prompt:{backgroundColor:theme.surface,padding:19,borderRadius:22,borderWidth:1,borderColor:theme.line,marginBottom:14},question:{fontSize:22,lineHeight:30,fontWeight:'800',color:theme.ink,letterSpacing:-.4},dari:{fontSize:15,lineHeight:26,color:theme.muted,textAlign:'right',writingDirection:'rtl',marginTop:8},audio:{minHeight:48,padding:13,borderRadius:15,backgroundColor:theme.sage,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginTop:14},audioText:{fontSize:12,lineHeight:20,fontWeight:'800',color:theme.green,flexShrink:1},answer:{minHeight:63,padding:15,borderRadius:18,backgroundColor:theme.surface,borderWidth:2,borderColor:theme.line,flexDirection:'row',alignItems:'center',gap:10,marginBottom:10},selected:{borderColor:theme.green,backgroundColor:theme.sage},correct:{borderColor:theme.success,backgroundColor:theme.olive},letter:{height:32,width:32,borderRadius:11,backgroundColor:theme.sage,alignItems:'center',justifyContent:'center'},letterText:{fontWeight:'800',fontSize:13,color:theme.green},answerText:{fontSize:15,lineHeight:23,color:theme.ink,fontWeight:'600'},action:{minHeight:54,padding:16,borderRadius:16,backgroundColor:theme.green,alignItems:'center',justifyContent:'center',marginTop:16},actionText:{fontSize:14,lineHeight:22,fontWeight:'800',color:'white',textAlign:'center'},feedback:{padding:18,borderRadius:20,backgroundColor:theme.olive,marginTop:13},feedbackTitle:{fontSize:18,lineHeight:25,fontWeight:'800',color:theme.green},body:{fontSize:13,lineHeight:22,color:theme.muted,marginTop:8},error:{fontSize:12,lineHeight:20,color:theme.error,backgroundColor:theme.errorBg,padding:12,borderRadius:13,marginTop:12}});
