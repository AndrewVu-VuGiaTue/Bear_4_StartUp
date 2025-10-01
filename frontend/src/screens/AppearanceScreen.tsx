import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useNavigation } from '@react-navigation/native';

const OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'softpink', label: 'Soft Pink' },
  { key: 'teal', label: 'Teal' },
  { key: 'turquoise', label: 'Turquoise' },
  { key: 'matcha', label: 'Matcha' },
  { key: 'sunshine', label: 'Sunshine' },
  { key: 'peach', label: 'Peach' },
  { key: 'lilac', label: 'Lilac' },
  { key: 'pearl', label: 'Pearl' },
  { key: 'pebble', label: 'Pebble' },
  { key: 'darkorange', label: 'Dark Orange' },
  { key: 'cocoa', label: 'Cocoa' },
  { key: 'chestnut', label: 'Chestnut' },
  { key: 'caramel', label: 'Caramel' },
  { key: 'latte', label: 'Latte' },
];

export default function AppearanceScreen() {
  const { appearance: selected, setAppearance } = useSettings();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const colorFor = (key: string) => {
    switch (key) {
      case 'default': return '#B31B1B';
      case 'softpink': return '#ff7aa2';
      case 'teal': return '#6ED1E3';
      case 'turquoise': return '#88E0C9';
      case 'matcha': return '#C7E1B2';
      case 'sunshine': return '#FFD580';
      case 'peach': return '#F9B4B4';
      case 'lilac': return '#C9B7F9';
      case 'pearl': return '#ECECEC';
      case 'pebble': return '#9AA0A6';
      case 'darkorange': return '#FF8C42';
      case 'cocoa': return '#7B3F00';
      case 'chestnut': return '#954535';
      case 'caramel': return '#AF6E4D';
      case 'latte': return '#A67B5B';
      default: return (colors as any).primary;
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    item: { width: '32%' },
    previewBox: { width: '100%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', position: 'relative' },
    check: { position: 'absolute', right: 6, top: 6 },
    cardLabel: { color: (colors as any).text, fontSize: 12, fontWeight: '600' },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Appearance</Text>
      </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        data={OPTIONS}
        keyExtractor={(it) => it.key}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 14 }}
        renderItem={({ item }) => {
          const primary = colorFor(item.key);
          const active = selected === item.key;
          return (
            <TouchableOpacity style={styles.item} onPress={() => setAppearance(item.key)}>
              <View style={[styles.previewBox, { backgroundColor: primary }]}> 
                {active ? (
                  <Ionicons name="checkmark-circle" size={18} color={'#ffffff'} style={styles.check} />
                ) : null}
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

