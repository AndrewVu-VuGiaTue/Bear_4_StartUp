import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { api } from '../api/client';

export default function OtpScreen({ route, navigation }: any) {
  const { email, userId } = route.params || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {email || 'your email'}</Text>

      <ThemedTextInput label="6-digit code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="numeric" />

      <PrimaryButton title={loading ? 'Verifying...' : 'Verify'} onPress={onVerify} disabled={loading || code.length !== 6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  subtitle: { color: colors.text, marginBottom: 20 },
});
