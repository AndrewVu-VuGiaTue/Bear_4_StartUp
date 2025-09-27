import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../theme/colors';

// A warning item shape. In a real app this would come from your backend or device stream
type WarningItem = {
  id: string;
  time: Date; // when it happened
  fall?: boolean; // fall detected
  hrAbnormal?: number; // abnormal heart rate value
  spo2Abnormal?: number; // abnormal SpO2 value
};

function formatTime(d: Date) {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function WarningScreen() {
  // For now we simulate an empty list. Replace with data from API later.
  const [warnings] = useState<WarningItem[]>([]);

  // Reset daily (visual): filter only today
  const todayList = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    return warnings.filter((w) => {
      const t = w.time;
      return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
    });
  }, [warnings]);

  if (todayList.length === 0) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.noWarning}>No warning</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={todayList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <WarningRow item={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

function WarningRow({ item }: { item: WarningItem }) {
  const labels: string[] = [];
  if (item.fall) labels.push('Fall detected');
  if (typeof item.hrAbnormal === 'number') labels.push(`Abnormal HR: ${item.hrAbnormal}`);
  if (typeof item.spo2Abnormal === 'number') labels.push(`Abnormal SpO2: ${item.spo2Abnormal}%`);

  return (
    <View style={styles.row}>
      <Text style={styles.time}>{formatTime(item.time)}</Text>
      <Text style={styles.text}>{labels.join(' | ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  containerCenter: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  noWarning: { color: colors.text, fontSize: 16, fontWeight: '700' },
  row: { backgroundColor: colors.card, borderRadius: 12, borderColor: colors.border, borderWidth: 1, padding: 12 },
  time: { color: colors.secondary, fontWeight: '700', marginBottom: 4 },
  text: { color: colors.text },
});
