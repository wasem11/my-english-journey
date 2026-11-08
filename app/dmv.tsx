import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dmvCards, categories } from '../src/dmvCards';
const PURPLE = theme.green, INK = theme.ink, MUTED = theme.muted, BG = theme.paper;
const HANDBOOK = 'https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/';
const SIGNS = 'https://dot.ca.gov/programs/safety-programs/sign-charts';
const QUIZZES = 'https://www.dmv.ca.gov/portal/driver-education-and-safety/educational-materials/sample-driver-license-dl-knowledge-tests/';
type Question = {
    id: string;
    category: string;
    en: string;
    dari: string;
    choices: {
        en: string;
        dari: string;
    }[];
    correct: number;
    why: string;
    whyDari: string;
};
// Original educational practice questions, NOT published California DMV test questions.
const questions: Question[] = [
    { id: 'q-stop', category: 'Road signs', en: 'What must you do at a STOP sign?', dari: 'در مقابل علامت ایست چه باید کنید؟', choices: [{ en: 'Slow down and keep going', dari: 'سرعت را کم کنید و به راه ادامه بدهید' }, { en: 'Come to a complete stop', dari: 'موتر را کاملاً توقف بدهید' }, { en: 'Stop only if another car is coming', dari: 'تنها وقتی توقف کنید که موتر دیگر می‌آید' }], correct: 1, why: 'Come to a complete stop at the appropriate stopping point. Proceed only when it is safe.', whyDari: 'در محل مناسب موتر را کاملاً توقف بدهید. تنها وقتی راه مصون باشد حرکت کنید.' },
    { id: 'q-yield', category: 'Road signs', en: 'What does a YIELD sign tell you?', dari: 'علامت حق تقدم چه معنی دارد؟', choices: [{ en: 'You always have the right-of-way', dari: 'همیشه شما حق تقدم دارید' }, { en: 'Speed up to join traffic', dari: 'برای داخل شدن به ترافیک سرعت را زیاد کنید' }, { en: 'Slow down and give the right-of-way when needed', dari: 'سرعت را کم کنید و در صورت ضرورت حق تقدم بدهید' }], correct: 2, why: 'Yield to traffic or pedestrians with the right-of-way; stop if necessary.', whyDari: 'به موترها و عابران پیاده که حق تقدم دارند راه بدهید؛ اگر ضرورت باشد توقف کنید.' },
    { id: 'q-red', category: 'Traffic lights', en: 'What does a steady red traffic light mean?', dari: 'چراغ سرخ ثابت ترافیکی چه معنی دارد؟', choices: [{ en: 'Stop at the proper stopping point', dari: 'در محل مناسب توقف کنید' }, { en: 'Drive through if you are in a hurry', dari: 'اگر عجله دارید عبور کنید' }, { en: 'Only slow down', dari: 'فقط سرعت را کم کنید' }], correct: 0, why: 'A steady red light means stop. Certain turns may be allowed after stopping when legal and safe.', whyDari: 'چراغ سرخ ثابت به معنی توقف است. بعضی پیچیدن‌ها پس از توقف، در صورت قانونی و مصون بودن، اجازه دارند.' },
    { id: 'q-yellow', category: 'Traffic lights', en: 'What should you do when a traffic light turns yellow?', dari: 'وقتی چراغ ترافیکی زرد می‌شود چه باید کنید؟', choices: [{ en: 'Accelerate to beat the red light', dari: 'برای عبور پیش از سرخ شدن سرعت را زیاد کنید' }, { en: 'Stop if you can do so safely', dari: 'اگر می‌توانید به شکل مصون توقف کنید' }, { en: 'Always reverse', dari: 'همیشه عقب بروید' }], correct: 1, why: 'Yellow warns the signal is changing to red. Stop if you can do so safely.', whyDari: 'چراغ زرد هشدار می‌دهد که چراغ سرخ می‌شود. اگر توقف مصون ممکن باشد، توقف کنید.' },
    { id: 'q-green', category: 'Traffic lights', en: 'Can you enter an intersection on green without checking?', dari: 'آیا با چراغ سبز بدون بررسی می‌توانید داخل چهارراه شوید؟', choices: [{ en: 'Yes, green always guarantees a clear path', dari: 'بلی، سبز همیشه به معنی راه باز است' }, { en: 'Only if you honk', dari: 'تنها اگر هارن بزنید' }, { en: 'No, check and yield when required', dari: 'نخیر، بررسی کنید و در صورت ضرورت حق تقدم بدهید' }], correct: 2, why: 'Even on green, yield to pedestrians and vehicles already in the intersection.', whyDari: 'حتی با چراغ سبز، به عابران پیاده و موترهای داخل چهارراه حق تقدم بدهید.' },
    { id: 'q-walk', category: 'Safe driving', en: 'What should you do when a pedestrian is crossing?', dari: 'وقتی عابر پیاده از سرک عبور می‌کند چه باید کنید؟', choices: [{ en: 'Yield as required and allow safe crossing', dari: 'حق تقدم بدهید و اجازه دهید به مصونیت عبور کند' }, { en: 'Speed up to pass first', dari: 'سرعت را زیاد کنید تا اول عبور کنید' }, { en: 'Honk and continue', dari: 'هارن بزنید و ادامه بدهید' }], correct: 0, why: 'Drivers must yield to pedestrians as required by California law.', whyDari: 'رانندگان باید مطابق قانون کالیفرنیا به عابران پیاده حق تقدم بدهند.' },
    { id: 'q-school', category: 'Safe driving', en: 'What is important when driving near a school?', dari: 'هنگام رانندگی نزدیک مکتب چه چیز مهم است؟', choices: [{ en: 'Ignore posted speed signs', dari: 'علامت‌های حد سرعت را نادیده بگیرید' }, { en: 'Follow posted limits and watch for children', dari: 'حد سرعت را رعایت کنید و متوجه اطفال باشید' }, { en: 'Use your phone to check the route', dari: 'برای بررسی مسیر از تیلفون استفاده کنید' }], correct: 1, why: 'Pay special attention to children and applicable speed restrictions near schools.', whyDari: 'نزدیک مکتب به اطفال و محدودیت‌های سرعت توجه ویژه داشته باشید.' },
    { id: 'q-speed', category: 'Safe driving', en: 'Should you always drive at the posted maximum speed?', dari: 'آیا همیشه باید با بیشترین سرعت نوشته‌شده رانندگی کنید؟', choices: [{ en: 'Yes, even in heavy rain', dari: 'بلی، حتی هنگام باران شدید' }, { en: 'Yes, even in fog', dari: 'بلی، حتی هنگام مه' }, { en: 'No, slow down when conditions require it', dari: 'نخیر، اگر وضعیت ایجاب کند سرعت را کم کنید' }], correct: 2, why: 'Adjust your speed for weather, visibility, traffic, and road conditions.', whyDari: 'سرعت را مطابق هوا، دید، ترافیک و وضعیت سرک تنظیم کنید.' },
    { id: 'q-belt', category: 'Safe driving', en: 'When should you wear a seat belt?', dari: 'چه وقت باید کمربند ایمنی ببندید؟', choices: [{ en: 'Every time you ride in a vehicle', dari: 'هر بار که در موتر می‌نشینید' }, { en: 'Only on highways', dari: 'فقط در شاهراه‌ها' }, { en: 'Only on long trips', dari: 'فقط در سفرهای طولانی' }], correct: 0, why: 'Seat belts reduce injury risk. Follow California seat belt and child restraint requirements.', whyDari: 'کمربند ایمنی خطر آسیب را کم می‌کند. مقررات کمربند و چوکی مصونیت اطفال را رعایت کنید.' },
    { id: 'q-blind', category: 'Safe driving', en: 'What should you check before changing lanes?', dari: 'پیش از تغییر لین چه چیز را باید بررسی کنید؟', choices: [{ en: 'Only your speedometer', dari: 'فقط سرعت‌سنج' }, { en: 'Mirrors and blind spots', dari: 'آیینه‌ها و نقطه‌های کور' }, { en: 'Only the rear window', dari: 'فقط کلکین عقب' }], correct: 1, why: 'Use your mirrors, signal, and check blind spots before moving into another lane.', whyDari: 'از آیینه‌ها استفاده کنید، اشاره بدهید و پیش از تغییر لین نقطه‌های کور را بررسی کنید.' },
];
export default function DmvGuide() {
    const router = useRouter();
    const insets=useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const [mode, setMode] = useState<'home' | 'learn' | 'quiz'>('home');
    const [category, setCategory] = useState('All');
    const [index, setIndex] = useState(0);
    const [translated, setTranslated] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [known, setKnown] = useState<string[]>([]);
    const [xp, setXp] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answered, setAnswered] = useState<string[]>([]);
    const [correctIds, setCorrectIds] = useState<string[]>([]);
    const [assisted, setAssisted] = useState(false);
    useFocusEffect(useCallback(() => {
        Promise.all([AsyncStorage.getItem('dmvKnownCards'), AsyncStorage.getItem('dmvXP'), AsyncStorage.getItem('dmvAnswered'), AsyncStorage.getItem('dmvCorrect')]).then(([a, b, c, d]) => {
            try {
                setKnown(JSON.parse(a || '[]'));
                setXp(Number(b) || 0);
                setAnswered(JSON.parse(c || '[]'));
                setCorrectIds(JSON.parse(d || '[]'));
            }
            catch { }
        });
    }, []));
    const cards = useMemo(() => dmvCards.filter(c => category === 'All' || c.category === category), [category]);
    const qs = useMemo(() => questions.filter(q => category === 'All' || q.category === category), [category]);
    const card = cards[Math.min(index, Math.max(cards.length - 1, 0))];
    const q = qs[Math.min(index, Math.max(qs.length - 1, 0))];
    const progress = Math.round(100 * known.length / Math.max(dmvCards.length, 1));
    const openMode = (m: 'learn' | 'quiz', cat = category) => { setCategory(cat); setMode(m); setIndex(0); setTranslated(false); setAssisted(false); setSelected(null); setExpanded(false); };
    const changeCategory = (cat: string) => { setCategory(cat); setIndex(0); setSelected(null); setTranslated(false); setAssisted(false); setExpanded(false); };
    const next = () => { setIndex(i => i + 1); setSelected(null); setTranslated(false); setAssisted(false); setExpanded(false); };
    const toggleTranslation = () => { setTranslated(v => !v); setAssisted(true); };
    const markKnown = async () => {
        if (!card || known.includes(card.id))
            return;
        const nextKnown = [...known, card.id];
        setKnown(nextKnown);
        await AsyncStorage.setItem('dmvKnownCards', JSON.stringify(nextKnown));
        const newXp = xp + 5;
        setXp(newXp);
        await AsyncStorage.setItem('dmvXP', String(newXp));
    };
    const choose = async (i: number) => {
        if (selected !== null || !q)
            return;
        setSelected(i);
        const first = !answered.includes(q.id);
        if (first) {
            const nextAnswered = [...answered, q.id];
            setAnswered(nextAnswered);
            await AsyncStorage.setItem('dmvAnswered', JSON.stringify(nextAnswered));
            if (i === q.correct) {
                const nextCorrect = [...correctIds, q.id];
                setCorrectIds(nextCorrect);
                await AsyncStorage.setItem('dmvCorrect', JSON.stringify(nextCorrect));
                const newXp = xp + (assisted ? 10 : 15);
                setXp(newXp);
                await AsyncStorage.setItem('dmvXP', String(newXp));
            }
        }
    };
    const header = <View style={s.header}><TouchableOpacity accessibilityLabel="Go back" onPress={() => mode === 'home' ? router.back() : setMode('home')} style={s.back}><Ionicons name="arrow-back" color={PURPLE} size={23}/></TouchableOpacity><View style={{ flex: 1 }}><Text style={s.kicker}>MY ENGLISH JOURNEY</Text><Text style={s.title}>DMV Academy 🚗</Text></View><View style={s.xp}><Text style={s.xpText}>⭐ {xp} XP</Text></View></View>;
    const translateButton = <TouchableOpacity accessibilityRole="button" onPress={toggleTranslation} style={s.translate}><Ionicons name="language-outline" size={19} color={PURPLE}/><Text style={s.translateText}>{translated ? 'Hide Afghan Dari' : 'Translate everything to Afghan Dari'}</Text></TouchableOpacity>;
    const complete = mode === 'learn' ? index >= cards.length : index >= qs.length;
    return <View style={s.root}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { maxWidth:theme.width, width: '100%', alignSelf: 'center', paddingTop:insets.top+20,paddingBottom:insets.bottom+30 }]}>{header}
 {mode === 'home' ? <>
  <Text style={s.subtitle}>Small lessons. Big confidence. English first, Afghan Dari whenever you need it.</Text>
  <View style={s.hero}><Text style={s.heroEyebrow}>YOUR DRIVING ADVENTURE</Text><Text style={s.heroTitle}>Ready for today's mission?</Text><Text style={s.heroSub}>Study a little, try a challenge, and earn stars for what you learn.</Text><TouchableOpacity onPress={() => openMode('quiz', 'All')} style={s.primary}><Text style={s.primaryText}>Start 5-minute challenge  →</Text></TouchableOpacity></View>
  <View style={s.stats}><View style={s.stat}><Text style={s.statNum}>{known.length}/{dmvCards.length}</Text><Text style={s.statLabel}>Cards learned</Text></View><View style={s.stat}><Text style={s.statNum}>{correctIds.length}/{questions.length}</Text><Text style={s.statLabel}>Quiz correct</Text></View><View style={s.stat}><Text style={s.statNum}>{progress}%</Text><Text style={s.statLabel}>Card progress</Text></View></View>
  <TouchableOpacity onPress={() => router.push('/dmv-adventure')} style={{ backgroundColor: theme.olive, padding: 18, borderRadius: 20, marginTop: 20, borderWidth: 1, borderColor: theme.line }}><Text style={{ fontSize: 10, color: theme.green, fontWeight: '900' }}>NEW · INTERACTIVE MISSIONS</Text><Text style={{ fontSize: 21, fontWeight: '900', color: INK, marginTop: 6 }}>🚗 Driving Adventure</Text><Text style={{ fontSize: 13, color: theme.success, marginTop: 6 }}>Explore California regions and the expanded handbook question course.</Text><Text style={{ color: theme.green, fontWeight: '900', marginTop: 12 }}>Open adventure →</Text></TouchableOpacity>
   <Text style={s.sectionTitle}>Choose your learning path</Text>
  {categories.filter(x => x !== 'All').map((cat, i) => <View key={cat} style={s.path}><View style={[s.pathIcon, { backgroundColor: [theme.peach, theme.sage, theme.sage][i] }]}><Ionicons name={(['stop-circle-outline', 'car-outline', 'shield-checkmark-outline'] as const)[i]} size={27} color={PURPLE}/></View><View style={{ flex: 1 }}><Text style={s.pathTitle}>{cat}</Text><Text style={s.pathSub}>{dmvCards.filter(x => x.category === cat).length} starter cards · {questions.filter(x => x.category === cat).length} challenges</Text></View><TouchableOpacity accessibilityLabel={'Study ' + cat} onPress={() => openMode('learn', cat)} style={s.miniButton}><Text style={s.miniButtonText}>Study</Text></TouchableOpacity><TouchableOpacity accessibilityLabel={'Quiz ' + cat} onPress={() => openMode('quiz', cat)} style={s.miniButton}><Ionicons name="play" color={PURPLE} size={17}/></TouchableOpacity></View>)}
  <Text style={s.sectionTitle}>Official California study sources</Text>
  <TouchableOpacity onPress={() => Linking.openURL(HANDBOOK)} style={s.source}><Ionicons name="book-outline" color={PURPLE} size={19}/><Text style={s.sourceText}>California Driver's Handbook ↗</Text></TouchableOpacity>
  <TouchableOpacity onPress={() => Linking.openURL(SIGNS)} style={s.source}><Ionicons name="images-outline" color={PURPLE} size={19}/><Text style={s.sourceText}>Official Caltrans road sign charts ↗</Text></TouchableOpacity>
  <TouchableOpacity onPress={() => router.push('/dmv-exam')} style={[s.primary, { marginTop: 13 }]}><Text style={s.primaryText}>📝 NEW: 36-question mock exams + mistake review →</Text></TouchableOpacity>
  <TouchableOpacity onPress={() => Linking.openURL(QUIZZES)} style={s.source}><Ionicons name="document-text-outline" color={PURPLE} size={19}/><Text style={s.sourceText}>Official DMV sample knowledge tests ↗</Text></TouchableOpacity>
  <Text style={s.disclaimer}>This is a starter interactive lesson set, not the complete handbook curriculum. The practice questions and Afghan Dari translations are educational additions, not DMV-published questions or official translations. Road-sign images are intentionally not simulated with generic icons.</Text>
 </> : complete ? <View style={s.complete}><Text style={{ fontSize: 52 }}>🏆</Text><Text style={s.completeTitle}>Mission complete!</Text><Text style={s.center}>Great work! Every little lesson brings you closer to your goal.</Text><Text style={s.dariHint}>You can review the cards and questions as often as you like.</Text><TouchableOpacity onPress={() => openMode(mode === 'learn' ? 'learn' : 'quiz', category)} style={s.primary}><Text style={s.primaryText}>Try again</Text></TouchableOpacity><TouchableOpacity onPress={() => setMode('home')} style={s.secondary}><Text style={s.secondaryText}>Back to adventure</Text></TouchableOpacity></View> : <>
  <View style={s.rowBetween}><Text style={s.sectionTitle}>{mode === 'learn' ? 'Learn & discover 📚' : 'Quick challenge ⚡'}</Text><Text style={s.count}>{index + 1} / {mode === 'learn' ? cards.length : qs.length}</Text></View>
  <View style={s.track}><View style={[s.fill, { width: `${100 * (index + 1) / Math.max(mode === 'learn' ? cards.length : qs.length, 1)}%` }]}/></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{categories.map(c => <TouchableOpacity key={c} onPress={() => changeCategory(c)} style={[s.chip, category === c && s.activeChip]}><Text style={[s.chipText, category === c && s.activeChipText]}>{c}</Text></TouchableOpacity>)}</ScrollView>
  {mode === 'learn' && card ? <View style={s.lesson}><Text style={s.eyebrow}>DISCOVER · {card.category.toUpperCase()}</Text><Text style={s.cardTitle}>{card.title}</Text><Text style={s.cardMain}>{card.english}</Text>{translated && <><Text style={s.dariTitle}>{card.dariTitle}</Text><Text style={s.dari}>{card.dari}</Text></>}
   <TouchableOpacity onPress={() => setExpanded(v => !v)} style={s.reveal}><Ionicons name="bulb-outline" color={PURPLE} size={19}/><Text style={s.revealText}>{expanded ? 'Hide explanation' : 'Why does this matter? Tap to learn'}</Text></TouchableOpacity>
   {expanded && <View style={s.explain}><Text style={s.explainText}>{card.note}</Text>{translated && <Text style={s.dari}>{card.dariNote}</Text>}</View>}
   {card.category === 'Road signs' && <TouchableOpacity onPress={() => Linking.openURL(SIGNS)} style={s.source}><Ionicons name="open-outline" color={PURPLE} size={17}/><Text style={s.sourceText}>See the authentic sign on Caltrans ↗</Text></TouchableOpacity>}
  </View> : null}
  {mode === 'quiz' && q ? <View style={s.lesson}><Text style={s.eyebrow}>CHALLENGE · {q.category.toUpperCase()}</Text><Text style={s.cardTitle}>{q.en}</Text>{translated && <Text style={s.dari}>{q.dari}</Text>}
   {q.choices.map((a, i) => <TouchableOpacity accessibilityRole="button" key={i} onPress={() => choose(i)} disabled={selected !== null} style={[s.option, selected === i && { borderColor: i === q.correct ? theme.success : theme.error, backgroundColor: i === q.correct ? theme.soft : theme.errorBg }, selected !== null && i === q.correct && { borderColor: theme.success }]}><View style={s.optionLetter}><Text style={s.optionLetterText}>{String.fromCharCode(65 + i)}</Text></View><View style={{ flex: 1 }}><Text style={s.optionText}>{a.en}</Text>{translated && <Text style={s.dariOption}>{a.dari}</Text>}</View>{selected !== null && i === q.correct && <Ionicons name="checkmark-circle" color={theme.success} size={22}/>}</TouchableOpacity>)}
   {selected !== null && <View style={s.feedback}><Text style={s.feedbackTitle}>{selected === q.correct ? '🎉 Amazing! You got it!' : '💡 Nice try! Here is the right answer.'}</Text><Text style={s.explainText}>{q.why}</Text>{translated && <Text style={s.dari}>{q.whyDari}</Text>}<Text style={s.bonus}>{selected === q.correct ? (assisted ? '+10 XP for a first correct answer' : '+15 XP for a first correct answer without translation') : 'Mistakes help us learn. Try again next time!'}</Text></View>}
  </View> : null}
  {translateButton}
  <View style={s.actions}>{mode === 'learn' && card && !known.includes(card.id) && <TouchableOpacity onPress={markKnown} style={s.secondary}><Text style={s.secondaryText}>✓ I understand · +5 XP</Text></TouchableOpacity>}<TouchableOpacity onPress={next} disabled={mode === 'quiz' && selected === null} style={[s.primary, { flex: 1 }, mode === 'quiz' && selected === null && { opacity: .45 }]}><Text style={s.primaryText}>Next →</Text></TouchableOpacity></View>
  <Text style={s.disclaimer}>English is shown first. Tap Translate for the question, every answer, and feedback in Afghan Dari. Practice questions are educational, not official DMV exam questions. Consult the current California Driver's Handbook for authoritative rules.</Text>
 </>}
 </ScrollView></View>;
}
const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG
    },
    content: { paddingHorizontal: 19, paddingBottom: 65, maxWidth: theme.width },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11
    },
    back: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: theme.sage,
        justifyContent: 'center',
        alignItems: 'center'
    },
    kicker: {
        fontSize: 9,
        fontWeight: '900',
        color: PURPLE,
        letterSpacing: 1.2
    },
    title: { color: INK, marginTop: 3, fontSize: 31, lineHeight: 38, fontWeight: '800', letterSpacing: -1 },
    xp: {
        backgroundColor: theme.peach,
        paddingHorizontal: 11,
        paddingVertical: 10,
        borderRadius: 14
    },
    xpText: {
        fontWeight: '900',
        color: theme.ink,
        fontSize: 12
    },
    subtitle: {
        color: MUTED,
        fontSize: 14,
        lineHeight: 22,
        marginTop: 20
    },
    hero: { marginTop: 22, padding: 22, backgroundColor: theme.sage, borderRadius: theme.radius },
    heroEyebrow: {
        fontSize: 10,
        color: PURPLE,
        fontWeight: '900',
        letterSpacing: 1
    },
    heroTitle: { color: INK, marginTop: 8, fontSize: 28, lineHeight: 35, fontWeight: '800', letterSpacing: -.7 },
    heroSub: {
        fontSize: 13,
        color: theme.muted,
        lineHeight: 21,
        marginTop: 8,
        marginBottom: 19
    },
    primary: { backgroundColor: PURPLE, paddingVertical: 15, paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center', minHeight: 54, borderRadius: theme.buttonRadius },
    primaryText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 13
    },
    stats: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 18
    },
    stat: {
        flex: 1,
        backgroundColor: theme.surface,
        padding: 13,
        borderRadius: 17,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.soft
    },
    statNum: {
        color: INK,
        fontSize: 19,
        fontWeight: '900'
    },
    statLabel: {
        fontSize: 10,
        color: MUTED,
        marginTop: 5
    },
    sectionTitle: {
        fontSize: 17,
        color: INK,
        fontWeight: '900',
        marginTop: 25,
        marginBottom: 13
    },
    path: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.soft,
        gap: 9,
        marginBottom: 10
    },
    pathIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pathTitle: {
        fontSize: 13,
        color: INK,
        fontWeight: '900'
    },
    pathSub: {
        fontSize: 10,
        color: MUTED,
        marginTop: 4
    },
    miniButton: {
        backgroundColor: theme.sage,
        paddingHorizontal: 11,
        paddingVertical: 11,
        borderRadius: 12
    },
    miniButtonText: {
        color: PURPLE,
        fontSize: 11,
        fontWeight: '900'
    },
    source: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        padding: 13,
        backgroundColor: theme.paper,
        borderRadius: 13,
        marginTop: 9
    },
    sourceText: {
        fontSize: 12,
        fontWeight: '800',
        color: PURPLE,
        flexShrink: 1
    },
    disclaimer: {
        fontSize: 11,
        color: MUTED,
        lineHeight: 18,
        marginTop: 23
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    count: {
        color: PURPLE,
        fontSize: 12,
        fontWeight: '900'
    },
    track: {
        height: 9,
        borderRadius: 9,
        backgroundColor: theme.sage,
        overflow: 'hidden'
    },
    fill: {
        height: '100%',
        backgroundColor: theme.success
    },
    chips: {
        gap: 7,
        paddingVertical: 18
    },
    chip: {
        backgroundColor: theme.surface,
        borderColor: theme.soft,
        borderWidth: 1,
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 14
    },
    activeChip: {
        backgroundColor: PURPLE
    },
    chipText: {
        fontSize: 11,
        color: MUTED,
        fontWeight: '800'
    },
    activeChipText: {
        color: 'white'
    },
    lesson: {
        backgroundColor: theme.surface,
        borderRadius: 23,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.soft
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: '900',
        color: PURPLE,
        letterSpacing: 1
    },
    cardTitle: {
        fontSize: 23,
        fontWeight: '900',
        color: INK,
        marginTop: 12,
        lineHeight: 31
    },
    cardMain: {
        fontSize: 16,
        color: INK,
        lineHeight: 25,
        marginTop: 14
    },
    dariTitle: {
        fontSize: 17,
        color: PURPLE,
        textAlign: 'right',
        writingDirection: 'rtl',
        fontWeight: '800',
        marginTop: 14
    },
    dari: {
        fontSize: 15,
        color: theme.muted,
        textAlign: 'right',
        writingDirection: 'rtl',
        lineHeight: 26,
        marginTop: 11
    },
    reveal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        backgroundColor: theme.sage,
        padding: 14,
        borderRadius: 14,
        marginTop: 20
    },
    revealText: {
        fontSize: 12,
        color: PURPLE,
        fontWeight: '900'
    },
    explain: {
        padding: 13,
        backgroundColor: theme.paper,
        borderRadius: 13,
        marginTop: 10
    },
    explainText: {
        fontSize: 13,
        color: INK,
        lineHeight: 21
    },
    translate: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: theme.sage,
        borderRadius: 14,
        padding: 15,
        marginTop: 15
    },
    translateText: {
        fontWeight: '900',
        fontSize: 12,
        color: PURPLE
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 13
    },
    secondary: {
        backgroundColor: theme.soft,
        borderRadius: 15,
        paddingHorizontal: 13,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    secondaryText: {
        color: theme.green,
        fontWeight: '900',
        fontSize: 12
    },
    option: {
        borderWidth: 1,
        borderColor: theme.sage,
        borderRadius: 15,
        padding: 13,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginTop: 11
    },
    optionLetter: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: theme.sage,
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionLetterText: {
        fontSize: 12,
        fontWeight: '900',
        color: PURPLE
    },
    optionText: {
        fontSize: 13,
        fontWeight: '800',
        color: INK,
        lineHeight: 20
    },
    dariOption: {
        fontSize: 13,
        color: theme.muted,
        textAlign: 'right',
        writingDirection: 'rtl',
        lineHeight: 22,
        marginTop: 7
    },
    feedback: {
        backgroundColor: theme.soft,
        borderRadius: 15,
        padding: 14,
        marginTop: 15
    },
    feedbackTitle: {
        fontSize: 15,
        fontWeight: '900',
        color: INK,
        marginBottom: 9
    },
    bonus: {
        color: theme.green,
        fontWeight: '800',
        fontSize: 11,
        marginTop: 11
    },
    complete: {
        backgroundColor: theme.surface,
        borderRadius: 25,
        padding: 28,
        marginTop: 28,
        alignItems: 'center',
        gap: 13
    },
    completeTitle: {
        fontSize: 25,
        fontWeight: '900',
        color: INK
    },
    center: {
        textAlign: 'center',
        color: INK,
        lineHeight: 22
    },
    dariHint: {
        textAlign: 'center',
        fontSize: 12,
        color: MUTED
    }
});
