import {Redirect} from 'expo-router';
import PageBack from '../src/PageBack';
import { theme } from '../src/theme';
import RewardEstimate from '../src/RewardEstimate';
import { VOICE_PROGRESS_KEY, masteredJourneyIds } from '../src/voiceAssessment';
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { journeyUnits } from '../src/journeyContent';
import { familyEnglishProfile } from '../src/familyEnglish';
import { useDariPreference } from '../src/useDariPreference';
const purple = theme.green, ink = theme.ink;
const topicDari: Record<string, string> = { 'Your 4-year-old': 'طفل چهارسالهٔ شما', 'Fourth-grade school life': 'زندگی مکتب در صنف چهارم', 'Your day and your needs': 'روز و نیازهای خودتان', 'Parents and friendships': 'والدین و دوستی‌ها' };
export default function Journey() {
    const { area,view } = useLocalSearchParams<{
        area?: string;view?:string;
    }>(), router = useRouter(), insets = useSafeAreaInsets();
    const type = area === 'social' ? 'social' : 'english', social = type === 'social';
    const { translated, toggleDari } = useDariPreference();
    const [done, setDone] = useState<string[]>([]), [topic, setTopic] = useState('All lessons');
    const units = journeyUnits.filter(x => x.area === type), topics = ['All lessons', ...new Set(units.map(u => u.topic))];
    const shown = units.filter(u => topic === 'All lessons' || u.topic === topic);
    useFocusEffect(useCallback(() => {
        let live = true;
        Promise.all([AsyncStorage.getItem('mejJourneyDoneV1'), AsyncStorage.getItem(VOICE_PROGRESS_KEY)]).then(([x, v]) => {
            if (!live)
                return;
            try {
                setDone(masteredJourneyIds(journeyUnits, JSON.parse(x || '[]'), JSON.parse(v || '{}')));
            }
            catch {
                setDone([]);
            }
        });
        return () => { live = false; };
    }, []));
    if(view!=='list')return <Redirect href={social?'/conversations':'/neighborhood'}/>;
    return <View style={s.page}><ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28, paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right }]}>
  <PageBack label={social?'Conversation Adventure':'English Adventure'} onPress={()=>router.replace(social?'/conversations':'/neighborhood')}/>
  <View style={[s.hero, { backgroundColor: social ? theme.peach : theme.sage }]}><Text style={s.kicker}>{social ? 'SOCIAL CONFIDENCE' : 'EVERYDAY ENGLISH'}</Text><Text style={s.title}>{social ? 'Make room for connection' : 'English for your real life'}</Text>{translated && <Text style={s.dari}>{social ? 'برای ارتباط و دوستی وقت بسازید' : 'انگلیسی برای زندگی واقعی شما'}</Text>}<Text style={s.subtitle}>{social ? 'Practice meeting parents, making friends, and setting comfortable boundaries.' : 'Practical conversations for school, family life, and your own needs and interests.'}</Text>{translated && <Text style={s.dari}>{social ? 'با والدین آشنا شوید، دوست پیدا کنید و حدود مناسب خود را بیان کنید.' : 'گفت‌وگوهای عملی برای مکتب، خانواده و نیازها و علاقه‌های خودتان.'}</Text>}<View style={s.pill}><Ionicons name="star" size={16} color={theme.green}/><Text style={s.pillText}>{units.filter(x => done.includes(x.id)).length} / {units.length} lessons completed</Text></View></View>
  <View style={s.familyCard}><Text style={s.familyTitle}>Built around your day</Text><Text style={s.subtitle}>A {familyEnglishProfile.youngerAge}-year-old • A {familyEnglishProfile.olderAge}-year-old in fourth grade • Time for you, too</Text>{translated && <Text style={s.dari}>طفل چهارساله • طفل نه‌ساله در صنف چهارم • برای خودتان هم وقت</Text>}<Text style={s.hint}>Preschool lessons are enquiries and examples—you do not need to be enrolled. Example names can be replaced with your own.</Text>{translated && <Text style={s.dari}>درس‌های پیش‌مکتب پرسش و نمونه‌اند؛ شامل بودن لازم نیست. نام‌های نمونه را با نام خودتان بدل کرده می‌توانید.</Text>}</View>
  <TouchableOpacity accessibilityRole="button" style={s.translate} onPress={toggleDari}><Ionicons name="language-outline" size={22} color={purple}/><Text style={s.translateText}>{translated ? 'Hide Afghan Dari' : 'Translate to Afghan Dari'}</Text></TouchableOpacity>
  <RewardEstimate area={type}/><Text style={s.heading}>Choose a situation</Text>{translated && <Text style={s.dari}>یک وضعیت را انتخاب کنید</Text>}<Text style={s.hint}>Read the situation → choose a reply → listen → practice aloud.</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{topics.map(t => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: topic === t }} key={t} onPress={() => setTopic(t)} style={[s.chip, topic === t && s.chipSelected]}><Text style={[s.chipText, topic === t && { color: 'white' }]}>{t}</Text>{translated && topicDari[t] && <Text style={[s.chipDari, topic === t && { color: 'white' }]}>{topicDari[t]}</Text>}</TouchableOpacity>)}</ScrollView>
  {shown.map((unit, i) => <TouchableOpacity accessibilityRole="button" key={unit.id} onPress={() => router.push({ pathname: '/journey-lesson', params: { id: unit.id } })} activeOpacity={.84} style={s.unit}><View style={[s.emoji, { backgroundColor: i % 2 ? theme.peach : theme.sage }]}><Text style={{ fontSize: 27 }}>{unit.emoji}</Text></View><View style={{ flex: 1 }}><Text style={s.topic}>{unit.topic}</Text><Text style={s.unitTitle}>{unit.title}</Text>{translated && <Text style={s.dari}>{unit.dariTitle}</Text>}<Text style={s.meta}>{done.includes(unit.id) ? '✓ Completed · Practice again' : 'Listen, respond, and speak'}</Text><Text style={s.meta}>$2 reward + $3 for 90% or higher, once per lesson</Text></View><Ionicons name={done.includes(unit.id) ? 'checkmark-circle' : 'chevron-forward'} size={24} color={done.includes(unit.id) ? theme.success : purple}/></TouchableOpacity>)}
 </ScrollView></View>;
}
const s = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: theme.paper
    },
    content: { width: '100%', alignSelf: 'center', maxWidth: theme.width },
    back: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        minHeight: 48,
        marginBottom: 12
    },
    backText: { color: ink, fontWeight: '800', fontSize: 13 },
    hero: { marginBottom: 16, borderRadius: theme.radius, padding: 24 },
    kicker: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.3,
        color: theme.green
    },
    title: { color: ink, marginTop: 12, fontSize: 31, lineHeight: 37, fontWeight: '800', letterSpacing: -1 },
    subtitle: { marginTop: 8, fontSize: 14, lineHeight: 23, color: theme.muted },
    pill: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: theme.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 18
    },
    pillText: {
        fontSize: 12,
        fontWeight: '800',
        color: ink,
        flexShrink: 1
    },
    familyCard: { backgroundColor: theme.olive, borderRadius: theme.radius, padding: 20 },
    familyTitle: {
        fontSize: 17,
        fontWeight: '900',
        color: ink
    },
    heading: { color: ink, marginTop: 20, fontSize: 23, lineHeight: 30, fontWeight: '800', letterSpacing: -.6 },
    hint: {
        fontSize: 12,
        color: theme.muted,
        marginTop: 9,
        marginBottom: 8,
        lineHeight: 19
    },
    unit: { backgroundColor: theme.surface, marginBottom: 11, borderWidth: 1, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 18, borderRadius: theme.radius },
    emoji: {
        width: 48,
        height: 55,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topic: {
        fontSize: 11,
        color: purple,
        fontWeight: '800'
    },
    unitTitle: { color: ink, marginTop: 5, fontSize: 17, lineHeight: 24, fontWeight: '800' },
    meta: {
        fontSize: 12,
        color: theme.muted,
        marginTop: 6
    },
    dari: {
        fontSize: 14,
        lineHeight: 24,
        color: theme.muted,
        textAlign: 'right',
        writingDirection: 'rtl',
        marginTop: 7
    },
    translate: {
        minHeight: 48,
        backgroundColor: theme.sage,
        borderRadius: 15,
        marginTop: 15,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    translateText: {
        color: purple,
        fontWeight: '800',
        fontSize: 13
    },
    filters: {
        gap: 8,
        paddingVertical: 13
    },
    chip: {
        minHeight: 48,
        justifyContent: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.line
    },
    chipSelected: {
        backgroundColor: purple,
        borderColor: purple
    },
    chipText: {
        fontSize: 12,
        fontWeight: '800',
        color: ink
    },
    chipDari: {
        fontSize: 12,
        textAlign: 'right',
        writingDirection: 'rtl',
        marginTop: 5,
        color: theme.muted
    }
});
