import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory-native';
import { useHealth } from '../context/HealthContext';

// Helper to generate 24h demo data (e.g., one point per hour)
function generate24h(seriesName: string, base: number, variance: number) {
  const now = new Date();
  const result: { x: Date; y: number }[] = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const v = base + Math.round((Math.random() - 0.5) * variance);
    result.push({ x: d, y: Math.max(0, v) });
  }
  return result;
}

export default function DashboardScreen() {
  const health = useHealth();
  const [battery, setBattery] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        setBattery(Math.round((level || 0) * 100));
      } catch {}
      try {
        const name = Device.deviceName || `${Device.manufacturer || ''} ${Device.modelName || ''}`.trim();
        setDeviceName(name || 'Unknown device');
      } catch {
        setDeviceName('Unknown device');
      }
    })();
  }, []);

  // In real app, replace with live metrics. For now use memoized demo data.
  const demoHR = useMemo(() => generate24h('HR', 80, 20), []);
  const demoSpO2 = useMemo(() => generate24h('SpO2', 97, 4), []);
  const demoSteps = useMemo(() => generate24h('Steps', 120, 80), []);

  // Prefer live history if connected, otherwise demo
  const heart24h = useMemo(() =>
    health.history.length ?
      downsampleToHourly(health.history.map((s) => ({ x: new Date(s.ts), y: s.hr ?? 0 }))) : demoHR,
    [health.history, demoHR]
  );
  const spo224h = useMemo(() =>
    health.history.length ?
      downsampleToHourly(health.history.map((s) => ({ x: new Date(s.ts), y: s.spo2 ?? 0 }))) : demoSpO2,
    [health.history, demoSpO2]
  );
  const steps24h = useMemo(() =>
    health.history.length ?
      downsampleToHourly(health.history.map((s) => ({ x: new Date(s.ts), y: s.steps ?? 0 }))) : demoSteps,
    [health.history, demoSteps]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerBox}>
        <Text style={styles.greeting}>Hello, how are you today ?</Text>
      </View>

      <Text style={styles.sectionTitle}>Health Metrics</Text>
      <View style={styles.metricsRow}>
        <MetricCard title="Heart rate" value={`${liveOrAvg(health.latest?.hr, heart24h)} bpm`} />
        <MetricCard title="SpO2" value={`${liveOrAvg(health.latest?.spo2, spo224h)} %`} />
        <MetricCard title="Steps/min" value={`${liveOrAvg(health.latest?.steps, steps24h)}`} />
      </View>

      <View style={styles.connectRow}>
        {health.connected ? (
          <TouchableOpacity style={styles.connectBtn} onPress={health.disconnect}>
            <Text style={styles.connectText}>Disconnect ({health.deviceName || 'device'})</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.connectBtn} onPress={() => health.connect({ namePrefix: 'ESP32_HealthBand' })}>
            <Text style={styles.connectText}>Connect to ESP32</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Health Summary</Text>
      <ChartBlock title="Heart Rate" data={heart24h} color={colors.primary} />
      <ChartBlock title="SpO2" data={spo224h} color="#2db34d" />
      <ChartBlock title="Steps" data={steps24h} color="#2d6db3" />

      <Text style={styles.sectionTitle}>Device Information</Text>
      <View style={styles.deviceBox}>
        <Text style={styles.deviceText}>Battery: {battery === null ? '—' : `${battery}%`}</Text>
        <Text style={styles.deviceText}>Device: {deviceName || '—'}</Text>
      </View>
    </ScrollView>
  );
}

function avgLastMin(data: { x: Date; y: number }[]) {
  if (!data.length) return 0;
  // Demo: approximate last minute by last point average
  const n = Math.max(1, Math.min(5, data.length));
  const slice = data.slice(-n);
  const sum = slice.reduce((s, p) => s + p.y, 0);
  return Math.round(sum / slice.length);
}

function liveOrAvg(live: number | undefined, data: { x: Date; y: number }[]) {
  if (typeof live === 'number' && live > 0) return Math.round(live);
  return avgLastMin(data);
}

function downsampleToHourly(points: { x: Date; y: number }[]) {
  if (!points.length) return points;
  // Take last 24h, group by hour, average
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;
  const within = points.filter((p) => p.x.getTime() >= cutoff);
  const buckets: Record<string, { sum: number; count: number; date: Date }> = {};
  within.forEach((p) => {
    const key = `${p.x.getFullYear()}-${p.x.getMonth()}-${p.x.getDate()}-${p.x.getHours()}`;
    if (!buckets[key]) buckets[key] = { sum: 0, count: 0, date: new Date(p.x.getFullYear(), p.x.getMonth(), p.x.getDate(), p.x.getHours()) };
    buckets[key].sum += p.y;
    buckets[key].count += 1;
  });
  const arr = Object.values(buckets).map((b) => ({ x: b.date, y: Math.round(b.sum / Math.max(1, b.count)) }));
  arr.sort((a, b) => a.x.getTime() - b.x.getTime());
  return arr;
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ChartBlock({ title, data, color }: { title: string; data: { x: Date; y: number }[]; color: string }) {
  return (
    <View style={styles.chartBox}>
      <Text style={styles.chartTitle}>{title}</Text>
      <VictoryChart theme={VictoryTheme.material}>
        <VictoryAxis tickFormat={(t) => new Date(t).getHours()} style={{ tickLabels: { fontSize: 10, fill: colors.text } }} />
        <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10, fill: colors.text } }} />
        <VictoryLine data={data} x="x" y="y" style={{ data: { stroke: color, strokeWidth: 2 } }} />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBox: {
    backgroundColor: '#ffd1e0',
    padding: 18,
    paddingTop: 28,
  },
  greeting: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sectionTitle: { marginTop: 16, marginBottom: 8, paddingHorizontal: 16, color: colors.text, fontWeight: '800', fontSize: 16 },
  metricsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  connectRow: { paddingHorizontal: 16, marginTop: 10, marginBottom: 6 },
  connectBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  connectText: { color: colors.white, fontWeight: '700' },
  metricCard: { flex: 1, backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  metricTitle: { color: colors.text, fontSize: 12 },
  metricValue: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 4 },
  chartBox: { backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 8 },
  chartTitle: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  deviceBox: { backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 24, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  deviceText: { color: colors.text, marginBottom: 4 },
});
