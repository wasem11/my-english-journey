import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PageBack from '../src/PageBack';
import { theme } from '../src/theme';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dmvQuestionBank, dmvTopics, DMVQuestion } from '../src/dmvQuestionBank';
import { dmvDari } from '../src/dmvDari';
import { useDariPreference } from '../src/useDariPreference';
const VIOLET = theme.green, INK = theme.ink, MUTED = theme.muted;
type Answer = {
    id: string;
    chosen: number;
    correct: boolean;
};
type ExamMode = 'exam' | 'practice' | 'mistakes';
type ExamQuestion = {
    item: DMVQuestion;
    choices: {
        label: string;
        original: number;
    }[];
};
const shuffle = <T,>(a: T[]): T[] => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
};
const makeExam = (pool: DMVQuestion[], count: number, recent: string[]): ExamQuestion[] => {
    const fresh = shuffle(pool.filter(q => !recent.includes(q.id)));
    const fallback = shuffle(pool.filter(q => recent.includes(q.id)));
    return [...fresh, ...fallback].slice(0, count).map(item => ({ item, choices: shuffle(item.options.map((label, original) => ({ label, original }))) }));
};
export default function DMVExam() {
    const router = useRouter();
    const insets=useSafeAreaInsets();
    const { translated, toggleDari } = useDariPreference();
    const bi = (en: string, dari: string) => <><Text style={s.description}>{en}</Text>{translated && <Text style={s.dari}>{dari}</Text>}</>;
    const [mode, setMode] = useState<ExamMode | null>(null);
    const [topic, setTopic] = useState('All topics');
    const [exam, setExam] = useState<ExamQuestion[]>([]);
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [wrong, setWrong] = useState<string[]>([]);
    const [records, setRecords] = useState<{
        date: string;
        score: number;
        total: number;
        mode: string;
    }[]>([]);
    const [review, setReview] = useState(false);
    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const [a, b, c] = await Promise.all(['mej_dmv_recent_v1', 'mej_dmv_wrong_v1', 'mej_dmv_results_v1'].map(k => AsyncStorage.getItem(k)));
                setHistory(JSON.parse(a || '[]'));
                setWrong(JSON.parse(b || '[]'));
                setRecords(JSON.parse(c || '[]'));
            }
            catch { }
        })();
    }, []));
    const pool = useMemo(() => dmvQuestionBank.filter(q => topic === 'All topics' || q.topic === topic), [topic]);
    const begin = (m: ExamMode) => {
        const eligible = m === 'mistakes' ? dmvQuestionBank.filter(q => wrong.includes(q.id)) : pool;
        if (!eligible.length)
            return;
        const count = m === 'exam' ? Math.min(36, eligible.length) : m === 'practice' ? Math.min(15, eligible.length) : Math.min(20, eligible.length);
        const generated = makeExam(eligible, count, history.slice(-Math.min(35, Math.floor(dmvQuestionBank.length / 2))));
        setExam(generated);
        setIndex(0);
        setAnswers([]);
        setReview(false);
        setMode(m);
    };
    const current = exam[index];
    const chosen = answers[index];
    const finished = !!mode && answers.length === exam.length && exam.length > 0;
    const score = answers.filter(a => a.correct).length;
    const finish = async (nextAnswers: Answer[]) => {
        const nextHistory = [...history, ...exam.map(x => x.item.id)].slice(-100);
        setHistory(nextHistory);
        const missed = exam.filter((_, i) => !nextAnswers[i].correct).map(x => x.item.id);
        const cleared = new Set(exam.filter((_, i) => nextAnswers[i].correct).map(x => x.item.id));
        const nextWrong = Array.from(new Set([...wrong.filter(id => !cleared.has(id)), ...missed]));
        setWrong(nextWrong);
        const nextRecords = [{ date: new Date().toISOString(), score: nextAnswers.filter(a => a.correct).length, total: exam.length, mode: mode || 'practice' }, ...records].slice(0, 30);
        setRecords(nextRecords);
        await Promise.all([AsyncStorage.setItem('mej_dmv_recent_v1', JSON.stringify(nextHistory)), AsyncStorage.setItem('mej_dmv_wrong_v1', JSON.stringify(nextWrong)), AsyncStorage.setItem('mej_dmv_results_v1', JSON.stringify(nextRecords))]);
    };
    const select = (original: number) => {
        if (!current || chosen)
            return;
        const a = { id: current.item.id, chosen: original, correct: original === current.item.answer };
        const next = [...answers, a];
        setAnswers(next);
        if (next.length === exam.length)
            void finish(next);
    };
    const reset = () => { setMode(null); setReview(false); setIndex(0); setExam([]); setAnswers([]); };
    const card = (children: React.ReactNode) => <View style={s.card}>{children}</View>;
    return <ScrollView style={s.page} contentContainerStyle={[s.content,{paddingTop:insets.top+20,paddingBottom:insets.bottom+30,paddingLeft:20+insets.left,paddingRight:20+insets.right}]}>
  <PageBack label={mode?'Exam menu':'Driving Adventure'} onPress={()=>mode?reset():router.replace('/dmv-adventure')}/>
  <Text style={s.kicker}>CALIFORNIA • CLASS C</Text><Text style={s.title}>Permit Test Simulator 🚘</Text>
  <TouchableOpacity accessibilityRole="button" style={s.translate} onPress={toggleDari}><Text style={s.translateText}>{translated ? "Hide Afghan Dari · دری را پنهان کنید" : "🌐 Translate everything to Afghan Dari · ترجمه به دری"}</Text></TouchableOpacity>
  {!mode ? <>
   <Text style={s.description}>New question order and shuffled answers on every attempt. Your incorrect answers become a personal review deck.</Text>
   {card(<><Text style={s.big}>{dmvQuestionBank.length}</Text><Text style={s.description}>original handbook-based practice questions in {dmvTopics.length} topic groups</Text><Text style={s.note}>This bank is a growing study resource, not a complete reproduction of the official handbook or actual DMV test.</Text></>)}
   <Text style={s.heading}>Choose a topic</Text>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>{['All topics', ...dmvTopics].map(t => <TouchableOpacity key={t} onPress={() => setTopic(t)} style={[s.chip, topic === t && s.active]}><Text style={[s.chipText, topic === t && s.activeText]}>{t}</Text></TouchableOpacity>)}</ScrollView>
   {card(<><Text style={s.heading}>Full mock exam</Text><Text style={s.description}>36 questions • 30 correct to reach the 83.3% practice target • English first, optional Afghan Dari • results at the end</Text><TouchableOpacity style={s.button} onPress={() => { setTopic('All topics'); const generated = makeExam(dmvQuestionBank, 36, history.slice(-35)); setExam(generated); setIndex(0); setAnswers([]); setReview(false); setMode('exam'); }}><Text style={s.buttonText}>Start 36-question exam →</Text></TouchableOpacity></>)}
   {card(<><Text style={s.heading}>Quick practice</Text><Text style={s.description}>15 questions from your chosen topic, with immediate feedback and explanations.</Text><TouchableOpacity style={s.button} onPress={() => begin('practice')}><Text style={s.buttonText}>Practice this topic →</Text></TouchableOpacity></>)}
   {card(<><Text style={s.heading}>Review mistakes ({wrong.length})</Text><Text style={s.description}>Retry questions missed in previous sessions. Correct answers remove them from your review list.</Text><TouchableOpacity style={[s.button, !wrong.length && { opacity: .4 }]} disabled={!wrong.length} onPress={() => begin('mistakes')}><Text style={s.buttonText}>Practice missed questions →</Text></TouchableOpacity></>)}
   {records.length > 0 && <><Text style={s.heading}>Recent results</Text>{records.slice(0, 5).map((r, i) => <Text key={i} style={s.record}>{r.mode === 'exam' ? 'Mock exam' : 'Practice'} · {r.score}/{r.total} · {new Date(r.date).toLocaleDateString()}</Text>)}</>}
   <TouchableOpacity onPress={() => Linking.openURL('https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/')}><Text style={s.link}>Read the official California Driver's Handbook ↗</Text></TouchableOpacity>
   <TouchableOpacity onPress={() => Linking.openURL('https://www.dmv.ca.gov/portal/driver-education-and-safety/educational-materials/sample-driver-license-dl-knowledge-tests/')}><Text style={s.link}>Official DMV sample knowledge tests ↗</Text></TouchableOpacity>
  </> : finished && (!review) ? <>
   {card(<><Text style={s.big}>{score} / {exam.length}</Text><Text style={s.heading}>{score >= Math.ceil(exam.length * 5 / 6) ? 'Practice target reached! 🎉' : 'Keep practicing — you can improve! 💪'}</Text><Text style={s.description}>{Math.round(score / exam.length * 100)}% correct • {exam.length - score} missed</Text><Text style={s.note}>Practice score only; this is not a DMV-issued result or guarantee of passing.</Text></>)}
   <TouchableOpacity style={s.button} onPress={() => { setReview(true); setIndex(0); }}><Text style={s.buttonText}>Review every answer →</Text></TouchableOpacity>
   <TouchableOpacity style={s.secondary} onPress={() => { const m = mode; reset(); setTimeout(() => { }, 0); }}><Text style={s.secondaryText}>Return to exam menu</Text></TouchableOpacity>
  </> : <>
   <Text style={s.description}>{review ? 'Answer review' : mode === 'exam' ? 'Mock exam — no feedback until you finish' : 'Practice — feedback after each answer'}</Text>
   <View style={s.row}><Text style={s.counter}>Question {index + 1} of {exam.length}</Text><Text style={s.counter}>{Math.round((index + 1) / exam.length * 100)}%</Text></View>
   <View style={s.track}><View style={[s.fill, { width: `${(index + 1) / exam.length * 100}%` }]}/></View>
   {current && card(<><Text style={s.kicker}>{current.item.topic.toUpperCase()}</Text><Text style={s.question}>{current.item.question}</Text>{translated && <Text style={s.dari}>{dmvDari[current.item.id]?.question}</Text>}
    {current.choices.map((option, i) => {
                    const reveal = review || (mode !== 'exam' && !!chosen);
                    const isCorrect = option.original === current.item.answer;
                    const picked = (review ? answers[index] : chosen)?.chosen === option.original;
                    return <TouchableOpacity key={i} disabled={review || !!chosen} onPress={() => select(option.original)} style={[s.option, reveal && isCorrect && s.correct, reveal && picked && !isCorrect && s.incorrect, !reveal && picked && s.picked]}><Text style={s.optionText}>{String.fromCharCode(65 + i)}. {option.label}</Text>{translated && <Text style={s.dari}>{dmvDari[current.item.id]?.options[option.original]}</Text>}</TouchableOpacity>;
                })}
    {(review || (mode !== 'exam' && !!chosen)) && <View style={s.feedback}><Text style={s.feedbackTitle}>{(review ? answers[index] : chosen)?.correct ? '✓ Correct' : 'Review this answer'}</Text><Text style={s.description}>{current.item.explanation}</Text>{translated && <Text style={s.dari}>{dmvDari[current.item.id]?.explanation}</Text>}</View>}
   </>)}
   {(review || !!chosen) && <TouchableOpacity style={s.button} onPress={() => {
                    if (index < exam.length - 1)
                        setIndex(index + 1);
                    else if (review) {
                        setReview(false);
                    }
                }}><Text style={s.buttonText}>{index === exam.length - 1 ? 'See results' : 'Next question →'}</Text></TouchableOpacity>}
   {mode === 'exam' && !chosen && <Text style={s.note}>Answer all 36 questions to see your score. Answers are not revealed during the mock exam.</Text>}
  </>}
  {translated && <Text style={s.dari}>ترجمهٔ دری برای کمک به یادگیری است. متن انگلیسی نیز نمایش داده می‌شود و استفاده از ترجمه نمرهٔ شما را کم نمی‌کند.</Text>}
  <Text style={s.footer}>Independent educational practice content. Not affiliated with or endorsed by the California DMV. Refer to the current official handbook for authoritative rules. Afghan Dari translations are independent study aids and have not been officially reviewed by the DMV.</Text>
 </ScrollView>;
}
const s = StyleSheet.create({
    dari: {
        color: theme.muted,
        textAlign: "right",
        writingDirection: "rtl",
        fontSize: 16,
        lineHeight: 27,
        marginTop: 8,
        marginBottom: 7
    },
    translate: { padding: 15, backgroundColor: theme.sage, borderRadius: 14, marginVertical: 14, alignItems: "center", minHeight: 48, justifyContent: 'center' },
    translateText: {
        color: theme.green,
        fontWeight: "800",
        fontSize: 14
    },
    page: {
        flex: 1,
        backgroundColor: theme.paper
    },
    content: { padding: 20, paddingTop: 50, paddingBottom: 80, width: '100%', maxWidth: theme.width, alignSelf: 'center' },
    back: { minHeight: 48, justifyContent: 'center', marginBottom: 16 },
    backText: { color: VIOLET, fontWeight: '800', fontSize: 13 },
    kicker: {
        fontSize: 11,
        color: VIOLET,
        fontWeight: '900',
        letterSpacing: 1.2
    },
    title: { color: INK, marginTop: 7, marginBottom: 12, fontSize: 31, lineHeight: 38, fontWeight: '800', letterSpacing: -1 },
    description: {
        fontSize: 14,
        color: MUTED,
        lineHeight: 22,
        marginTop: 7
    },
    card: { backgroundColor: theme.surface, padding: 20, marginTop: 16, borderColor: theme.line, borderWidth: 1, borderRadius: theme.radius },
    big: {
        fontSize: 42,
        fontWeight: '900',
        color: VIOLET
    },
    heading: {
        fontSize: 18,
        fontWeight: '900',
        color: INK,
        marginTop: 15
    },
    note: {
        fontSize: 12,
        color: MUTED,
        lineHeight: 19,
        marginTop: 12
    },
    chip: { padding: 11, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, minHeight: 48, justifyContent: 'center', borderRadius: theme.buttonRadius },
    active: {
        backgroundColor: VIOLET
    },
    chipText: {
        color: INK,
        fontSize: 12,
        fontWeight: '800'
    },
    activeText: {
        color: 'white'
    },
    button: { backgroundColor: VIOLET, padding: 17, marginTop: 16, alignItems: 'center', minHeight: 54, borderRadius: theme.buttonRadius },
    buttonText: { color: 'white', fontSize: 15, fontWeight: '800' },
    secondary: { backgroundColor: theme.sage, padding: 17, marginTop: 12, alignItems: 'center', minHeight: 52, borderRadius: theme.buttonRadius },
    secondaryText: {
        color: VIOLET,
        fontWeight: '900'
    },
    record: {
        backgroundColor: theme.surface,
        padding: 13,
        marginTop: 7,
        borderRadius: 12,
        color: INK
    },
    link: {
        color: VIOLET,
        fontWeight: '800',
        marginTop: 20
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    counter: {
        color: INK,
        fontWeight: '800'
    },
    track: { backgroundColor: theme.line, borderRadius: 8, marginTop: 10, overflow: 'hidden', height: 6 },
    fill: {
        height: '100%',
        backgroundColor: theme.success
    },
    question: { fontSize: 23, lineHeight: 31, color: INK, marginVertical: 18, fontWeight: '800', letterSpacing: -.4 },
    option: { padding: 17, borderColor: theme.line, borderWidth: 1, marginBottom: 11, minHeight: 58, borderRadius: 16 },
    optionText: {
        fontSize: 15,
        fontWeight: '700',
        color: INK,
        lineHeight: 22
    },
    correct: {
        backgroundColor: theme.olive,
        borderColor: theme.success
    },
    incorrect: {
        backgroundColor: theme.errorBg,
        borderColor: theme.error
    },
    picked: {
        backgroundColor: theme.sage,
        borderColor: VIOLET
    },
    feedback: {
        padding: 14,
        borderRadius: 14,
        backgroundColor: theme.sage,
        marginTop: 10
    },
    feedbackTitle: {
        fontWeight: '900',
        color: INK
    },
    footer: {
        fontSize: 11,
        color: MUTED,
        lineHeight: 18,
        marginTop: 28
    }
});
