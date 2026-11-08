import {worldAnchors} from './neighborhoodScene';
import React,{useEffect,useRef,useState,useCallback} from 'react';
import {View,Text,Image,TouchableOpacity,StyleSheet,Animated,Easing,AccessibilityInfo} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {neighborhoodPlaces,NeighborhoodPlace} from './neighborhood';
import {theme} from './theme';

function FlyingBirds({width,height,paused}:{width:number;height:number;paused:boolean}){
 const flight=useRef(new Animated.Value(0)).current,flap=useRef(new Animated.Value(0)).current;
 const [reduce,setReduce]=useState(true);
 useEffect(()=>{let live=true;void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(live)setReduce(value);});const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);return()=>{live=false;listener.remove();};},[]);
 useFocusEffect(useCallback(()=>{
  if(reduce||paused)return;
  const travel=Animated.loop(Animated.timing(flight,{toValue:1,duration:22000,easing:Easing.linear,useNativeDriver:true}));
  const wings=Animated.loop(Animated.sequence([Animated.timing(flap,{toValue:1,duration:420,useNativeDriver:true}),Animated.timing(flap,{toValue:0,duration:420,useNativeDriver:true})]));
  travel.start();wings.start();return()=>{travel.stop();wings.stop();};
 },[reduce,paused,flight,flap]));
 if(reduce||paused)return null;
 return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
  {[0,1,2].map(group=><Animated.View key={group} style={[s.flock,{top:height*(.13+group*.28),transform:[{translateX:flight.interpolate({inputRange:[0,1],outputRange:group%2?[width+55,-100]:[-80,width+100]})},{translateY:flight.interpolate({inputRange:[0,.5,1],outputRange:[0,-22,10]})}]}]}>
   {[0,1,2].map(bird=><View key={bird} style={[s.bird,{left:bird*23,top:bird%2?12:0,transform:[{scale:1-bird*.13}]}]}>
    <Animated.View style={[s.wing,s.leftWing,{transform:[{rotate:flap.interpolate({inputRange:[0,1],outputRange:['-12deg','-48deg']})}]}]}/><Animated.View style={[s.wing,s.rightWing,{transform:[{rotate:flap.interpolate({inputRange:[0,1],outputRange:['12deg','48deg']})}]}]}/>
   </View>)}
  </Animated.View>)}
 </View>;
}
export default function NeighborhoodWorld({selected,mastered,translated,onVisit,onFocusPoint}:{selected:NeighborhoodPlace;mastered:string[];translated:boolean;onVisit:(place:NeighborhoodPlace)=>void;onFocusPoint:(y:number)=>void}){
 const [width,setWidth]=useState(400),[paused,setPaused]=useState(false),[reduce,setReduce]=useState(true);
 const height=width*2,marker=useRef(new Animated.ValueXY({x:width*.44-17,y:height*.17-22})).current,positioned=useRef(false);
 useEffect(()=>{let live=true;void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(live)setReduce(value);});const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);return()=>{live=false;listener.remove();};},[]);
 useEffect(()=>{
  const anchor=worldAnchors[selected.id],target={x:width*anchor.streetX-17,y:height*anchor.streetY-22};
  onFocusPoint(Math.max(0,height*anchor.y-180));
  if(!positioned.current||reduce){marker.setValue(target);positioned.current=true;return;}
  const animation=Animated.timing(marker,{toValue:target,duration:700,easing:Easing.inOut(Easing.quad),useNativeDriver:false});animation.start();return()=>animation.stop();
 },[selected.id,width,height,reduce,marker,onFocusPoint]);
 return <View style={s.outer}>
  <View style={s.world} onLayout={event=>setWidth(event.nativeEvent.layout.width)}>
   <Image source={require('../assets/neighborhood/living-neighborhood-v2.webp')} style={{width:'100%',height}} resizeMode="stretch" accessible={false}/>
   <FlyingBirds width={width} height={height} paused={paused}/>
   {neighborhoodPlaces.map(place=>{
    const point=worldAnchors[place.id],count=place.lessons.filter(id=>mastered.includes(id)).length,done=count===place.lessons.length,active=selected.id===place.id;
    return <TouchableOpacity key={place.id} accessibilityRole="button" accessibilityLabel={`Visit ${place.name}, ${count} of ${place.lessons.length} missions complete${done?', place mastered':''}`} accessibilityState={{selected:active}} activeOpacity={.86} onPress={()=>onVisit(place)} style={[s.destination,{left:`${point.x*100-22}%`,top:height*point.y-90,width:'44%',height:90}]}>
     <View style={[s.placeLabel,active&&s.activeLabel]}><View style={s.nameRow}>{done&&<Ionicons name="checkmark-circle" size={14} color={active?theme.lime:theme.green}/>}<Text maxFontSizeMultiplier={1.4} style={[s.name,active&&s.activeText]}>{place.name}</Text></View>{translated&&<Text maxFontSizeMultiplier={1.4} style={[s.dari,active&&{color:'#E3EDE9'}]}>{place.dari}</Text>}<Text maxFontSizeMultiplier={1.3} style={[s.count,active&&{color:'#E3EDE9'}]}>{done?'Place mastered':`${count}/${place.lessons.length} missions`}</Text></View>
    </TouchableOpacity>;
   })}
   <Animated.View pointerEvents="none" style={[s.traveler,{transform:marker.getTranslateTransform()}]}><View style={s.person}><Ionicons name="walk" size={25} color={theme.green}/></View><Text style={s.you}>YOU</Text></Animated.View>
   <View style={s.sceneHint} pointerEvents="none"><Ionicons name="footsteps-outline" size={15} color={theme.green}/><Text style={s.hintText}>A little English, out in the world. Tap a place to visit.</Text></View>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel={paused?'Resume birds in flight':'Pause birds in flight'} onPress={()=>setPaused(value=>!value)} style={s.motionButton}><Ionicons name={paused?'play-outline':'pause-outline'} size={16} color={theme.green}/><Text style={s.motionText}>{paused?'Play scenery':'Pause scenery'}</Text></TouchableOpacity>
  </View>
  <View style={s.footer}><Ionicons name="ribbon-outline" size={22} color={theme.green}/><Text style={s.footerText}>A neighborhood to make your own.</Text><Text style={s.footerNote}>Visit a place, practice a real-life moment, and earn its stamp.</Text></View>
 </View>;
}
const s=StyleSheet.create({
 outer:{width:'100%',maxWidth:760},world:{width:'100%',backgroundColor:'#A6B881',position:'relative',overflow:'hidden'},destination:{position:'absolute',alignItems:'center',justifyContent:'flex-end',zIndex:3},placeLabel:{maxWidth:180,minWidth:85,borderRadius:12,backgroundColor:'#FFFDFAF2',borderWidth:1,borderColor:'#FFFFFFB8',paddingVertical:7,paddingHorizontal:10,shadowColor:'#193C35',shadowOpacity:.20,shadowRadius:7,shadowOffset:{width:0,height:3},elevation:3},activeLabel:{backgroundColor:theme.green,borderColor:theme.lime,borderWidth:2},nameRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:4},name:{fontSize:12,lineHeight:16,fontWeight:'800',color:theme.ink,textAlign:'center',flexShrink:1},activeText:{color:'white'},dari:{fontSize:12,lineHeight:19,color:theme.muted,textAlign:'right',writingDirection:'rtl',marginTop:2},count:{fontSize:9,lineHeight:14,color:theme.muted,textAlign:'center',marginTop:2},traveler:{position:'absolute',left:0,top:0,width:34,alignItems:'center',zIndex:4},person:{width:34,height:34,borderRadius:18,backgroundColor:theme.surface,borderWidth:2,borderColor:theme.green,alignItems:'center',justifyContent:'center',shadowColor:'#193C35',shadowOpacity:.2,shadowRadius:5,elevation:4},you:{fontSize:7,fontWeight:'900',color:theme.green,backgroundColor:theme.lime,paddingHorizontal:6,paddingVertical:2,borderRadius:4,marginTop:2},sceneHint:{position:'absolute',left:12,right:12,top:12,backgroundColor:'#FFFDFAED',borderRadius:13,padding:11,flexDirection:'row',alignItems:'center',gap:7,zIndex:4},hintText:{fontSize:10,lineHeight:16,color:theme.green,fontWeight:'700',flex:1},motionButton:{position:'absolute',right:12,bottom:12,borderRadius:12,padding:9,backgroundColor:'#FFFDFAED',flexDirection:'row',gap:5,alignItems:'center',minHeight:40,zIndex:4},motionText:{fontSize:10,fontWeight:'700',color:theme.green},flock:{position:'absolute',left:0,width:90,height:35,zIndex:2},bird:{position:'absolute',width:20,height:12},wing:{position:'absolute',top:2,width:11,height:8,borderTopWidth:2,borderColor:'#29382C',borderRadius:8},leftWing:{left:0},rightWing:{left:9},footer:{padding:20,backgroundColor:theme.paper,alignItems:'center'},footerText:{fontSize:17,lineHeight:24,fontWeight:'800',color:theme.ink,marginTop:8},footerNote:{fontSize:12,lineHeight:20,color:theme.muted,textAlign:'center',marginTop:5},
});
