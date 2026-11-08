import {useCallback,useState} from 'react';
import {useFocusEffect} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const DARI_KEY='mej_afghan_dari_enabled_v1';
export function useDariPreference(){
 const [translated,setTranslated]=useState(false);
 useFocusEffect(useCallback(()=>{let alive=true;AsyncStorage.getItem(DARI_KEY).then(v=>{if(alive)setTranslated(v==='true')}).catch(()=>{});return ()=>{alive=false}},[]));
 const toggleDari=useCallback(()=>{setTranslated(v=>{const next=!v;void AsyncStorage.setItem(DARI_KEY,String(next));return next})},[]);
 return {translated,toggleDari};
}
