import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { api } from '../api/client';

export default function SignUpScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    try {
      setLoading(true);
      const res = await api.post('/auth/signup', {
        username,
        displayName,
        email,
        password,
        confirmPassword,
      });
      Alert.alert('Success', 'Sign up successful. You can now sign in.');
      navigation.navigate('Sign In');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Sign up failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Sign up to start your healthcare journey</Text>

      <ThemedTextInput label="Username" value={username} onChangeText={setUsername} placeholder="Username" />
      <ThemedTextInput label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
      <ThemedTextInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
      <ThemedTextInput label="Password" value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry />
      <ThemedTextInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Retype password" secureTextEntry />

      <PrimaryButton title={loading ? 'Signing up...' : 'Sign Up'} onPress={onSignUp} disabled={loading} />

      <View style={{ height: 18 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Sign In')}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 60,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  subtitle: { color: colors.text, marginBottom: 20 },
  link: { color: colors.secondary, fontWeight: '600', textAlign: 'center' },
});
