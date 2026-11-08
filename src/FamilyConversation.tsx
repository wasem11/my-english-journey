import { theme } from './theme';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { JourneyUnit } from './journeyContent';
export default function FamilyConversation({ unit, translated, onSpeak }: {
    unit: JourneyUnit;
    translated: boolean;
    onSpeak: (text: string) => void;
}) {
    if (!unit.dialogue)
        return null;
    return <View style={s.card}><Text style={s.title}>Try a short conversation</Text>{translated && <Text style={s.dari}>یک گفت‌وگوی کوتاه را تمرین کنید</Text>}<Text style={s.note}>Example replies for practice. Try your line, then imagine the other person’s reply.</Text>{unit.dialogue.map((line, i) => <View key={i} style={[s.line, i === 0 && { backgroundColor: theme.sage }]}><Text style={s.speaker}>{line.speaker === 'You' ? 'YOU' : 'OTHER PERSON'}</Text>{translated && <Text style={s.dari}>{line.speaker === 'You' ? 'شما' : 'شخص دیگر'}</Text>}<Text style={s.english}>{line.en}</Text>{translated && <Text style={s.dari}>{line.dari}</Text>}<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Listen: ${line.en}`} onPress={() => onSpeak(line.en)} style={s.listen}><Text style={s.listenText}>▶ Listen to this line</Text></TouchableOpacity></View>)}</View>;
}
const s = StyleSheet.create({
    card: { backgroundColor: theme.surface, marginTop: 15, borderWidth: 1, borderColor: theme.line, padding: 20, borderRadius: theme.radius },
    title: { color: theme.ink, fontSize: 21, lineHeight: 28, fontWeight: '800', letterSpacing: -.4 },
    note: {
        fontSize: 12,
        lineHeight: 20,
        color: theme.muted,
        marginTop: 8
    },
    line: { backgroundColor: theme.sage, marginTop: 12, borderRadius: 18, padding: 16 },
    speaker: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        color: theme.green
    },
    english: {
        fontSize: 17,
        lineHeight: 26,
        color: theme.ink,
        marginTop: 7,
        fontWeight: '700'
    },
    dari: {
        fontSize: 15,
        lineHeight: 25,
        textAlign: 'right',
        writingDirection: 'rtl',
        color: theme.muted,
        marginTop: 6
    },
    listen: { minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.sage, marginTop: 11, borderRadius: theme.buttonRadius },
    listenText: {
        color: theme.green,
        fontWeight: '800',
        fontSize: 13
    }
});
