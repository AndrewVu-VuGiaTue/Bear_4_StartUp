import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import { StatusBar } from 'expo-status-bar';
import MainTabs from './navigation/MainTabs';
import { HealthProvider } from './context/HealthContext';
import { AuthProvider } from './context/AuthContext';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import AppearanceScreen from './screens/AppearanceScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import DeviceSelectionScreen from './screens/DeviceSelectionScreen';
import EmergencyContactScreen from './screens/EmergencyContactScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyOTPScreen from './screens/VerifyOTPScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import SignUpOTPScreen from './screens/SignUpOTPScreen';
import { SettingsProvider, useSettings, themeFromAppearance } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';

const Stack = createNativeStackNavigator();

function AppShell() {
  const { appearance } = useSettings();
  const themed = themeFromAppearance(appearance);
  return (
    <NavigationContainer theme={themed}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Sign In" component={SignInScreen} />
            <Stack.Screen name="Sign Up" component={SignUpScreen} />
            <Stack.Screen name="SignUpOTP" component={SignUpOTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Appearance" component={AppearanceScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="DeviceSelection" component={DeviceSelectionScreen} />
          </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <HealthProvider>
            <AppShell />
          </HealthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
