import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function EmergencyContactScreen() {
  const nav: any = useNavigation();
  const { colors } = useTheme();
  const { user, token, updateProfileLocal } = useAuth();
  const [email, setEmail] = useState(user?.emergencyEmail || '');

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
    back: { marginRight: 8, padding: 6 },
    title: { color: (colors as any).text, fontWeight: '800', fontSize: 28 },
    card: { backgroundColor: (colors as any).card, marginTop: 16, marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: (colors as any).border },
    note: { color: (colors as any).placeholder, fontSize: 13, marginBottom: 12 },
  }), [colors]);

  const save = async () => {
    try {
      const res = await api.put('/auth/emergency-contact', { email }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (res?.data?.user?.emergencyEmail || email) updateProfileLocal({ emergencyEmail: email });
      Alert.alert('Success', 'Emergency contact saved');
      nav.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to save emergency contact';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.back} accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={(colors as any).text} />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contact</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.note}>
          Enter a family member's email. When a Critical alert occurs, BEAR will automatically send an email notification to this address.
        </Text>
        <ThemedTextInput label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
        <PrimaryButton title="Save" onPress={save} />
      </View>
    </SafeAreaView>
  );
}
