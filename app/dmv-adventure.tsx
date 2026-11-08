import DriverJeep from '../src/DriverJeep';
import { theme } from '../src/theme';
import { DRIVING_REWARD_SCORES_KEY, rewardForScore } from '../src/rewards';
import RewardEstimate from '../src/RewardEstimate';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Linking, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { speakEnglish, stopEnglishAudio } from '../src/englishAudio';
import { useDariPreference } from '../src/useDariPreference';
import AdventureTrail from '../src/AdventureTrail';
import CaliforniaMasteryMap from '../src/CaliforniaMasteryMap';
import { adventureLevels, adventureRegions, adventureRoundCount, hasMasteredCalifornia, canPlayLevel, completeLevel, nextLevelIndex, orderedRound, sanitizeCompleted, RegionId } from '../src/dmvAdventure';
import { handbook } from '../src/dmvAdventureExtras';
const signs: Record<string, any> = { stop: require('../assets/dmv-signs/stop.png'), yield: require('../assets/dmv-signs/yield.png'), 'speed-limit-50': require('../assets/dmv-signs/speed-limit-50.png'), 'no-right-turn': require('../assets/dmv-signs/no-right-turn.png'), 'no-u-turn': require('../assets/dmv-signs/no-u-turn.png'), 'do-not-enter': require('../assets/dmv-signs/do-not-enter.png'), 'wrong-way': require('../assets/dmv-signs/wrong-way.png'), 'one-way': require('../assets/dmv-signs/one-way.png'), 'school-crossing': require('../assets/dmv-signs/school-crossing.png') };
const KEY = 'dmvAdventureCompletedV1', XPKEY = 'dmvAdventureXPV1';
type Daily = {
    date: string;
    lessons: number;
    earned: number;
    highScores: number;
};
const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const emptyDaily = (): Daily => ({ date: dayKey(), lessons: 0, earned: 0, highScores: 0 });
export default function DmvAdventure() {
    const router = useRouter(), scroll = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const { width: screenWidth, height: screenHeight, fontScale } = useWindowDimensions();
    const compact = screenWidth < 380;
    const focusMap = useCallback((y: number) => scroll.current?.scrollTo({ y: Math.max(0, y - (screenHeight - insets.top - insets.bottom) * .3), animated: false }), [screenHeight, insets.top, insets.bottom]);
    const { translated, toggleDari } = useDariPreference();
    const [completed, setCompleted] = useState<string[]>([]), [xp, setXp] = useState(0), [streak, setStreak] = useState(0);
    const [rewardScores, setRewardScores] = useState<Record<string, number>>({}), [rewardAdded, setRewardAdded] = useState(0);
    const [daily, setDaily] = useState<Daily>(emptyDaily), [claimed, setClaimed] = useState<string[]>([]);
    const [regionId, setRegionId] = useState<RegionId>('coast'), [tab, setTab] = useState<'map' | 'missions' | 'rewards'>('map');
    const [showStateMap, setShowStateMap] = useState(true);
    const [mapView, setMapView] = useState<'regions' | 'trail'>('trail');
    const [active, setActive] = useState<number | null>(null), [stage, setStage] = useState(0), [score, setScore] = useState(0), [selected, setSelected] = useState<number | null>(null);
    const [soundOn, setSoundOn] = useState(false), [loaded, setLoaded] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
    const answerLock = useRef(false), saveLock = useRef(false), claimLock = useRef(false);
    const nextIndex = nextLevelIndex(completed), allDone = hasMasteredCalifornia(completed);
    const current = adventureLevels[Math.min(nextIndex, adventureLevels.length - 1)];
    const region = adventureRegions.find(r => r.id === regionId)!;
    const level = active === null ? null : adventureLevels[active];
    const round = level && stage < level.rounds.length ? orderedRound(level.rounds[stage]) : null;
    const done = !!level && stage >= level.rounds.length;
    const passed = score >= 4;
    const regionLevels = adventureLevels.filter(l => l.region === regionId);
    const regionComplete = regionLevels.every(l => completed.includes(l.id));
    const regionUnlocked = canPlayLevel(adventureLevels.findIndex(l => l.region === regionId), completed);
    const b = (en: string, dari: string, kind: 'body' | 'small' = 'body') => <><Text style={kind === 'small' ? s.small : s.body}>{en}</Text>{translated && <Text style={s.dari}>{dari}</Text>}</>;
    const readAloud = (message: string) => { void speakEnglish(message).catch(error => setError(error.message)); };
    const say = (message: string) => {
        if (soundOn)
            readAloud(message);
    };
    const top = () => scroll.current?.scrollTo({ y: 0, animated: false });
    useFocusEffect(useCallback(() => {
        let live = true;
        (async () => {
            try {
                const [a, b, c, d, e, f] = await Promise.all([KEY, XPKEY, 'dmvGameStreakV2', 'dmvAdventureDailyV3', 'dmvAdventureClaimedV3', DRIVING_REWARD_SCORES_KEY].map(k => AsyncStorage.getItem(k)));
                const restored = sanitizeCompleted(JSON.parse(a || '[]'));
                const record = JSON.parse(d || 'null');
                if (!live)
                    return;
                const savedScores = JSON.parse(f || '{}');
                setRewardScores(savedScores && typeof savedScores === 'object' && !Array.isArray(savedScores) ? savedScores : {});
                setCompleted(restored);
                setXp(Number(b) || 0);
                setStreak(Number(c) || 0);
                setDaily(record?.date === dayKey() ? record : emptyDaily());
                const rewards = JSON.parse(e || '[]');
                setClaimed(Array.isArray(rewards) ? rewards : []);
                setRegionId(adventureLevels[Math.min(nextLevelIndex(restored), adventureLevels.length - 1)].region);
                setShowStateMap(true);
                setLoaded(true);
                setError('');
            }
            catch {
                if (live) {
                    setError('Could not load saved progress. Go back and reopen the Adventure.');
                }
            }
        })();
        return () => { live = false; void stopEnglishAudio(); };
    }, []));
    useEffect(() => () => { void stopEnglishAudio(); }, []);
    const start = (index: number) => {
        if (!loaded || saveLock.current || !canPlayLevel(index, completed))
            return;
        void stopEnglishAudio();
        setActive(index);
        setRewardAdded(0);
        setStage(0);
        setScore(0);
        setSelected(null);
        setError('');
        answerLock.current = false;
        top();
        say(`Level ${index + 1}. ${adventureLevels[index].title}`);
    };
    const answer = (index: number) => {
        if (answerLock.current || selected !== null || !round)
            return;
        answerLock.current = true;
        setSelected(index);
        if (index === round.correct)
            setScore(v => v + (stage === 2 ? 1 : 2));
        say(index === round.correct ? 'Correct! Great driving.' : 'Keep learning. Read the explanation.');
    };
    const finish = async () => {
        if (!level || saveLock.current)
            return;
        if (!passed) {
            setStage(level.rounds.length);
            top();
            return;
        }
        saveLock.current = true;
        setSaving(true);
        setError('');
        try {
            const fresh = !completed.includes(level.id), next = completeLevel(level.id, completed);
            const bestScores = { ...rewardScores, [level.id]: Math.max(rewardScores[level.id] === 100 ? 100 : 80, score * 20) };
            const previousReward = fresh ? 0 : 2 + (rewardForScore(rewardScores[level.id]) === 5 ? 3 : 0);
            const added = rewardForScore(bestScores[level.id]) - previousReward;
            const previous = daily.date === dayKey() ? daily : emptyDaily();
            const nextDaily = { ...previous, lessons: previous.lessons + 1, earned: previous.earned + (fresh ? 25 : 0), highScores: previous.highScores + 1 };
            await AsyncStorage.multiSet([[DRIVING_REWARD_SCORES_KEY, JSON.stringify(bestScores)], [KEY, JSON.stringify(next)], [XPKEY, String(xp + (fresh ? 25 : 0))], ['dmvGameStreakV2', String(streak + (fresh ? 1 : 0))], ['dmvAdventureDailyV3', JSON.stringify(nextDaily)]]);
            setRewardScores(bestScores);
            setRewardAdded(added);
            setCompleted(next);
            setXp(v => v + (fresh ? 25 : 0));
            setStreak(v => v + (fresh ? 1 : 0));
            setDaily(nextDaily);
            setStage(level.rounds.length);
            top();
        }
        catch {
            setError('Progress could not be saved. Please try again.');
        }
        finally {
            saveLock.current = false;
            setSaving(false);
        }
    };
    const advance = () => {
        if (selected === null || !level || saving)
            return;
        if (stage === level.rounds.length - 1) {
            void finish();
        }
        else {
            setStage(v => v + 1);
            setSelected(null);
            answerLock.current = false;
            top();
        }
    };
    const backToMap = (continueRoute = false) => {
        if (saving)
            return;
        void stopEnglishAudio();
        setActive(null);
        setTab('map');
        setMapView('trail');
        if (continueRoute)
            setRegionId(current.region);
        top();
    };
    const reviewRegion = (id: RegionId) => { setShowStateMap(false); setRegionId(id); setActive(null); setTab('map'); setMapView('trail'); top(); };
    const goHome = () => {
        if (saveLock.current)
            return;
        void stopEnglishAudio();
        router.replace('/');
    };
    const masteryMap = <CaliforniaMasteryMap translated={translated} onReview={reviewRegion} onExam={() => router.push('/dmv-exam')}/>;
    const dailyNow = daily.date === dayKey() ? daily : emptyDaily();
    const goals = [{ id: 'one', label: 'Complete one lesson', dari: 'یک درس را تکمیل کنید', value: dailyNow.lessons, target: 1, bonus: 5 }, { id: 'xp', label: 'Earn 30 lesson XP', dari: '۳۰ امتیاز از درس بگیرید', value: dailyNow.earned, target: 30, bonus: 10 }, { id: 'three', label: 'Complete three lessons', dari: 'سه درس را تکمیل کنید', value: dailyNow.lessons, target: 3, bonus: 15 }, { id: 'master', label: 'Master two lessons', dari: 'دو درس را موفقانه تکمیل کنید', value: dailyNow.highScores, target: 2, bonus: 10 }];
    const claim = async (id: string, bonus: number) => {
        const key = dayKey() + id, goal = goals.find(g => g.id === id);
        if (claimLock.current || claimed.includes(key) || !goal || goal.value < goal.target)
            return;
        claimLock.current = true;
        try {
            const next = [...claimed, key];
            await AsyncStorage.multiSet([['dmvAdventureClaimedV3', JSON.stringify(next)], [XPKEY, String(xp + bonus)]]);
            setClaimed(next);
            setXp(v => v + bonus);
            setError('');
        }
        catch {
            setError('Reward could not be saved. Please try again.');
        }
        finally {
            claimLock.current = false;
        }
    };
    if (loaded && active === null && tab === 'map' && mapView === 'trail' && (!allDone || !showStateMap))
        return <View style={[s.root, { backgroundColor: region.ground, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }]}>
  <View style={[s.mapToolbar, { paddingTop: insets.top + 8, paddingHorizontal: compact ? 8 : 14, gap: compact ? 6 : 10 }]}>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go to main screen" style={s.iconButton} onPress={goHome}><Ionicons name="home-outline" size={25} color="white"/></TouchableOpacity>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to California regions" onPress={() => { void stopEnglishAudio(); setMapView('regions'); }} style={s.mapBack}><Ionicons name="arrow-back" size={23} color="white"/>{!compact && fontScale < 1.4 && <Text style={s.mapBackText}>{translated ? 'منطقه‌ها' : 'Regions'}</Text>}</TouchableOpacity>
   <View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={[s.mapRegionTitle, compact && { fontSize: 15 }]}>{region.emoji} {region.name}</Text>{translated && <Text numberOfLines={1} style={s.mapRegionDari}>{region.dari}</Text>}</View>
   <TouchableOpacity style={s.iconButton} accessibilityRole="button" accessibilityLabel={translated ? 'Hide Afghan Dari' : 'Translate to Afghan Dari'} onPress={toggleDari}><Ionicons name="language-outline" size={25} color="white"/></TouchableOpacity>{!compact && fontScale < 1.4 && <Text style={s.xp}>⭐ {xp}</Text>}
  </View>
  <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
   {!regionUnlocked && !regionComplete && <View style={s.mapNotice}>{b('Preview: complete earlier levels to unlock this region.', 'برای باز کردن این منطقه، سطح‌های قبلی را تکمیل کنید.', 'small')}</View>}
   <RewardEstimate area="driving" compact refreshKey={JSON.stringify(rewardScores)}/><AdventureTrail fullScreen onFocusPoint={focusMap} region={region} completed={completed} currentIndex={Math.min(nextIndex, adventureLevels.length - 1)} onStart={start} translated={translated}/>
  </ScrollView>
 </View>;
    return <View style={[s.root, { paddingLeft: insets.left, paddingRight: insets.right }]}><ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={[s.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: compact ? 12 : 16 }]}>
  <View style={s.top}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" style={s.iconButton} disabled={saving} onPress={() => active === null ? goHome() : backToMap()}><Ionicons name="arrow-back" color="white" size={25}/></TouchableOpacity><View style={{ flex: 1 }}><Text style={s.kicker}>MY ENGLISH JOURNEY</Text><Text style={s.topTitle}>{level ? `Level ${active! + 1}: ${level.title}` : 'California Driving Adventure'}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={soundOn ? 'Turn voice off' : 'Turn voice on'} style={s.iconButton} onPress={() => { void stopEnglishAudio(); setSoundOn(v => !v); }}><Ionicons name={soundOn ? 'volume-high' : 'volume-mute'} color="white" size={23}/></TouchableOpacity><Text style={s.xp}>⭐ {xp}</Text></View>
  <TouchableOpacity accessibilityRole="button" accessibilityLabel={translated ? 'Hide Afghan Dari' : 'Translate everything to Afghan Dari'} style={s.translate} onPress={toggleDari}><Ionicons name="language-outline" size={20} color={theme.green}/><Text style={s.translateText}>{translated ? 'Hide Afghan Dari' : 'Translate everything to Afghan Dari'}</Text></TouchableOpacity>
  {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  <RewardEstimate area="driving" refreshKey={JSON.stringify(rewardScores)}/>
  {!loaded ? <Text style={s.body}>{error ? 'Progress is unavailable.' : 'Loading your California journey…'}</Text> : active === null ? <>
   {tab === 'map' ? <>
    {allDone && showStateMap ? masteryMap : <>
    {allDone && <TouchableOpacity style={s.action} onPress={() => { setShowStateMap(true); top(); }}><Text style={s.actionText}>View your whole California map</Text>{translated && <Text style={s.actionDari}>نقشهٔ کامل کالیفورنیا را ببینید</Text>}</TouchableOpacity>}
    <View style={s.hero}><Text style={s.eyebrow}>YOUR CALIFORNIA ROAD TRIP</Text><Text style={s.title}>{allDone ? 'Every region explored!' : 'Learn one mile at a time'}</Text>{translated && <Text style={s.dari}>{allDone ? 'تمام منطقه‌ها را کشف کردید!' : 'در هر قدم چیزی یاد بگیرید'}</Text>}{b(`${adventureRegions.length} regions • ${adventureLevels.length} levels • ${adventureRoundCount} question rounds`, `${adventureRegions.length} منطقه • ${adventureLevels.length} سطح • ${adventureRoundCount} دور پرسش`, 'small')}<View style={s.track}><View style={[s.fill, { width: `${completed.length / adventureLevels.length * 100}%` }]}/></View>{b(`${completed.length}/${adventureLevels.length} levels cleared • 🔥 ${streak} mission streak`, `${completed.length} از ${adventureLevels.length} سطح تکمیل شد • ${streak} موفقیت پیاپی`, 'small')}<TouchableOpacity style={s.action} onPress={() => reviewRegion(current.region)}><Text style={s.actionText}>{allDone ? 'Replay the final level' : `Continue: Level ${nextIndex + 1}`}</Text>{translated && <Text style={s.actionDari}>{allDone ? 'سطح آخر را دوباره بازی کنید' : 'به سطح بعدی ادامه بدهید'}</Text>}</TouchableOpacity></View>
    <Text style={s.heading}>Explore California</Text>{translated && <Text style={s.dari}>کالیفورنیا را کشف کنید</Text>}
    <View style={s.regions}>{adventureRegions.map(r => { const levels = adventureLevels.filter(l => l.region === r.id), count = levels.filter(l => completed.includes(l.id)).length, unlocked = canPlayLevel(adventureLevels.findIndex(l => l.region === r.id), completed); return <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: regionId === r.id }} accessibilityLabel={`${r.name}, ${count} of ${levels.length} levels complete${unlocked ? '' : ', preview, locked'}`} key={r.id} onPress={() => reviewRegion(r.id)} style={[s.regionCard, { backgroundColor: regionId === r.id ? r.ground : 'white', borderColor: regionId === r.id ? r.color : theme.line }]}><Text style={s.regionEmoji}>{r.emoji}</Text><Text style={[s.regionName, { color: r.color }]}>{r.name}</Text>{translated && <Text style={s.regionDari}>{r.dari}</Text>}<Text style={s.small}>{count}/{levels.length} {count === levels.length ? '✓' : unlocked ? '▶' : '🔒'}</Text></TouchableOpacity>; })}</View>
    <View style={s.studyNote}>{b('Original practice questions based on the California Driver’s Handbook. This growing course is a study aid; completing the map does not guarantee a permit-test pass.', 'این پرسش‌های تمرینی بر اساس کتاب رهنمای رانندهٔ کالیفورنیا تهیه شده‌اند. این دورهٔ در حال گسترش برای یادگیری است؛ تکمیل نقشه قبولی امتحان را تضمین نمی‌کند.', 'small')}<TouchableOpacity onPress={() => void Linking.openURL(handbook)}><Text style={s.link}>Open the official California Driver’s Handbook ↗</Text>{translated && <Text style={s.dari}>کتاب رسمی رهنمای راننده را باز کنید</Text>}</TouchableOpacity><TouchableOpacity onPress={() => router.push('/dmv-exam')}><Text style={s.link}>Practice a mixed permit exam →</Text>{translated && <Text style={s.dari}>امتحان تمرینی از موضوعات مختلف</Text>}</TouchableOpacity></View>
    </>}
   </> : tab === 'missions' ? <View style={s.panel}><Text style={s.title}>🎯 Today’s missions</Text>{translated && <Text style={s.dari}>مأموریت‌های امروز</Text>}{b('Complete lessons, then claim your bonus XP.', 'درس‌ها را تکمیل کنید و امتیاز اضافی بگیرید.')}{goals.map(g => { const got = claimed.includes(dayKey() + g.id), ready = g.value >= g.target; return <View key={g.id} style={s.goal}><View style={{ flex: 1 }}>{b(g.label, g.dari)}<View style={s.track}><View style={[s.fill, { width: `${Math.min(100, g.value / g.target * 100)}%` }]}/></View><Text style={s.small}>{Math.min(g.value, g.target)}/{g.target}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Claim ${g.bonus} XP for ${g.label}`} disabled={!ready || got} onPress={() => void claim(g.id, g.bonus)} style={[s.rewardButton, (!ready || got) && { backgroundColor: theme.disabled }]}><Text style={s.actionText}>{got ? '✓' : `+${g.bonus} XP`}</Text></TouchableOpacity></View>; })}</View> : <View style={s.panel}><Text style={s.title}>🏆 Trophy garage</Text>{translated && <Text style={s.dari}>گاراژ جایزه‌ها</Text>}<Text style={s.bigXp}>{xp} XP</Text>{b('25 XP for each newly mastered level. Replays help you practice.', 'برای هر سطح تازه که موفق شوید ۲۵ امتیاز می‌گیرید. تکرار برای تمرین است.')}{adventureRegions.map(r => { const levels = adventureLevels.filter(l => l.region === r.id), count = levels.filter(l => completed.includes(l.id)).length; return <View style={s.goal} key={r.id}><Text style={s.regionEmoji}>{r.emoji}</Text><View style={{ flex: 1 }}>{b(r.name, r.dari)}<Text style={s.small}>{count}/{levels.length}</Text></View><Text style={s.regionEmoji}>{count === levels.length ? '🏅' : '🔒'}</Text></View>; })}{b('XP and badges are in-app achievements, not cash rewards.', 'امتیاز و نشان‌ها دستاورد داخل برنامه است، نه جایزهٔ نقدی.', 'small')}</View>}
   <View style={s.nav}>{([{ id: 'map', en: 'Map', dari: 'نقشه', icon: 'map-outline' }, { id: 'missions', en: 'Missions', dari: 'مأموریت‌ها', icon: 'flag-outline' }, { id: 'rewards', en: 'Rewards', dari: 'جایزه‌ها', icon: 'trophy-outline' }] as const).map(t => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: tab === t.id }} key={t.id} onPress={() => { setTab(t.id); top(); }} style={[s.navItem, tab === t.id && s.navSelected]}><Ionicons name={t.icon} size={22} color={tab === t.id ? 'white' : theme.green}/><Text style={[s.navText, tab === t.id && { color: 'white' }]}>{t.en}</Text>{translated && <Text style={[s.navText, tab === t.id && { color: 'white' }]}>{t.dari}</Text>}</TouchableOpacity>)}</View>
  </> : level && <>
   {done && passed && allDone ? masteryMap : done ? <View style={s.results}><Text style={{ fontSize: 62 }}>{passed ? '🏆' : '💪'}</Text><Text style={s.title}>{passed ? 'Mission mastered!' : 'Keep practicing!'}</Text>{translated && <Text style={s.dari}>{passed ? 'مأموریت موفقانه تکمیل شد!' : 'به تمرین ادامه بدهید!'}</Text>}{b(`You earned ${score}/5 mastery points (${score * 20}%). A level needs 80% to unlock the next one.`, `شما ${score} از ۵ امتیاز (${score * 20} فیصد) گرفتید. برای باز کردن سطح بعدی ۸۰ فیصد لازم است.`)}{passed && <Text style={s.body}>{rewardAdded ? `+$${rewardAdded} added to your reward estimate` : 'Reward already counted. Great practice!'}</Text>}{passed && b('Your progress has been saved.', 'پیشرفت شما ذخیره شد.')}<TouchableOpacity style={s.action} onPress={() => passed ? backToMap(true) : start(active!)}><Text style={s.actionText}>{passed ? (allDone ? 'Return to your completed map' : 'Continue your California road trip →') : 'Retry this level ↻'}</Text>{translated && <Text style={s.actionDari}>{passed ? 'به نقشه برگردید و ادامه بدهید' : 'این سطح را دوباره تمرین کنید'}</Text>}</TouchableOpacity></View> : round && <>
    <View style={s.lessonHeader}><Text style={s.eyebrow}>LEVEL {active! + 1}/{adventureLevels.length} • QUESTION {stage + 1}/{level.rounds.length}</Text>{translated && <Text style={s.dari}>سطح {active! + 1} از {adventureLevels.length} • پرسش {stage + 1} از {level.rounds.length}</Text>}<Text style={s.title}>{level.title}</Text>{translated && <Text style={s.dari}>{level.dari}</Text>}<View style={s.track}><View style={[s.fill, { width: `${(stage + 1) / level.rounds.length * 100}%` }]}/></View>{b(`⭐ ${score}/5 mastery • 80% to unlock the next level`, `⭐ ${score} از ۵ امتیاز • ۸۰ فیصد برای سطح بعدی`, 'small')}</View>
    <View style={s.questionCard}><View style={s.coachRow}><DriverJeep width={56} height={52}/><View style={{ flex: 1 }}>{b(round.sign ? 'Look at the sign, then choose an answer.' : 'Read the situation, then choose an answer.', round.sign ? 'به علامت نگاه کنید، سپس جواب را انتخاب کنید.' : 'وضعیت را بخوانید، سپس جواب را انتخاب کنید.', 'small')}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Read question and answers aloud" style={s.iconButton} onPress={() => { void stopEnglishAudio(); readAloud(`${round.prompt} ${round.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c.en}`).join('. ')}`); }}><Ionicons name="volume-high" color={theme.green} size={25}/></TouchableOpacity></View>
     {round.sign && <Image source={signs[round.sign]} accessibilityLabel={`Road sign: ${round.sign}`} style={s.sign} resizeMode="contain"/>}
     <Text style={s.question}>{round.prompt}</Text>{translated && <Text style={s.dari}>{round.promptDari}</Text>}
     {round.choices.map((c, i) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: selected === i, disabled: selected !== null }} disabled={selected !== null} key={`${round.id}-${i}`} onPress={() => answer(i)} style={[s.answer, selected !== null && i === round.correct && s.correct, selected === i && i !== round.correct && s.wrong]}><Text style={s.letter}>{String.fromCharCode(65 + i)}</Text><View style={{ flex: 1 }}>{b(c.en, c.dari)}</View>{selected !== null && i === round.correct && <Ionicons name="checkmark-circle" color={theme.green} size={23}/>}</TouchableOpacity>)}
     {selected !== null && <View accessibilityLiveRegion="polite" style={s.feedback}><Text style={s.feedbackTitle}>{selected === round.correct ? '✓ Correct!' : 'Let’s learn from this'}</Text>{translated && <Text style={s.dari}>{selected === round.correct ? 'درست است!' : 'از این جواب یاد بگیریم'}</Text>}{b(round.why, round.whyDari)}<TouchableOpacity onPress={() => void Linking.openURL(round.source || handbook)}><Text style={s.link}>Read the handbook topic ↗</Text>{translated && <Text style={s.dari}>این موضوع را در کتاب رهنما بخوانید</Text>}</TouchableOpacity></View>}
    </View>
    {b('Using Afghan Dari never lowers your score.', 'استفاده از دری امتیاز شما را کم نمی‌کند.', 'small')}
    {selected !== null && <TouchableOpacity disabled={saving} style={[s.action, saving && { opacity: .6 }]} onPress={advance}><Text style={s.actionText}>{saving ? 'Saving…' : stage === level.rounds.length - 1 ? 'See results →' : 'Next question →'}</Text>{translated && <Text style={s.actionDari}>{saving ? 'در حال ذخیره…' : stage === level.rounds.length - 1 ? 'دیدن نتیجه' : 'پرسش بعدی'}</Text>}</TouchableOpacity>}
   </>}
   <TouchableOpacity disabled={saving} onPress={() => backToMap()} style={s.backLink}><Text style={s.link}>Back to adventure map</Text>{translated && <Text style={s.dari}>برگشت به نقشه</Text>}</TouchableOpacity>
  </>}
 </ScrollView></View>;
}
const s = StyleSheet.create({
    iconButton: {
        minWidth: 48,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mapToolbar: { paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 12 : 50, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.green },
    mapBack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        minWidth: 48,
        minHeight: 48
    },
    mapBackText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800'
    },
    mapRegionTitle: {
        fontSize: 17,
        color: 'white',
        fontWeight: '900'
    },
    mapRegionDari: {
        fontSize: 13,
        color: theme.sage,
        writingDirection: 'rtl',
        marginTop: 4
    },
    mapNotice: {
        padding: 12,
        backgroundColor: theme.peach
    },
    root: {
        flex: 1,
        backgroundColor: theme.paper
    },
    wrap: { width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 22 : 52, paddingBottom: 65, maxWidth: theme.width },
    top: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.green, borderRadius: theme.radius, padding: 14 },
    kicker: {
        fontSize: 9,
        fontWeight: '900',
        color: theme.lime,
        letterSpacing: 1
    },
    topTitle: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '900',
        color: 'white',
        marginTop: 4
    },
    xp: {
        fontWeight: '900',
        fontSize: 12,
        color: theme.lime
    },
    translate: {
        backgroundColor: theme.sage,
        borderRadius: 15,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginVertical: 12
    },
    translateText: {
        fontSize: 12,
        fontWeight: '800',
        color: theme.green,
        flexShrink: 1
    },
    hero: { padding: 21, backgroundColor: theme.olive, borderColor: theme.line, borderWidth: 1, borderRadius: theme.radius },
    eyebrow: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.muted,
        letterSpacing: .7
    },
    title: { color: theme.ink, marginVertical: 8, fontSize: 26, lineHeight: 33, fontWeight: '800', letterSpacing: -.7 },
    body: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.ink
    },
    small: {
        fontSize: 11,
        lineHeight: 17,
        color: theme.muted,
        marginTop: 5
    },
    dari: {
        fontSize: 15,
        lineHeight: 25,
        color: theme.muted,
        writingDirection: 'rtl',
        textAlign: 'right',
        marginTop: 7
    },
    track: { backgroundColor: theme.line, borderRadius: 8, overflow: 'hidden', marginTop: 13, height: 6 },
    fill: {
        height: '100%',
        backgroundColor: theme.success,
        borderRadius: 8
    },
    action: { justifyContent: 'center', backgroundColor: theme.green, alignItems: 'center', marginTop: 17, minHeight: 54, padding: 17, borderRadius: theme.buttonRadius },
    actionText: { color: 'white', textAlign: 'center', fontSize: 15, fontWeight: '800' },
    actionDari: {
        fontSize: 14,
        color: 'white',
        textAlign: 'right',
        writingDirection: 'rtl',
        marginTop: 6
    },
    heading: {
        fontSize: 20,
        color: theme.ink,
        fontWeight: '900',
        marginTop: 24,
        marginBottom: 8
    },
    regions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10
    },
    regionCard: {
        width: '48%',
        flexGrow: 1,
        borderWidth: 2,
        borderRadius: 18,
        padding: 13,
        minHeight: 120
    },
    regionEmoji: {
        fontSize: 30
    },
    regionName: {
        fontSize: 14,
        fontWeight: '900',
        marginTop: 7
    },
    regionDari: {
        fontSize: 13,
        textAlign: 'right',
        writingDirection: 'rtl',
        color: theme.muted,
        marginTop: 5
    },
    regionIntro: {
        padding: 16,
        borderRadius: 15,
        borderLeftWidth: 5,
        backgroundColor: theme.surface,
        marginTop: 17
    },
    studyNote: {
        padding: 17,
        backgroundColor: theme.surface,
        borderRadius: 17,
        marginTop: 16
    },
    link: {
        fontSize: 12,
        lineHeight: 19,
        color: theme.green,
        fontWeight: '800',
        marginTop: 12
    },
    nav: {
        flexDirection: 'row',
        gap: 7,
        padding: 7,
        backgroundColor: theme.sage,
        borderRadius: 20,
        marginTop: 18
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 3,
        borderRadius: 14
    },
    navSelected: {
        backgroundColor: theme.green
    },
    navText: {
        fontSize: 11,
        color: theme.green,
        fontWeight: '800',
        marginTop: 4
    },
    panel: { padding: 18, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: theme.radius },
    goal: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        padding: 14,
        borderRadius: 17,
        backgroundColor: theme.surface,
        marginTop: 12
    },
    rewardButton: {
        backgroundColor: theme.green,
        padding: 12,
        borderRadius: 12
    },
    bigXp: {
        fontSize: 43,
        color: theme.green,
        fontWeight: '900',
        marginVertical: 16
    },
    lessonHeader: { borderWidth: 1, padding: 18, backgroundColor: theme.sage, borderRadius: theme.radius, borderColor: theme.line },
    questionCard: { backgroundColor: theme.surface, marginTop: 14, borderWidth: 1, borderColor: theme.line, padding: 20, borderRadius: theme.radius },
    coachRow: { flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 13, backgroundColor: theme.sage, padding: 13, borderRadius: 18 },
    coachJeep: {
        width: 56,
        height: 52,
        resizeMode: 'contain'
    },
    sign: {
        width: 170,
        height: 150,
        alignSelf: 'center',
        marginVertical: 15
    },
    question: { color: theme.ink, marginVertical: 12, fontSize: 23, lineHeight: 31, fontWeight: '800', letterSpacing: -.4 },
    answer: { borderColor: theme.line, flexDirection: 'row', gap: 11, alignItems: 'center', marginTop: 11, minHeight: 60, borderWidth: 1.5, padding: 15, borderRadius: 16 },
    letter: { fontWeight: '900', color: theme.green, borderRadius: 10, backgroundColor: theme.sage, fontSize: 12, padding: 9 },
    correct: {
        borderColor: theme.success,
        backgroundColor: theme.olive
    },
    wrong: {
        borderColor: theme.error,
        backgroundColor: theme.errorBg
    },
    feedback: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: theme.olive,
        marginTop: 17
    },
    feedbackTitle: {
        fontWeight: '900',
        fontSize: 16,
        color: theme.success,
        marginBottom: 7
    },
    results: { backgroundColor: theme.surface, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: theme.line, borderRadius: theme.radius },
    backLink: {
        alignItems: 'center',
        padding: 17
    },
    error: {
        color: theme.error,
        backgroundColor: theme.errorBg,
        padding: 14,
        borderRadius: 13,
        marginBottom: 12,
        lineHeight: 22
    }
});
