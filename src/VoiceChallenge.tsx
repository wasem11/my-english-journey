import { theme } from './theme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import { speakEnglish, stopEnglishAudio } from './englishAudio';
import { JourneyUnit } from './journeyContent';
import { parseVoiceAssessment, VoiceAssessment, VOICE_TARGET } from './voiceAssessment';
import {apiFetch,onSessionChanged} from './nativeSession';
const API = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
export default function VoiceChallenge({ unit, translated, onAssessment, onSpeakingChange }: {
    onSpeakingChange?: (speaking:boolean)=>void;
    unit: JourneyUnit;
    translated: boolean;
    onAssessment: (value: VoiceAssessment | null) => void;
}) {
    const [recording, setRecording] = useState(false), [busy, setBusy] = useState(false), [seconds, setSeconds] = useState(0), [error, setError] = useState(''), [result, setResult] = useState<VoiceAssessment | null>(null);
    useEffect(()=>{onSpeakingChange?.(recording);return()=>onSpeakingChange?.(false);},[recording,onSpeakingChange]);
    const [ready, setReady] = useState(false), [checking, setChecking] = useState(true);
    const recorder = useRef<Audio.Recording | null>(null), timer = useRef<ReturnType<typeof setInterval> | null>(null), limit = useRef<ReturnType<typeof setTimeout> | null>(null);
    const request = useRef<AbortController | null>(null), live = useRef(true), locked = useRef(false), generation = useRef(0);
    const checkService = useCallback(async () => {
        setChecking(true);
        setReady(false);
        if (!API) {
            setChecking(false);
            return;
        }
        const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 6000);
        try {
            const response = await apiFetch('/api/speech-status', { signal: controller.signal });
            const status = await response.json();
            if (live.current)
                setReady(response.ok && status.ready === true && status.assessmentType === 'pronunciation');
        }
        catch {
            if (live.current)
                setReady(false);
        }
        finally {
            clearTimeout(timeout);
            if (live.current)
                setChecking(false);
        }
    }, []);
    useEffect(() => {
        live.current = true;
        void checkService();
        const stopSessionListener=onSessionChanged(()=>{void checkService();});
        return () => {
            stopSessionListener();
            live.current = false;
            generation.current++;
            request.current?.abort();
            if (timer.current)
                clearInterval(timer.current);
            if (limit.current)
                clearTimeout(limit.current);
            const current = recorder.current;
            recorder.current = null;
            if (current)
                void current.stopAndUnloadAsync().catch(() => { }).finally(() => Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => { }));
        };
    }, [checkService]);
    const stop = async () => {
        if (locked.current || !recorder.current)
            return;
        locked.current = true;
        const current = recorder.current;
        recorder.current = null;
        if (timer.current)
            clearInterval(timer.current);
        if (limit.current)
            clearTimeout(limit.current);
        const attempt = ++generation.current;
        setRecording(false);
        setBusy(true);
        setError('');
        try {
            await current.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
            const status = await current.getStatusAsync();
            if (status.durationMillis < 700)
                throw new Error('That recording was too short. Try saying the full phrase.');
            const uri = current.getURI();
            if (!uri)
                throw new Error('No recording was captured. Please try again.');
            const form = new FormData();
            form.append('lessonId', unit.id);
            if (Platform.OS === 'web') {
                const audio = await fetch(uri).then(r => r.blob());
                if (!audio.size)
                    throw new Error('The recording was empty. Please try again.');
                form.append('audio', audio, 'practice.webm');
            }
            else
                form.append('audio', { uri, name: 'practice.m4a', type: 'audio/mp4' } as any);
            const controller = new AbortController();
            request.current = controller;
            const timeout = setTimeout(() => controller.abort(), 45000);
            let response: Response;
            try {
                response = await apiFetch('/api/speech-assessment', { method: 'POST', body: form, signal: controller.signal });
            }
            finally {
                clearTimeout(timeout);
            }
            const json = await response.json();
            if (!response.ok)
                throw new Error(json.error || 'Voice scoring is unavailable. Please try again.');
            const assessment = parseVoiceAssessment(json, unit.id, unit.phrase);
            if (live.current && attempt === generation.current) {
                setResult(assessment);
                onAssessment(assessment);
            }
        }
        catch (e) {
            if (live.current) {
                setError(e instanceof Error && e.name === 'AbortError' ? 'Voice scoring took too long. Please try again.' : e instanceof Error ? e.message : 'Could not assess this recording.');
                setResult(null);
                onAssessment(null);
            }
        }
        finally {
            locked.current = false;
            if (live.current)
                setBusy(false);
        }
    };
    const start = async () => {
        if (locked.current || recorder.current || !ready)
            return;
        locked.current = true;
        setError('');
        setResult(null);
        onAssessment(null);
        setSeconds(0);
        let current: Audio.Recording | null = null;
        try {
            if (Platform.OS === 'web' && (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia))
                throw new Error('Please open this app in Safari or Chrome with microphone support.');
            await stopEnglishAudio();
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted)
                throw new Error('Microphone access is needed for speaking practice. Enable it and try again.');
            if (!live.current)
                return;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const options = { ...Audio.RecordingOptionsPresets.HIGH_QUALITY };
            if (Platform.OS === 'web') {
                const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
                options.web = { bitsPerSecond: 128000, ...(mimeType ? { mimeType } : {}) };
            }
            current = new Audio.Recording();
            await current.prepareToRecordAsync(options);
            await current.startAsync();
            if (!live.current) {
                await current.stopAndUnloadAsync();
                await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
                return;
            }
            recorder.current = current;
            setRecording(true);
            timer.current = setInterval(() => {
                if (live.current)
                    setSeconds(v => v + 1);
            }, 1000);
            limit.current = setTimeout(() => { void stop(); }, 25000);
        }
        catch (e) {
            if (current)
                await current.stopAndUnloadAsync().catch(() => { });
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => { });
            if (live.current)
                setError(e instanceof Error ? e.message : 'Could not start recording.');
        }
        finally {
            locked.current = false;
        }
    };
    const passed = !!result && result.score >= VOICE_TARGET;
    const practiceWords = result?.words.filter(w => w.error === 'Mispronunciation' || w.error === 'Omission' || w.accuracy < VOICE_TARGET).slice(0, 5) || [];
    return <View style={s.card}><Text style={s.title}>Your turn: speak back</Text>{translated && <Text style={s.dari}>نوبت شما: با صدای خود جواب بدهید</Text>}<Text style={s.note}>Say the English phrase below. Reach at least {VOICE_TARGET}% on your voice assessment to complete this lesson.</Text>{translated && <Text style={s.dari}>جملهٔ انگلیسی پایین را بگویید. برای تکمیل درس حداقل ۹۰ فیصد در ارزیابی صدا لازم است.</Text>}<Text style={s.phrase}>{unit.phrase}</Text>{translated && <Text style={s.dari}>{unit.phraseDari}</Text>}
  {!recording && !busy && <TouchableOpacity accessibilityRole="button" style={s.listen} onPress={() => {
                setError('');
                void speakEnglish(unit.phrase,{onStart:()=>onSpeakingChange?.(true),onEnd:()=>onSpeakingChange?.(false)}).catch(error => {
                    if (live.current)
                        setError(error.message);
                });
            }}><Text style={s.listenText}>▶ Listen to the example</Text>{translated && <Text style={s.dari}>نمونه را بشنوید</Text>}</TouchableOpacity>}
  {checking ? <ActivityIndicator style={{ marginTop: 16 }}/> : !ready ? <View style={s.unavailable}><Text style={s.note}>Voice scoring is not connected yet. You can listen and practice, but the lesson cannot be marked complete until a real voice score is available.</Text>{translated && <Text style={s.dari}>ارزیابی صدا هنوز وصل نیست. شنیده و تمرین کرده می‌توانید، ولی تا نمرهٔ واقعی صدا موجود نشود درس تکمیل نمی‌شود.</Text>}{!!API && <TouchableOpacity style={s.listen} onPress={() => void checkService()}><Text style={s.listenText}>Check connection again</Text></TouchableOpacity>}</View> : <TouchableOpacity accessibilityRole="button" accessibilityLabel={recording ? 'Stop recording and score my voice' : 'Record my voice'} disabled={busy} onPress={() => void (recording ? stop() : start())} style={[s.record, recording && { backgroundColor: theme.error }, busy && { opacity: .6 }]}><Text style={s.recordText}>{busy ? 'Scoring your voice…' : recording ? `■ Stop & score · ${seconds}s` : '🎤 Record my response'}</Text>{translated && <Text style={s.recordDari}>{busy ? 'در حال ارزیابی صدا…' : recording ? 'توقف و ارزیابی' : 'جواب خود را ثبت کنید'}</Text>}</TouchableOpacity>}
  {ready && <Text style={s.note}>Up to 25 seconds. Stopping sends this recording to the connected speech service for scoring.</Text>}{ready && translated && <Text style={s.dari}>حداکثر ۲۵ ثانیه. با توقف، این صدا برای نمره‌دهی به خدمت گفتاری متصل فرستاده می‌شود.</Text>}
  {busy && <ActivityIndicator style={{ marginTop: 12 }}/>}{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  {result && <View accessibilityLiveRegion="polite" style={[s.feedback, passed && { backgroundColor: theme.olive }]}><Text style={s.score}>{result.score.toFixed(1)}% · {passed ? 'Target reached!' : 'Keep practicing'}</Text>{translated && <Text style={s.dari}>{passed ? 'به هدف رسیدید!' : 'به تمرین ادامه بدهید'}</Text>}<Text style={s.note}>Heard: “{result.transcript}”</Text><Text style={s.note}>Accuracy {result.accuracy.toFixed(0)} · Fluency {result.fluency.toFixed(0)} · Completeness {result.completeness.toFixed(0)}</Text>{practiceWords.length > 0 && <Text style={s.note}>Try these words again: {practiceWords.map(w => w.word).join(', ')}</Text>}<Text style={s.note}>{passed ? 'You can complete the lesson now.' : 'Listen once more, speak at a comfortable pace, and try again. There is no penalty for another attempt or for using Dari.'}</Text>{translated && <Text style={s.dari}>{passed ? 'اکنون درس را تکمیل کرده می‌توانید.' : 'دوباره بشنوید، با سرعت راحت بگویید و باز کوشش کنید. تکرار و استفاده از دری جریمه ندارد.'}</Text>}</View>}
  <Text style={s.small}>This is an automated phrase-reading practice score, not a certified English proficiency result.</Text>{translated && <Text style={s.dari}>این نمرهٔ خودکار تمرین خواندن جمله است، نه مدرک رسمی مهارت انگلیسی.</Text>}
 </View>;
}
const s = StyleSheet.create({
    card: { backgroundColor: theme.surface, marginTop: 16, borderWidth: 1, borderColor: theme.line, padding: 20, borderRadius: theme.radius },
    title: { color: theme.ink, fontSize: 21, lineHeight: 28, fontWeight: '800', letterSpacing: -.4 },
    note: { color: theme.muted, marginTop: 10, fontSize: 13, lineHeight: 22 },
    phrase: { fontSize: 22, lineHeight: 31, color: theme.ink, marginTop: 17, fontWeight: '700' },
    dari: {
        fontSize: 15,
        lineHeight: 25,
        textAlign: 'right',
        writingDirection: 'rtl',
        color: theme.muted,
        marginTop: 8
    },
    listen: { minHeight: 48, padding: 13, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.sage, marginTop: 14, borderRadius: theme.buttonRadius },
    listenText: {
        fontWeight: '800',
        color: theme.green
    },
    record: { justifyContent: 'center', padding: 17, alignItems: 'center', backgroundColor: theme.green, marginTop: 18, minHeight: 56, borderRadius: theme.buttonRadius },
    recordText: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 15 },
    recordDari: {
        fontSize: 14,
        color: 'white',
        marginTop: 7,
        textAlign: 'right',
        writingDirection: 'rtl'
    },
    unavailable: {
        backgroundColor: theme.peach,
        padding: 13,
        borderRadius: 14,
        marginTop: 14
    },
    error: {
        fontSize: 14,
        lineHeight: 23,
        color: theme.error,
        marginTop: 12
    },
    feedback: {
        backgroundColor: theme.peach,
        padding: 16,
        borderRadius: 16,
        marginTop: 16
    },
    score: {
        fontSize: 24,
        lineHeight: 32,
        color: theme.success,
        fontWeight: '900'
    },
    small: {
        fontSize: 11,
        lineHeight: 18,
        color: theme.muted,
        marginTop: 15
    }
});
