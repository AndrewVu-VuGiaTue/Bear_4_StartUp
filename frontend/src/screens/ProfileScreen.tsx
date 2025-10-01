import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useTheme, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, updateProfileLocal, token } = useAuth();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const canSavePwd = newPassword.length >= 6 && newPassword === confirmPassword;

  const authHeader = (t?: string | null) => (t ? { Authorization: `Bearer ${t}` } : undefined);

  const onSaveProfile = async () => {
    try {
      let res;
      try {
        res = await api.put('/users/me', { displayName }, { headers: authHeader(token) });
      } catch (e: any) {
        // fallback route
        res = await api.put('/users/profile', { displayName }, { headers: authHeader(token) });
      }
      const user = res?.data?.user;
      if (user?.displayName) updateProfileLocal({ displayName: user.displayName });
      else updateProfileLocal({ displayName });
      Alert.alert('Success', 'Display name updated');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', msg);
    }
  };

  const onChangePassword = async () => {
    if (!canSavePwd) {
      Alert.alert('Error', 'New password must be at least 6 characters and match confirmation.');
      return;
    }
    try {
      try {
        await api.post('/auth/change-password', { currentPassword, newPassword }, { headers: authHeader(token) });
      } catch (err: any) {
        await api.post('/users/change-password', { currentPassword, newPassword }, { headers: authHeader(token) });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to change password';
      Alert.alert('Error', msg);
    }
  };

  const onChangeAvatar = () => {
    Alert.alert('Avatar', 'Image picker not wired yet. Using default avatar icon.');
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    header: { alignItems: 'center', padding: 16, backgroundColor: (colors as any).card, borderBottomWidth: 1, borderBottomColor: (colors as any).border },
    avatarBtn: { alignItems: 'center' },
    changeAvatar: { marginTop: 6, color: (colors as any).primary, fontWeight: '600' },
    card: { backgroundColor: (colors as any).card, marginTop: 16, marginHorizontal: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border },
    cardTitle: { color: (colors as any).text, fontWeight: '800', marginBottom: 10 },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerTop}>
        <TouchableOpacity accessibilityRole="button" onPress={() => nav.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onChangeAvatar} style={styles.avatarBtn}>
            <Ionicons name="person-circle-outline" size={84} color={(colors as any).primary} />
            <Text style={styles.changeAvatar}>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <ThemedTextInput label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
          <PrimaryButton title="Save" onPress={onSaveProfile} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <ThemedTextInput label="Current password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry secureToggle autoCapitalize="none" />
          <ThemedTextInput label="New password" value={newPassword} onChangeText={setNewPassword} placeholder="At least 6 characters" secureTextEntry secureToggle autoCapitalize="none" />
          <ThemedTextInput label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Retype new password" secureTextEntry secureToggle autoCapitalize="none" />
          <PrimaryButton title="Update Password" onPress={onChangePassword} disabled={!canSavePwd} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
