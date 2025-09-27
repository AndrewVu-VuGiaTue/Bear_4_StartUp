import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { api } from '../api/client';

export default function SignInScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    try {
      setLoading(true);
      const res = await api.post('/auth/signin', { identifier, password });
      Alert.alert('Success', `Welcome, ${res.data.user.displayName}!`);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Sign in failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bear</Text>
      <Text style={styles.subtitle}>Please sign in to continue</Text>

      <ThemedTextInput
        label="Username or email"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="Enter your username or email"
      />

      <ThemedTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
      />

      <PrimaryButton title={loading ? 'Signing in...' : 'Sign In'} onPress={onSignIn} disabled={loading} />

      <View style={{ height: 18 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.text,
    marginBottom: 26,
  },
  link: {
    color: colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
