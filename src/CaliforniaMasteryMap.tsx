import { theme } from './theme';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { adventureLevels, adventureRegions, RegionId } from './dmvAdventure';
// Approximate locations on an illustrated state outline, rather than navigation data.
const pins: Record<RegionId, {
    x: number;
    y: number;
}> = { coast: { x: 100, y: 240 }, city: { x: 202, y: 360 }, mountains: { x: 184, y: 210 }, desert: { x: 251, y: 345 }, valley: { x: 159, y: 270 }, redwoods: { x: 79, y: 116 } };
export default function CaliforniaMasteryMap({ translated, onReview, onExam }: {
    translated: boolean;
    onReview: (region: RegionId) => void;
    onExam: () => void;
}) {
    return <View style={s.card}>
  <Text style={s.confetti}>✨  🏆  ✨</Text><Text accessibilityRole="header" style={s.title}>California Trail Master!</Text>
  {translated && <Text style={s.dari}>قهرمان مسیر کالیفورنیا!</Text>}
  <Text style={s.body}>You completed all {adventureLevels.length} levels across California. Every region is yours to explore again.</Text>
  {translated && <Text style={s.dari}>شما تمام {adventureLevels.length} سطح را در کالیفورنیا تکمیل کردید. هر منطقه را دوباره تمرین کرده می‌توانید.</Text>}
  <View style={s.map}>
   <Image source={require('../assets/game-art/california-mastery.png')} style={StyleSheet.absoluteFill} resizeMode="contain" accessible={false}/>
   <Text style={s.ocean}>PACIFIC{'\n'}OCEAN</Text>
   {adventureRegions.map((r, i) => <TouchableOpacity key={r.id} accessibilityRole="button" accessibilityLabel={`${r.name}, all levels complete. Review region.`} onPress={() => onReview(r.id)} style={[s.pin, { left: `${pins[r.id].x / 340 * 100}%`, top: `${pins[r.id].y / 450 * 100}%`, backgroundColor: r.color }]}><Text style={s.pinText}>{i + 1} ✓</Text></TouchableOpacity>)}
   <View style={s.stateName}><Text style={s.stateNameText}>CALIFORNIA</Text><Text style={s.small}>6 / 6 regions complete</Text>{translated && <Text style={s.small}>۶ از ۶ منطقه تکمیل شد</Text>}</View>
  </View>
  <Text style={s.hint}>Tap a map marker or region below to review.</Text>{translated && <Text style={s.dari}>برای مرور، روی نشان نقشه یا منطقهٔ پایین بزنید.</Text>}
  {adventureRegions.map((r, i) => <TouchableOpacity accessibilityRole="button" key={r.id} onPress={() => onReview(r.id)} style={s.row}><Text style={[s.badge, { backgroundColor: r.color }]}>{i + 1}</Text><View style={{ flex: 1 }}><Text style={s.region}>{r.emoji} {r.name}</Text>{translated && <Text style={s.dari}>{r.dari}</Text>}</View><Text style={s.check}>✓</Text></TouchableOpacity>)}
  <TouchableOpacity accessibilityRole="button" onPress={onExam} style={s.action}><Text style={s.actionText}>Try a mixed permit practice exam →</Text>{translated && <Text style={s.actionDari}>امتحان تمرینی از موضوعات مختلف</Text>}</TouchableOpacity>
  <Text style={s.note}>This celebrates completing the Adventure levels. Keep reviewing the handbook and practicing for the real permit test.</Text>
  {translated && <Text style={s.dari}>این جایزه برای تکمیل سطح‌های ماجراجویی است. برای امتحان اصلی پرمیت، کتاب رهنما را مرور و تمرین را ادامه بدهید.</Text>}
 </View>;
}
const s = StyleSheet.create({
    card: { padding: 18, marginBottom: 16, backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: theme.radius },
    confetti: {
        textAlign: 'center',
        fontSize: 30
    },
    title: { fontSize: 26, lineHeight: 34, color: theme.ink, textAlign: 'center', marginVertical: 10, fontWeight: '800', letterSpacing: -.7 },
    body: {
        fontSize: 14,
        lineHeight: 23,
        color: theme.ink,
        textAlign: 'center'
    },
    dari: {
        fontSize: 14,
        lineHeight: 24,
        color: theme.muted,
        textAlign: 'right',
        writingDirection: 'rtl',
        marginTop: 6
    },
    map: {
        width: '100%',
        aspectRatio: 340 / 450,
        backgroundColor: theme.sage,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 20
    },
    pin: {
        position: 'absolute',
        width: 44,
        height: 36,
        marginLeft: -22,
        marginTop: -18,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    pinText: {
        fontSize: 13,
        fontWeight: '900',
        color: 'white'
    },
    ocean: {
        position: 'absolute',
        top: '59%',
        left: '5%',
        color: theme.muted,
        fontSize: 10,
        lineHeight: 18,
        letterSpacing: 1
    },
    stateName: {
        position: 'absolute',
        top: '5%',
        right: '4%',
        alignItems: 'center'
    },
    stateNameText: {
        fontSize: 12,
        fontWeight: '900',
        color: theme.ink,
        letterSpacing: .5
    },
    small: {
        fontSize: 9,
        color: theme.muted,
        marginTop: 3
    },
    hint: {
        fontSize: 12,
        color: theme.muted,
        textAlign: 'center',
        marginVertical: 12
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 14,
        backgroundColor: theme.soft,
        marginTop: 8
    },
    badge: {
        width: 29,
        height: 29,
        borderRadius: 15,
        textAlign: 'center',
        lineHeight: 29,
        color: 'white',
        fontWeight: '900'
    },
    region: {
        fontSize: 14,
        fontWeight: '800',
        color: theme.ink
    },
    check: {
        fontSize: 23,
        color: theme.success,
        fontWeight: '900'
    },
    action: { padding: 16, backgroundColor: theme.green, marginTop: 20, minHeight: 54, borderRadius: theme.buttonRadius },
    actionText: {
        fontWeight: '900',
        fontSize: 14,
        color: 'white',
        textAlign: 'center'
    },
    actionDari: {
        fontSize: 14,
        color: 'white',
        textAlign: 'right',
        writingDirection: 'rtl',
        marginTop: 6
    },
    note: {
        fontSize: 11,
        lineHeight: 18,
        color: theme.muted,
        marginTop: 15
    }
});
