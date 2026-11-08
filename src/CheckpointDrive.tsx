import React,{useEffect,useRef,useState} from 'react';
import {Animated,AccessibilityInfo,Text,View} from 'react-native';
import DriverJeep from './DriverJeep';
import {theme} from './theme';
export default function CheckpointDrive({from,to,onArrive}:{from:number;to:number;onArrive:()=>void}){
 const progress=useRef(new Animated.Value(0)).current,arrival=useRef(onArrive);arrival.current=onArrive;
 const [width,setWidth]=useState(300);
 useEffect(()=>{let live=true;let motion:Animated.CompositeAnimation|undefined;
  void AccessibilityInfo.isReduceMotionEnabled().then(reduce=>{if(!live)return;motion=Animated.timing(progress,{toValue:1,duration:reduce?300:1600,useNativeDriver:true});motion.start(({finished})=>{if(finished&&live)arrival.current();});});
  return()=>{live=false;motion?.stop();};
 },[progress]);
 return <View accessibilityLiveRegion="polite" style={{flex:1,backgroundColor:theme.sage,justifyContent:'center',padding:24}}>
 <Text style={{fontSize:24,fontWeight:'800',color:theme.green,textAlign:'center'}}>On to the next checkpoint</Text>
 <Text style={{textAlign:'center',color:theme.muted,marginTop:12}}>Checkpoint {from} complete</Text>
 <View onLayout={event=>setWidth(event.nativeEvent.layout.width)} style={{height:220,marginTop:35}}>
 <View style={{position:'absolute',left:0,right:0,top:100,height:48,borderRadius:24,backgroundColor:'#738878'}}/>
 <View style={{position:'absolute',left:15,top:160}}><Text style={{color:theme.green,fontWeight:'800'}}>Checkpoint {from}</Text></View>
 <View style={{position:'absolute',right:0,top:160}}><Text style={{color:theme.green,fontWeight:'800'}}>Checkpoint {to}</Text></View>
 <Animated.View style={{position:'absolute',top:55,left:0,transform:[{translateX:progress.interpolate({inputRange:[0,1],outputRange:[0,Math.max(0,width-90)]})}]}}><DriverJeep width={90} height={85}/></Animated.View>
 </View></View>;
}
