import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const nav = useNavigation<any>();
  const { colors } = useTheme();
  const { notificationsEnabled: enabled, setNotificationsEnabled: setEnabled, healthAlerts, setHealthAlerts, appUpdates, setAppUpdates } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background, padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, backgroundColor: (colors as any).card, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border, marginBottom: 10 },
    label: { color: (colors as any).text, fontSize: 16 },
  }), [colors]);

  const ios = { trackColor: { false: '#cfd8dc', true: (colors as any).primary }, thumbColor: '#fff' };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enable notifications</Text>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={ios.trackColor} thumbColor={ios.thumbColor} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Health alerts</Text>
        <Switch value={healthAlerts} onValueChange={setHealthAlerts} trackColor={ios.trackColor} thumbColor={ios.thumbColor} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>App updates</Text>
        <Switch value={appUpdates} onValueChange={setAppUpdates} trackColor={ios.trackColor} thumbColor={ios.thumbColor} />
      </View>
    </SafeAreaView>
  );
}
