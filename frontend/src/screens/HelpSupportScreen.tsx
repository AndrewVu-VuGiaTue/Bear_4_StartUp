import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const email = 'buddyforemergencyaandr@gmail.com';
  const phone = '+84 914654745';
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    body: { padding: 16 },
    hint: { color: (colors as any).text, marginBottom: 12 },
    row: { backgroundColor: (colors as any).card, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border, padding: 14, marginBottom: 10 },
    label: { color: (colors as any).placeholder, marginBottom: 4 },
    value: { color: (colors as any).text, fontWeight: '600' },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.hint}>For feedback, questions, or support, please contact:</Text>

        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)} style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{phone}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
