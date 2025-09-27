import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import WarningScreen from '../screens/WarningScreen';
import AccountScreen from '../screens/AccountScreen';
import { colors } from '../theme/colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') {
            return <Ionicons name="speedometer" size={size} color={color} />;
          }
          if (route.name === 'Warning') {
            return <MaterialIcons name="warning-amber" size={size} color={color} />;
          }
          return <Ionicons name="person-circle" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Warning" component={WarningScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
