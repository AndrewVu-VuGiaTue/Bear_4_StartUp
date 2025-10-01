import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';

export default function SignUpOTPScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = (route.params as any) || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-signup-otp', { email, otp });
      Alert.alert('Success', 'Email verified successfully! You can now sign in.', [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Sign In' as never }] }),
        },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Invalid or expired OTP';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/auth/resend-signup-otp', { email });
      Alert.alert('Success', 'OTP has been resent to your email');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to resend OTP';
      Alert.alert('Error', msg);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background, padding: 20, justifyContent: 'center' },
    title: { color: (colors as any).primary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
    subtitle: { color: (colors as any).text, fontSize: 16, marginBottom: 20 },
    resendContainer: { marginTop: 20, alignItems: 'center' },
    resendText: { color: (colors as any).placeholder, fontSize: 14 },
    resendButton: { color: (colors as any).primary, fontSize: 14, fontWeight: '600', marginTop: 8 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to{'\n'}
        {email}
      </Text>

      <ThemedTextInput
        label="OTP Code"
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
      />

      <PrimaryButton title={loading ? 'Verifying...' : 'Verify OTP'} onPress={handleVerifyOTP} disabled={loading} />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity onPress={handleResendOTP}>
          <Text style={styles.resendButton}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
