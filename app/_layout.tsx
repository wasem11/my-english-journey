import {Stack} from 'expo-router';
import {StatusBar,View} from 'react-native';
import {theme} from '../src/theme';
import NativeSessionGate from '../src/NativeSessionGate';
import WebVoiceAccess from '../src/WebVoiceAccess';
import {EXTERNAL_WEB_API} from '../src/nativeSession';
export default function Layout(){return <><StatusBar barStyle="dark-content"/><View style={{flex:1}}>{EXTERNAL_WEB_API&&<WebVoiceAccess/>}<NativeSessionGate><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:theme.paper},animation:'fade',animationDuration:180}}/></NativeSessionGate></View></>}
