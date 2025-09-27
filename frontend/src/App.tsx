import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import { StatusBar } from 'expo-status-bar';
import MainTabs from './navigation/MainTabs';
import { HealthProvider } from './context/HealthContext';

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
    <HealthProvider>
      <NavigationContainer theme={PinkTheme}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Sign In" component={SignInScreen} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </HealthProvider>
  );
}
