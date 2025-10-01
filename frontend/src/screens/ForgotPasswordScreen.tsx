import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      Alert.alert('Success', 'A 6-digit OTP code has been sent to your email', [
        {
          text: 'OK',
          onPress: () => (navigation as any).navigate('VerifyOTP', { email }),
        },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to send OTP';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background, padding: 20, justifyContent: 'center' },
    title: { color: (colors as any).primary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
    subtitle: { color: (colors as any).text, fontSize: 16, marginBottom: 20 },
    backButton: { marginBottom: 20 },
    backText: { color: (colors as any).primary, fontSize: 16, fontWeight: '600' },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Enter your email to receive a 6-digit OTP code</Text>

      <ThemedTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email address"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <PrimaryButton title={loading ? 'Sending...' : 'Send OTP'} onPress={handleSendOTP} disabled={loading} />
    </View>
  );
}
