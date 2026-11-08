import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {VOICE_TARGET} from '../src/voiceAssessment';
import PageBack from '../src/PageBack';
import { theme } from '../src/theme';
import { Redirect } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { speakEnglish, stopEnglishAudio } from '../src/englishAudio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lessons, englishShare } from '../src/lessons';
const API = process.env.EXPO_PUBLIC_API_URL || '';
export default function Practice() {
    const { id } = useLocalSearchParams<{
        id: string;
    }>();
    const router = useRouter();
    const insets=useSafeAreaInsets();
    const lesson = lessons.find(x => x.id === id);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [completed, setCompleted] = useState(0);
    const [ratio, setRatio] = useState(.3);
    const [showDari, setShowDari] = useState(true);
    const [turn, setTurn] = useState(0);
    const attempts = useRef(0);
    useEffect(() => { (async () => { const done = JSON.parse(await AsyncStorage.getItem('done') || '[]'); const scores = JSON.parse(await AsyncStorage.getItem('scores') || '[]'); setRatio(englishShare(done.length, scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0)); setCompleted(done.length); })(); }, []);
    useEffect(() => () => { void stopEnglishAudio(); }, []);
    const englishRoute: Record<string, string> = { repeat: 'clarify', teacher: 'grade4-conference', volunteer: 'parent-volunteer-time', message: 'parent-playdate-details' };
    if (id && englishRoute[id])
        return <Redirect href={{ pathname: '/journey-lesson', params: { id: englishRoute[id] } }}/>;
    if (!lesson)
        return <Text>Lesson not found</Text>;
    async function start() {
        try {
            await stopEnglishAudio();
            if (!API) {
                Alert.alert('AI setup needed', 'Set EXPO_PUBLIC_API_URL to your HTTPS backend before recording.');
                return;
            }
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Microphone permission needed');
                return;
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording: r } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(r);
        }
        catch (e: any) {
            Alert.alert('Recording error', e.message);
        }
    }
    async function stop() {
        if (!recording || !lesson)
            return;
        setRecording(null);
        setBusy(true);
        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
            const uri = recording.getURI();
            if (!uri)
                throw new Error('No recording captured');
            const form = new FormData();
            form.append('audio', { uri, name: 'practice.m4a', type: 'audio/mp4' } as any);
            form.append('lessonId', lesson.id);
            form.append('turn', String(turn));
            const res = await fetch(`${API}/api/practice`, { method: 'POST', body: form });
            const result = await res.json();
            if (!res.ok)
                throw new Error(result.error || 'AI service unavailable');
            attempts.current++;
            setFeedback({...result, mastered: !!result.mastered && Number.isFinite(result.score) && result.score >= VOICE_TARGET});
            if (result.reply)
                void speakEnglish(result.reply).catch(error => Alert.alert('Audio unavailable', error.message));
            if (result.mastered && result.score >= VOICE_TARGET) {
                const done: string[] = JSON.parse(await AsyncStorage.getItem('done') || '[]');
                const scores: number[] = JSON.parse(await AsyncStorage.getItem('scores') || '[]');
                if (!done.includes(lesson.id)) {
                    await AsyncStorage.setItem('done', JSON.stringify([...done, lesson.id]));
                    await AsyncStorage.setItem('scores', JSON.stringify([...scores, result.score]));
                }
                setTurn(t => t + 1);
            }
        }
        catch (e: any) {
            Alert.alert('Could not evaluate speech', e.message);
        }
        finally {
            setBusy(false);
        }
    }
    return <ScrollView style={s.page} contentContainerStyle={[{width:'100%',maxWidth:theme.width,alignSelf:'center'},{paddingTop:insets.top+20,paddingBottom:insets.bottom+30,paddingLeft:20+insets.left,paddingRight:20+insets.right}]}><PageBack onPress={()=>router.canGoBack()?router.back():router.replace('/')}/><Text style={s.tag}>{lesson.category.toUpperCase()} • VOICE PRACTICE</Text><Text style={s.title}>{lesson.title}</Text><Text style={s.dari}>{lesson.dariTitle}</Text>
    <View style={s.card}><Text style={s.label}>YOUR AI TUTOR ASKS</Text><Text style={s.prompt}>{lesson.scene}</Text>{(showDari || ratio < .5) && <Text style={s.dari}>{lesson.dariHelp}</Text>}<TouchableOpacity onPress={() => void speakEnglish(lesson.scene).catch(error => Alert.alert('Audio unavailable', error.message))} style={s.audio}><Text style={s.audioText}>🔊 Listen to the question</Text></TouchableOpacity></View>
    <View style={s.card}><Text style={s.label}>YOUR SPEAKING GOAL</Text><Text style={s.goal}>{lesson.goal}</Text><TouchableOpacity onPress={() => setShowDari(x => !x)}><Text style={s.hint}>{showDari ? 'Hide' : 'Show'} Dari explanation</Text></TouchableOpacity></View>
    <TouchableOpacity disabled={busy} onPress={recording ? stop : start} style={[s.mic, recording && { backgroundColor: theme.error }]}><Text style={{ fontSize: 34 }}>{recording ? '⏹' : '🎤'}</Text><Text style={s.micText}>{recording ? 'Stop and check my English' : busy ? 'Checking your answer…' : 'Tap to speak your answer'}</Text></TouchableOpacity>{busy && <ActivityIndicator color={theme.green} size="large" style={{ marginTop: 16 }}/>}
    {feedback && <View style={s.card}><Text style={s.label}>YOUR SPEAKING FEEDBACK</Text><Text style={s.score}>{feedback.score}% · {feedback.mastered ? 'Great progress!' : 'Keep practicing 💜'}</Text><Text style={s.goal}>Heard: “{feedback.transcript}”</Text><Text style={s.goal}>{feedback.feedbackEnglish}</Text><Text style={s.dari}>{feedback.feedbackDari}</Text><Text style={s.goal}>Tutor: {feedback.reply}</Text>{feedback.mastered ? <TouchableOpacity style={s.next} onPress={() => router.back()}><Text style={s.nextText}>Celebrate & return to lessons ✨</Text></TouchableOpacity> : <Text style={s.hint}>Try again. You can listen to the question as many times as you need.</Text>}</View>}
    <Text style={s.foot}>{VOICE_TARGET}% is an AI-generated practice estimate of meaning and clarity, not a certified pronunciation score. The tutor should not punish accent differences. Audio is sent to the configured AI provider for evaluation.</Text>
    </ScrollView>;
}
const s = StyleSheet.create({
    page: {
        backgroundColor: theme.paper,
        flex: 1
    },
    back: { color: theme.green, fontWeight: '700', marginBottom: 30, fontSize: 13 },
    tag: {
        fontSize: 12,
        color: theme.green,
        fontWeight: '900',
        letterSpacing: 1
    },
    title: { color: theme.ink, marginTop: 8, fontSize: 30, lineHeight: 37, fontWeight: '800', letterSpacing: -1 },
    dari: {
        fontSize: 16,
        color: theme.muted,
        marginTop: 12,
        lineHeight: 25
    },
    card: { backgroundColor: theme.surface, padding: 23, marginTop: 20, borderWidth: 1, borderColor: theme.line, borderRadius: theme.radius },
    label: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.muted,
        letterSpacing: 1.3
    },
    prompt: { fontSize: 21, color: theme.ink, lineHeight: 30, marginTop: 13, fontWeight: '700' },
    audio: {
        backgroundColor: theme.sage,
        padding: 14,
        borderRadius: 14,
        marginTop: 20
    },
    audioText: {
        color: theme.green,
        fontWeight: '800',
        textAlign: 'center'
    },
    goal: {
        fontSize: 16,
        color: theme.muted,
        lineHeight: 24,
        marginTop: 12
    },
    hint: {
        color: theme.green,
        marginTop: 16,
        fontWeight: '700'
    },
    mic: { marginTop: 22, backgroundColor: theme.green, alignItems: 'center', gap: 8, minHeight: 58, padding: 18, borderRadius: theme.buttonRadius },
    micText: {
        fontSize: 17,
        fontWeight: '800',
        color: 'white'
    },
    score: {
        fontSize: 26,
        fontWeight: '900',
        color: theme.green,
        marginTop: 12
    },
    next: { backgroundColor: theme.green, padding: 16, marginTop: 18, minHeight: 52, borderRadius: theme.buttonRadius },
    nextText: {
        color: 'white',
        fontWeight: '800',
        textAlign: 'center'
    },
    foot: {
        fontSize: 12,
        color: theme.muted,
        lineHeight: 19,
        marginTop: 22
    }
});
