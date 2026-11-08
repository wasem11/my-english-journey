import React from 'react';
import {TouchableOpacity,View,Text,StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {theme} from './theme';
export default function PageBack({onPress,label='My English Journey'}:{onPress:()=>void;label?:string}){
 return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Back to ${label}`} onPress={onPress} style={s.row}><View style={s.icon}><Ionicons name="arrow-back" size={21} color={theme.green}/></View><Text style={s.label}>{label}</Text></TouchableOpacity>;
}
const s=StyleSheet.create({row:{minHeight:48,flexDirection:'row',alignItems:'center',gap:11,marginBottom:18},icon:{width:42,height:42,borderRadius:16,backgroundColor:theme.sage,alignItems:'center',justifyContent:'center'},label:{fontSize:13,fontWeight:'800',color:theme.ink,flexShrink:1}});
