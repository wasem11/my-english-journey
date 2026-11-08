import React,{useEffect,useState} from 'react';
import {ActivityIndicator,KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {checkNativeSession,onSessionExpired,restoreNativeSession,signInNative} from './nativeSession';
import {theme} from './theme';

export default function NativeSessionGate({children}:{children:React.ReactNode}){
 const [ready,setReady]=useState(Platform.OS==='web'),[checking,setChecking]=useState(Platform.OS!=='web'),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const insets=useSafeAreaInsets();
 useEffect(()=>{
  if(Platform.OS==='web')return;
  let live=true;
  const unsubscribe=onSessionExpired(()=>{if(live)setReady(false);});
  void (async()=>{try{if(await restoreNativeSession()){
   try{const response=await checkNativeSession();if(live)setReady(response.status!==401);}catch{if(live)setReady(true);}
  }}catch{if(live)setError('Could not restore your sign-in. Please enter your family code.');}finally{if(live)setChecking(false);}})();
  return()=>{live=false;unsubscribe();};
 },[]);
 if(checking)return <View style={s.loading}><ActivityIndicator color={theme.green}/></View>;
 if(ready)return <>{children}</>;
 const login=async()=>{if(busy||!code)return;setBusy(true);setError('');try{await signInNative(code);setCode('');setReady(true);}catch(e){setError(e instanceof Error?e.message:'Could not sign in. Please try again.');}finally{setBusy(false);}};
 return <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content,{paddingTop:insets.top+28,paddingBottom:insets.bottom+28}]}><View style={s.card}><Text style={s.brand}>MY ENGLISH JOURNEY</Text><Text style={s.title}>Your next chapter starts here.</Text><Text style={s.body}>Enter your family access code to start learning, speaking, and exploring.</Text><Text style={s.label}>Family access code</Text><TextInput accessibilityLabel="Family access code" style={s.input} value={code} onChangeText={setCode} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" maxLength={128} editable={!busy} returnKeyType="go" onSubmitEditing={()=>void login()}/>{!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}<TouchableOpacity accessibilityRole="button" disabled={busy||!code} onPress={()=>void login()} style={[s.button,(busy||!code)&&{opacity:.55}]}>{busy?<ActivityIndicator color="white"/>:<Text style={s.buttonText}>Start my journey</Text>}</TouchableOpacity><Text style={s.note}>Use the same family code as your online app.</Text></View></ScrollView></KeyboardAvoidingView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:theme.paper},loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:theme.paper},content:{flexGrow:1,justifyContent:'center',paddingHorizontal:22},card:{width:'100%',maxWidth:440,alignSelf:'center',padding:25,borderRadius:26,backgroundColor:theme.surface,borderWidth:1,borderColor:theme.line},brand:{fontSize:10,letterSpacing:1.1,fontWeight:'800',color:theme.green},title:{fontSize:31,lineHeight:38,fontWeight:'800',color:theme.ink,marginTop:18},body:{fontSize:15,lineHeight:24,color:theme.muted,marginTop:14},label:{fontSize:13,fontWeight:'700',color:theme.ink,marginTop:25,marginBottom:9},input:{minHeight:54,borderRadius:14,borderWidth:1,borderColor:theme.line,padding:15,fontSize:17,color:theme.ink,backgroundColor:theme.paper},error:{fontSize:13,lineHeight:21,color:theme.error,marginTop:12},button:{minHeight:54,justifyContent:'center',alignItems:'center',backgroundColor:theme.green,padding:15,borderRadius:14,marginTop:18},buttonText:{color:'white',fontSize:15,fontWeight:'800'},note:{fontSize:12,lineHeight:20,color:theme.muted,marginTop:14}});
