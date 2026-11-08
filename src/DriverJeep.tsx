import React from 'react';
import {View,Image} from 'react-native';
import GameCharacter from './GameCharacter';
export default function DriverJeep({width=78,height=65}:{width?:number;height?:number}){const badge=Math.max(21,width*.31);return <View style={{width,height}}><Image source={require('../assets/game-art/player-jeep-blue.png')} style={{width,height}} resizeMode="contain"/><View style={{position:'absolute',left:0,top:0,width:badge,height:badge,borderRadius:badge/2,backgroundColor:'#F8F7EF',borderWidth:2,borderColor:'#204E40',overflow:'hidden',alignItems:'center',justifyContent:'center'}}><GameCharacter height={badge-4} portrait/></View></View>;}
