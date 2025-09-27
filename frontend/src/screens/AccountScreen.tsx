import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/120' }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>Your name</Text>
          <Text style={styles.subtitle}>@username</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SettingRow icon="person" label="Profile" />
        <SettingRow icon="notifications" label="Notifications" />
        <SettingRow icon="lock-closed" label="Privacy" />
        <SettingRow icon="color-palette" label="Appearance" />
        <SettingRow icon="help-circle" label="Help & Support" />
        <SettingRow icon="log-out" label="Sign Out" />
      </View>
    </ScrollView>
  );
}

function SettingRow({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ width: 28 }} />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.placeholder} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.primary },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' },
  subtitle: { color: colors.placeholder },
  section: { marginTop: 16, backgroundColor: colors.card, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
