import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from "victory-native";
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { useHealth } from '../context/HealthContext';

// ---- Chart helpers ----
type HistoryItem = { ts: number | string; hr?: number; spo2?: number; steps?: number };

const X_TICKS_HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24];
const formatHour = (h: number) => `${h}h`;

export default function DashboardScreen() {
  const health = useHealth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [battery, setBattery] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  // Load Raleway Thin font
  const [fontsLoaded] = useFonts({
    'Raleway-Thin': 'https://fonts.gstatic.com/s/raleway/v28/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrE.ttf',
  });

  const chartProps = useMemo(() => {
    const theme = (VictoryTheme as any)?.material;
    return theme ? { theme } : {};
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        setBattery(Math.round((level || 0) * 100));
      } catch (e) {
        // Battery error
      }
      try {
        const name = Device.deviceName || `${Device.manufacturer || ''} ${Device.modelName || ''}`.trim();
        setDeviceName(name || 'Unknown device');
      } catch (e) {
        setDeviceName('Unknown device');
      }
    })();
  }, []);


  // Midnight reset watcher
  const [dayAnchor, setDayAnchor] = useState<number>(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date(); d.setHours(0,0,0,0);
      const start = d.getTime();
      if (start !== dayAnchor) {
        setDayAnchor(start);
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [dayAnchor]);

  // Series
  const hrSeries = useMemo(() => {
    return aggregatePerMinuteSeries((health.history as any) || [], 'hr');
  }, [health.history, dayAnchor]);

  const spo2Series = useMemo(() => {
    return aggregatePerMinuteSeries((health.history as any) || [], 'spo2');
  }, [health.history, dayAnchor]);

  const stepsSeries = useMemo(() => {
    const arr = aggregatePerMinuteStepsFromCumulative((health.history as any) || []);
    return arr.map((v, i) => ({ x: i / 60, y: v }));
  }, [health.history, dayAnchor]);

  // Styles
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    content: { padding: 12, paddingBottom: 32 },
    headerBox: { backgroundColor: (colors as any).card, padding: 18, paddingTop: 28, borderBottomWidth: 1, borderBottomColor: (colors as any).border },
    pageTitle: { color: (colors as any).text, fontWeight: '800', fontSize: 28, marginBottom: 10 },
    greeting: { color: (colors as any).text, fontSize: 18, fontFamily: fontsLoaded ? 'Raleway-Thin' : undefined, fontWeight: fontsLoaded ? '100' : '300' },
    measuredText: { color: (colors as any).placeholder, fontSize: 13, fontWeight: '300', fontStyle: 'italic', paddingHorizontal: 16, marginTop: 4 },
    sectionTitle: { marginTop: 16, marginBottom: 8, paddingHorizontal: 16, color: (colors as any).text, fontWeight: '800', fontSize: 16 },
    metricsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
    connectRow: { paddingHorizontal: 16, marginTop: 10, marginBottom: 6 },
    connectBtn: { backgroundColor: (colors as any).primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    connectText: { color: (colors as any).white, fontWeight: '700' },
    metricCard: { flex: 1, backgroundColor: (colors as any).card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border },
    metricTitle: { color: (colors as any).text, fontSize: 12 },
    metricValue: { color: (colors as any).text, fontSize: 16, fontWeight: '800', marginTop: 4 },
    chartBox: { backgroundColor: (colors as any).card, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border, padding: 8 },
    chartWrapper: { alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    chartTitle: { color: (colors as any).text, fontWeight: '700', marginBottom: 6 },
    deviceBox: { backgroundColor: (colors as any).card, marginHorizontal: 16, marginBottom: 24, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border },
    deviceText: { color: (colors as any).text, marginBottom: 4 },
    noDeviceText: { color: (colors as any).placeholder, fontStyle: 'italic' },
    placeholder: { color: (colors as any).placeholder, paddingHorizontal: 16 },
  }), [colors, fontsLoaded]);

  // Metric helpers - show latest value or average of last minute
  const hrValue = useMemo(() => {
    // Try latest value first
    if (typeof health.latest?.hr === 'number') {
      return Math.round(health.latest.hr);
    }
    // Fallback to average of last minute
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const samples = (health.history as any[]).filter((item: any) => {
      const t = typeof item.ts === 'number' ? item.ts : new Date(item.ts).getTime();
      return t >= oneMinuteAgo && typeof item.hr === 'number';
    });
    if (!samples.length) return 0;
    const sum = samples.reduce((s: number, item: any) => s + Number(item.hr), 0);
    return Math.round(sum / samples.length);
  }, [health.latest, health.history]);
  
  const spo2Value = useMemo(() => {
    // Try latest value first
    if (typeof health.latest?.spo2 === 'number') {
      return Math.round(health.latest.spo2);
    }
    // Fallback to average of last minute
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const samples = (health.history as any[]).filter((item: any) => {
      const t = typeof item.ts === 'number' ? item.ts : new Date(item.ts).getTime();
      return t >= oneMinuteAgo && typeof item.spo2 === 'number';
    });
    if (!samples.length) return 0;
    const sum = samples.reduce((s: number, item: any) => s + Number(item.spo2), 0);
    return Math.round(sum / samples.length);
  }, [health.latest, health.history]);
  
  const stepsValue = useMemo(() => {
    // Try latest value first
    if (typeof health.latest?.steps === 'number') {
      return Math.round(health.latest.steps);
    }
    // Fallback to max of last minute
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const samples = (health.history as any[]).filter((item: any) => {
      const t = typeof item.ts === 'number' ? item.ts : new Date(item.ts).getTime();
      return t >= oneMinuteAgo && typeof item.steps === 'number';
    });
    if (!samples.length) return 0;
    const steps = samples.map((item: any) => Number(item.steps));
    return Math.max(...steps);
  }, [health.latest, health.history]);

  const MetricCard = ({ title, value }: { title: string; value: string }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  // Component render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.greeting}>"Hello, how are you today ?"</Text>

        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.metricsRow}>
          <MetricCard title="Heart rate" value={`${hrValue} bpm`} />
          <MetricCard title="SpO2" value={`${spo2Value} %`} />
          <MetricCard title="Steps/min" value={`${stepsValue}`} />
        </View>
        <Text style={styles.measuredText}>(Measured just a minute ago)</Text>
        <View style={styles.connectRow}>
          {health.connected ? (
            <TouchableOpacity style={styles.connectBtn} onPress={health.disconnect}>
              <Text style={styles.connectText}>Disconnect ({health.deviceName || 'device'})</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.connectBtn} onPress={() => (navigation as any).navigate('DeviceSelection')}>
              <Text style={styles.connectText}>Connect to ESP32</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Health Summary</Text>

        <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Heart Rate (avg per minute)</Text>
        <View style={styles.chartWrapper}>
          <VictoryChart {...chartProps} width={Dimensions.get('window').width * 0.9} domain={{ x: [0, 24], y: [0, 200] }}>
          <VictoryAxis
            tickValues={X_TICKS_HOURS}
            tickFormat={(h) => formatHour(h as number)}
            style={{ axis: { stroke: (colors as any).border }, tickLabels: { fill: (colors as any).text, fontSize: 10 }, grid: { stroke: (colors as any).border, strokeDasharray: '4,4' } }}
          />
          <VictoryAxis
            dependentAxis
            tickValues={[0, 50, 100, 150, 200]}
            style={{ axis: { stroke: (colors as any).border }, tickLabels: { fill: (colors as any).text, fontSize: 10 }, grid: { stroke: (colors as any).border, strokeDasharray: '4,4' } }}
          />
          <VictoryLine
            data={(hrSeries && hrSeries.length ? hrSeries : [{ x: 0, y: 0 }]) as any}
            interpolation="monotoneX"
            style={{ data: { stroke: (colors as any).primary, strokeWidth: 2 } }}
          />
        </VictoryChart>
        </View>
        </View>

        <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>SpO2 (avg per minute)</Text>
        <View style={styles.chartWrapper}>
          <VictoryChart {...chartProps} width={Dimensions.get('window').width * 0.9} domain={{ x: [0, 24], y: [0, 100] }}>
          <VictoryAxis
            tickValues={X_TICKS_HOURS}
            tickFormat={(h) => formatHour(h as number)}
            style={{ axis: { stroke: (colors as any).border }, tickLabels: { fill: (colors as any).text, fontSize: 10 }, grid: { stroke: (colors as any).border, strokeDasharray: '4,4' } }}
          />
          <VictoryAxis
            dependentAxis
            tickValues={[0, 20, 40, 60, 80, 100]}
            style={{ axis: { stroke: (colors as any).border }, tickLabels: { fill: (colors as any).text, fontSize: 10 }, grid: { stroke: (colors as any).border, strokeDasharray: '4,4' } }}
          />
          <VictoryLine
            data={(spo2Series && spo2Series.length ? spo2Series : [{ x: 0, y: 0 }]) as any}
            interpolation="monotoneX"
            style={{ data: { stroke: (colors as any).primary, strokeWidth: 2 } }}
          />
        </VictoryChart>
        </View>
        </View>

        <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Steps (total per minute)</Text>
        <View style={styles.chartWrapper}>
          <VictoryChart {...chartProps} width={Dimensions.get('window').width * 0.9} domain={{ x: [0, 24], y: [0, 30000] }}>
          <VictoryAxis
            tickValues={X_TICKS_HOURS}
            tickFormat={(h) => formatHour(h as number)}
            style={{ axis: { stroke: (colors as any).border }, tickLabels: { fill: (colors as any).text, fontSize: 10 }, grid: { stroke: (colors as any).border, strokeDasharray: '4,4' } }}
          />
          <VictoryAxis
            dependentAxis
            tickValues={[0, 5000, 10000, 15000, 20000, 25000, 30000]}
            style={{ axis: { stroke: (colors as any).border }, tickLabels: { fill: (colors as any).text, fontSize: 10 }, grid: { stroke: (colors as any).border, strokeDasharray: '4,4' } }}
          />
          <VictoryLine
            data={(stepsSeries && stepsSeries.length ? stepsSeries : [{ x: 0, y: 0 }]) as any}
            interpolation="monotoneX"
            style={{ data: { stroke: (colors as any).primary, strokeWidth: 2 } }}
          />
        </VictoryChart>
        </View>
        </View>

        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.deviceBox}>
          {health.connected ? (
            <>
              <Text style={styles.deviceText}>Device: {health.deviceName || 'ESP32 HealthBand'}</Text>
              <Text style={styles.deviceText}>Battery: {typeof health.battery === 'number' ? `${health.battery}%` : '—'}</Text>
            </>
          ) : (
            <Text style={styles.noDeviceText}>No device connected yet. Please pair a device to get started.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ========== Helpers ==========

function aggregatePerMinuteSeries(history: HistoryItem[], key: 'hr' | 'spo2') {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const dayStart = start.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const sums = new Array(1440).fill(0);
  const counts = new Array(1440).fill(0);

  history?.forEach((item, idx) => {
    const t = typeof item.ts === 'number' ? item.ts : new Date(item.ts).getTime();
    if (t >= dayStart && t < dayEnd) {
      const d = new Date(t);
      const idxMin = d.getHours() * 60 + d.getMinutes();
      const v = Number((item as any)[key]);
      if (!isNaN(v)) {
        sums[idxMin] += v;
        counts[idxMin] += 1;
      }
    }
  });

  const series: { x: number; y: number }[] = [];
  for (let i = 0; i < 1440; i++) {
    if (counts[i]) series.push({ x: i / 60, y: Math.round(sums[i] / counts[i]) });
  }
  return series;
}

function aggregatePerMinuteStepsFromCumulative(history: HistoryItem[]) {
  const start = new Date(); start.setHours(0,0,0,0);
  const dayStart = start.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const mins = new Array(1440).fill(Number.POSITIVE_INFINITY);
  const maxs = new Array(1440).fill(Number.NEGATIVE_INFINITY);
  const seen = new Array(1440).fill(false);
  history?.forEach((item) => {
    const t = typeof item.ts === 'number' ? item.ts : new Date(item.ts).getTime();
    if (t >= dayStart && t < dayEnd) {
      const d = new Date(t);
      const idx = d.getHours() * 60 + d.getMinutes();
      const v = Number(item.steps);
      if (!isNaN(v)) {
        seen[idx] = true;
        mins[idx] = Math.min(mins[idx], v);
        maxs[idx] = Math.max(maxs[idx], v);
      }
    }
  });
  const out = new Array(1440).fill(0);
  for (let i = 0; i < 1440; i++) {
    if (seen[i]) out[i] = Math.max(0, maxs[i] - (mins[i] === Number.POSITIVE_INFINITY ? maxs[i] : mins[i]));
  }
  return out;
}
