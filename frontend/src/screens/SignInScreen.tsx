import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen({ navigation }: any) {
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    try {
      setLoading(true);
      const res = await api.post('/auth/signin', { identifier, password });
      const user = res?.data?.user;
      const token = res?.data?.token;
      if (user) auth.setSession({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
      }, token);
      Alert.alert('Success', `Welcome, ${user?.displayName || user?.username}!`);
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
      <Text style={styles.title}>Welcome to BEAR</Text>
      <Text style={styles.subtitle}>Please sign in to continue</Text>

      <ThemedTextInput
        label="Username or email"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="Enter your username or email"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ThemedTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        secureToggle
        textContentType="password"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <PrimaryButton title={loading ? 'Signing in...' : 'Sign In'} onPress={onSignIn} disabled={loading} />

      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotLink}>Forgot your password? Create a new one</Text>
      </TouchableOpacity>

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
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  forgotLink: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});
