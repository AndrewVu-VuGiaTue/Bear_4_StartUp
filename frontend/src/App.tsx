import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import OtpScreen from './screens/OtpScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

const PinkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff8fb',
    primary: '#ff7aa2',
    card: '#ffe6ee',
    text: '#333333',
    border: '#ffd1e0',
    notification: '#ff9bbd',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={PinkTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen name="Sign In" component={SignInScreen} />
        <Stack.Screen name="Sign Up" component={SignUpScreen} />
        <Stack.Screen name="Enter OTP" component={OtpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
