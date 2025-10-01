import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { api } from '../api/client';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp } = (route.params as any) || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      Alert.alert('Success', 'Password has been reset successfully. Please login again.', [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Sign In' as never }] }),
        },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to reset password';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: (colors as any).background, padding: 20, justifyContent: 'center' },
    title: { color: (colors as any).text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
    subtitle: { color: (colors as any).placeholder, fontSize: 16, marginBottom: 32 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>

      <ThemedTextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
        secureToggle
      />

      <ThemedTextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
        secureToggle
      />

      <PrimaryButton title={loading ? 'Resetting...' : 'Reset Password'} onPress={handleResetPassword} disabled={loading} />
    </View>
  );
}
