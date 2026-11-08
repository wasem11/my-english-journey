import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PageBack from '../src/PageBack';
import { theme } from '../src/theme';
import RewardEstimate from '../src/RewardEstimate';
import { VOICE_PROGRESS_KEY, masteredJourneyIds } from '../src/voiceAssessment';
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { journeyUnits } from '../src/journeyContent';
import { adventureLevels, sanitizeCompleted } from '../src/dmvAdventure';
const P = theme.green, G = theme.green, INK = theme.ink;
export default function Progress() {
    const router = useRouter();
    const insets=useSafeAreaInsets();
    const [journey, setJourney] = useState<string[]>([]);
    const [dmv, setDmv] = useState<string[]>([]);
    const [xp, setXp] = useState(0);
    const [activity, setActivity] = useState<Record<string, number>>({});
    useFocusEffect(useCallback(() => {
        let mounted = true;
        Promise.all([AsyncStorage.getItem('mejJourneyDoneV1'), AsyncStorage.getItem('dmvAdventureCompletedV1'), AsyncStorage.getItem('dmvAdventureXPV1'), AsyncStorage.getItem('mejActivityDaysV1'), AsyncStorage.getItem(VOICE_PROGRESS_KEY)]).then(([a, b, c, d, v]) => {
            if (!mounted)
                return;
            try {
                setJourney(masteredJourneyIds(journeyUnits, JSON.parse(a || '[]'), JSON.parse(v || '{}')));
                setDmv(sanitizeCompleted(JSON.parse(b || '[]')));
                setXp(Number(c) || 0);
                setActivity(JSON.parse(d || '{}'));
            }
            catch { }
        });
        return () => { mounted = false; };
    }, []));
    const english = journeyUnits.filter(x => x.area === 'english');
    const social = journeyUnits.filter(x => x.area === 'social');
    const e = english.filter(x => journey.includes(x.id)).length;
    const socialDone = social.filter(x => journey.includes(x.id)).length;
    const total = journey.length + dmv.length;
    const date = new Date();
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(date); d.setDate(d.getDate() - (6 - i)); return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] }; });
    const stat = (title: string, done: number, max: number, color: string, go: () => void) => <TouchableOpacity onPress={go} style={s.card}><View style={s.cardTop}><Text style={s.cardTitle}>{title}</Text><Text style={[s.count, { color }]}>{done}/{max}</Text></View><View style={s.track}><View style={[s.fill, { width: `${max ? Math.min(100, done / max * 100) : 0}%`, backgroundColor: color }]}/></View><Text style={s.detail}>{Math.round(max ? done / max * 100 : 0)}% completed  ·  Tap to continue</Text></TouchableOpacity>;
    return <ScrollView style={s.root} contentContainerStyle={[s.content,{paddingTop:insets.top+20,paddingBottom:insets.bottom+30,paddingLeft:20+insets.left,paddingRight:20+insets.right}]}><PageBack onPress={()=>router.replace('/')}/><View style={s.hero}><Text style={s.eyebrow}>MY ENGLISH JOURNEY</Text><Text style={s.title}>Your progress</Text><Text style={s.subtitle}>Every lesson counts. Keep building confidence, one day at a time.</Text><View style={s.bigRow}><View><Text style={s.big}>{total}</Text><Text style={s.bigLabel}>Learning missions</Text></View><View><Text style={s.big}>{xp}</Text><Text style={s.bigLabel}>Driving XP</Text></View></View></View>
 <RewardEstimate /><Text style={s.heading}>Your academies</Text>{stat('📚 English Academy', e, english.length, theme.success, () => router.push({ pathname: '/journey', params: { area: 'english' } }))}{stat('💬 Social Confidence', socialDone, social.length, theme.success, () => router.push({ pathname: '/journey', params: { area: 'social' } }))}{stat('🚗 Driving Adventure', dmv.length, adventureLevels.length, G, () => router.push('/dmv-adventure'))}
 <Text style={s.heading}>Last 7 days</Text><View style={s.week}>{days.map(d => <View key={d.key} style={s.day}><Text style={s.dayLabel}>{d.label}</Text><View style={[s.dayDot, { backgroundColor: activity[d.key] ? theme.success : theme.soft }]}><Text style={{ color: activity[d.key] ? 'white' : theme.disabled, fontWeight: '900' }}>{activity[d.key] ? '✓' : '·'}</Text></View></View>)}</View><Text style={s.note}>A green day means you completed an English or social lesson in this version of the app. Earlier activity may not appear here.</Text>
 <View style={s.notice}><Ionicons name="shield-checkmark-outline" size={23} color={G}/><Text style={s.noticeText}>Progress is saved on this device. This screen does not measure English proficiency or verify pronunciation. Driving XP is tracked separately from language lessons.</Text></View>
 </ScrollView>;
}
const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: theme.paper
    },
    content: { width: '100%', alignSelf: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 25 : 60, paddingBottom: 70, maxWidth: theme.width },
    back: { flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 17, minHeight: 48 },
    hero: { padding: 24, backgroundColor: theme.sage, borderRadius: theme.radius },
    eyebrow: {
        fontSize: 10,
        color: P,
        fontWeight: '900',
        letterSpacing: 1.4
    },
    title: { color: INK, marginTop: 10, fontSize: 31, lineHeight: 38, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: theme.muted, marginTop: 8, fontSize: 14, lineHeight: 23 },
    bigRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 23,
        backgroundColor: theme.surface,
        padding: 18,
        borderRadius: 19
    },
    big: {
        fontSize: 31,
        fontWeight: '900',
        color: P,
        textAlign: 'center'
    },
    bigLabel: {
        fontSize: 11,
        color: theme.muted,
        fontWeight: '800',
        marginTop: 5
    },
    heading: { color: INK, marginTop: 26, marginBottom: 12, fontSize: 23, lineHeight: 30, fontWeight: '800', letterSpacing: -.6 },
    card: { backgroundColor: theme.surface, marginBottom: 11, borderWidth: 1, borderColor: theme.line, borderRadius: theme.radius, padding: 20 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    cardTitle: { color: INK, fontWeight: '800', fontSize: 16 },
    count: {
        fontSize: 15,
        fontWeight: '900'
    },
    track: { borderRadius: 10, backgroundColor: theme.soft, overflow: 'hidden', marginTop: 14, height: 6 },
    fill: {
        height: '100%',
        borderRadius: 10
    },
    detail: {
        fontSize: 11,
        color: theme.muted,
        marginTop: 8
    },
    week: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: 15
    },
    day: {
        alignItems: 'center',
        gap: 9
    },
    dayLabel: {
        color: theme.muted,
        fontWeight: '800',
        fontSize: 11
    },
    dayDot: {
        height: 32,
        width: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    note: {
        fontSize: 11,
        color: theme.muted,
        lineHeight: 18,
        marginTop: 10
    },
    notice: {
        backgroundColor: theme.sage,
        borderRadius: 17,
        padding: 16,
        flexDirection: 'row',
        gap: 10,
        marginTop: 24
    },
    noticeText: {
        flex: 1,
        color: theme.muted,
        fontSize: 12,
        lineHeight: 19
    }
});
