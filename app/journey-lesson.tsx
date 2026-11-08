import {worldForLesson} from '../src/conversationWorlds';
import EnglishLevelGame from '../src/EnglishLevelGame';
import {placeForLesson} from '../src/neighborhood';
import { theme } from '../src/theme';
import { rewardForScore } from '../src/rewards';
import RewardEstimate from '../src/RewardEstimate';
import VoiceChallenge from '../src/VoiceChallenge';
import { VoiceAssessment, lessonPassed, voicePassed, VOICE_PROGRESS_KEY } from '../src/voiceAssessment';
import FamilyConversation from '../src/FamilyConversation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDariPreference } from '../src/useDariPreference';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speakEnglish, stopEnglishAudio } from '../src/englishAudio';
import { Ionicons } from '@expo/vector-icons';
import { journeyUnits } from '../src/journeyContent';
const ink = theme.ink, purple = theme.green, green = theme.green;
export default function JourneyLesson() {
    const { id } = useLocalSearchParams<{
        id: string;
    }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const unit = journeyUnits.find(x => x.id === id);
    const { translated: translate, toggleDari } = useDariPreference();
    const [selected, setSelected] = useState<number | null>(null);
    const [checked, setChecked] = useState(false);
    const [complete, setComplete] = useState(false);
    const [listenSelected, setListenSelected] = useState<number | null>(null);
    const [listeningChecked, setListeningChecked] = useState(false);
    const [voice, setVoice] = useState<VoiceAssessment | null>(null), [saving, setSaving] = useState(false), [saveError, setSaveError] = useState(''), [audioError, setAudioError] = useState('');
    const [rewardAdded, setRewardAdded] = useState(0);
    const saveLock = useRef(false);
    useEffect(() => { setVoice(null); setRewardAdded(0); setSaveError(''); setAudioError(''); setSelected(null); setChecked(false); setComplete(false); setListenSelected(null); setListeningChecked(false); return () => { void stopEnglishAudio(); }; }, [id]);
    if (!unit)
        return <View style={s.page}><Text>Lesson not found.</Text><TouchableOpacity onPress={() => router.back()}><Text>Back</Text></TouchableOpacity></View>;
    const say = (t: string) => { setAudioError(''); void speakEnglish(t).catch(error => setAudioError(error.message)); };
    const listeningChoices = unit.choices.map((choice, i) => i === unit.correct ? { en: unit.phrase, dari: unit.phraseDari } : choice);
    async function finish() {
        if (!unit || saveLock.current || !lessonPassed(checked && selected === unit.correct, listeningChecked && listenSelected === unit.correct, voice, unit.id, unit.phrase))
            return;
        saveLock.current = true;
        setSaving(true);
        setSaveError('');
        try {
            const old: string[] = JSON.parse(await AsyncStorage.getItem('mejJourneyDoneV1') || '[]');
            const assessments = JSON.parse(await AsyncStorage.getItem(VOICE_PROGRESS_KEY) || '{}');
            const wasMastered = old.includes(unit.id) && voicePassed(assessments[unit.id], unit.id, unit.phrase);
            const previousReward = wasMastered ? rewardForScore(assessments[unit.id].score) : 0;
            const best = wasMastered && assessments[unit.id].score > voice!.score ? assessments[unit.id] : voice;
            assessments[unit.id] = best;
            await AsyncStorage.multiSet([['mejJourneyDoneV1', JSON.stringify([...new Set([...old, unit.id])])], [VOICE_PROGRESS_KEY, JSON.stringify(assessments)]]);
            if (!wasMastered) {
                const now = new Date();
                const day = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
                const activity = JSON.parse(await AsyncStorage.getItem('mejActivityDaysV1') || '{}');
                activity[day] = (activity[day] || 0) + 1;
                await AsyncStorage.setItem('mejActivityDaysV1', JSON.stringify(activity));
            }
            setRewardAdded(rewardForScore(best.score) - previousReward);
            setComplete(true);
        }
        catch {
            setSaveError('Your result could not be saved. Please try again.');
        }
        finally {
            saveLock.current = false;
            setSaving(false);
        }
    }
    const correct = selected === unit.correct;
    return <EnglishLevelGame unit={unit} quiz={{selected,checked,select:setSelected,check:()=>setChecked(true),retry:()=>{setSelected(null);setChecked(false);}}} listening={{selected:listenSelected,checked:listeningChecked,select:setListenSelected,check:()=>setListeningChecked(true),retry:()=>{setListenSelected(null);setListeningChecked(false);}}} voice={voice} onAssessment={setVoice} finished={complete} saving={saving} rewardAdded={rewardAdded} saveError={saveError} audioError={audioError} translated={translate} toggleDari={toggleDari} say={say} onComplete={finish} onClose={()=>router.replace({pathname:unit.area==='social'?'/conversations':'/neighborhood',params:{place:worldForLesson(unit.id)?.id||'preschool'}})}/>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.paper,padding:20}});
