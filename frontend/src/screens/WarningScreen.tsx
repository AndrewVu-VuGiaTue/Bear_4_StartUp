import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useHealth, WarningItem } from '../context/HealthContext';
import { Ionicons } from '@expo/vector-icons';

function formatTime(d: Date) {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function WarningScreen() {
  const health = useHealth();
  const { colors } = useTheme();

  // Reset daily (visual): filter only today
  const todayList = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    return health.warnings.filter((w) => {
      const t = w.time;
      return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
    });
  }, [health.warnings]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    content: { padding: 12, paddingBottom: 32 },
    containerCenter: { flex: 1, backgroundColor: (colors as any).background, alignItems: 'center', justifyContent: 'center' },
    pageTitle: { color: (colors as any).text, fontWeight: '800', fontSize: 28, marginBottom: 10, paddingTop: 40 },
    subtitle: { color: (colors as any).text, fontSize: 16, fontWeight: '600', marginBottom: 16 },
    noWarning: { color: (colors as any).text, fontSize: 16, fontWeight: '700' },
    row: { backgroundColor: (colors as any).card, borderRadius: 12, borderColor: (colors as any).border, borderWidth: 1, padding: 12 },
    time: { color: (colors as any).primary, fontWeight: '700', marginBottom: 4 },
    text: { color: (colors as any).text },
  }), [colors]);

  if (todayList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Warning</Text>
          <Text style={styles.subtitle}>Today's warnings:</Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
            <Text style={styles.noWarning}>No warnings today</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Warning</Text>
        <Text style={styles.subtitle}>Today's warnings:</Text>
        <FlatList
          scrollEnabled={false}
        data={todayList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WarningRow item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function WarningRow({ item }: { item: WarningItem }) {
  const { colors } = useTheme();
  
  // Use severity field from WarningItem
  const isCritical = item.severity === 'critical';
  
  const styles = useMemo(() => StyleSheet.create({
    row: {
      backgroundColor: isCritical ? '#FF4C4C' : '#FFA500',
      borderRadius: 12,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: { marginRight: 12 },
    textContainer: { flex: 1 },
    time: { color: isCritical ? '#FFF' : '#000', fontWeight: '700', marginBottom: 4, fontSize: 14 },
    text: { color: isCritical ? '#FFF' : '#000', fontSize: 13 },
  }), [isCritical]);
  
  const labels: string[] = [];
  if (item.fall) labels.push('Fall detected');
  if (typeof item.hrAbnormal === 'number') labels.push(`Abnormal HR: ${item.hrAbnormal} bpm`);
  if (typeof item.spo2Abnormal === 'number') labels.push(`Abnormal SpO2: ${item.spo2Abnormal}%`);

  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isCritical ? 'alert-circle' : 'warning'} 
          size={28} 
          color={isCritical ? '#FFF' : '#000'} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.time}>{formatTime(item.time)}</Text>
        <Text style={styles.text}>{labels.join(' | ')}</Text>
      </View>
    </View>
  );
}
