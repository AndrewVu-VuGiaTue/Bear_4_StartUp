import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const nav: any = useNavigation();
  const { colors } = useTheme();
  const { user, clear } = useAuth();
  const displayName = user?.displayName || user?.username || 'Guest';
  const username = user?.username ? `@${user.username}` : '@guest';

  const onSignOut = () => {
    Alert.alert('Sign Out', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: () => {
          clear();
          nav.reset({ index: 0, routes: [{ name: 'Sign In' }] });
        }
      }
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    content: { padding: 12, paddingBottom: 32 },
    pageTitle: { color: (colors as any).text, fontWeight: '800', fontSize: 28, marginBottom: 10 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: (colors as any).card, borderWidth: 1, borderColor: (colors as any).border, borderRadius: 12 },
    avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: (colors as any).primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
    name: { color: (colors as any).text, fontSize: 18, fontWeight: '800' },
    subtitle: { color: (colors as any).placeholder },
    section: { marginTop: 16, backgroundColor: (colors as any).card, borderWidth: 1, borderColor: (colors as any).border, borderRadius: 12, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: (colors as any).border },
    rowText: { color: (colors as any).text, fontSize: 16, fontWeight: '600' },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Settings</Text>

        <View style={styles.header}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarCircle} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.subtitle}>{username}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SettingRow icon="person" label="Profile" onPress={() => nav.navigate('Profile')} colors={colors} rowStyle={styles.row} rowTextStyle={styles.rowText} />
        </View>

        <View style={styles.section}>
          <SettingRow icon="notifications" label="Notifications" onPress={() => nav.navigate('Notifications')} colors={colors} rowStyle={styles.row} rowTextStyle={styles.rowText} />
          <SettingRow icon="lock-closed" label="Privacy" onPress={() => nav.navigate('Privacy')} colors={colors} rowStyle={styles.row} rowTextStyle={styles.rowText} />
          <SettingRow icon="color-palette" label="Appearance" onPress={() => nav.navigate('Appearance')} colors={colors} rowStyle={styles.row} rowTextStyle={styles.rowText} />
        </View>

        <View style={styles.section}>
          <SettingRow icon="help-circle" label="Help & Support" onPress={() => nav.navigate('HelpSupport')} colors={colors} rowStyle={styles.row} rowTextStyle={styles.rowText} />
        </View>

        <View style={styles.section}>
          <SettingRow icon="log-out" label="Sign Out" onPress={onSignOut} danger colors={colors} rowStyle={styles.row} rowTextStyle={styles.rowText} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, onPress, danger, colors, rowStyle, rowTextStyle }: { icon: any; label: string; onPress?: () => void; danger?: boolean; colors: any; rowStyle: any; rowTextStyle: any }) {
  return (
    <TouchableOpacity style={rowStyle} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? '#e11d48' : (colors as any).primary} style={{ width: 28 }} />
      <Text style={[rowTextStyle, danger && { color: '#e11d48' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={(colors as any).primary} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}
