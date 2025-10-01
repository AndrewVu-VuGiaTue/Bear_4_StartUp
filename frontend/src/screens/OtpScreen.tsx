import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OtpScreen({ route, navigation }: any) {
  const { email, userId } = route.params || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const onVerify = async () => {
    try {
      setLoading(true);
      await api.post('/auth/verify-otp', { email, userId, code });
      Alert.alert('Success', 'Your account is verified!');
      navigation.reset({ index: 0, routes: [{ name: 'Sign In' }] });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Verification failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background, padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: '800', color: (colors as any).primary, marginBottom: 6 },
    subtitle: { color: (colors as any).text, marginBottom: 20 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {email || 'your email'}</Text>

      <ThemedTextInput label="6-digit code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="numeric" />

      <PrimaryButton title={loading ? 'Verifying...' : 'Verify'} onPress={onVerify} disabled={loading || code.length !== 6} />
    </SafeAreaView>
  );
}
