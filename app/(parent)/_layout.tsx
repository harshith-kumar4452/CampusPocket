import React from 'react';
import { Tabs } from 'expo-router';
import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import {
  Home,
  Calendar,
  CalendarCheck,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/context/AuthContext';

export default function ParentLayout() {
  const theme = useTheme();
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (role !== 'parent') return <Redirect href="/(student)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabBar.active,
        tabBarInactiveTintColor: theme.tabBar.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_600SemiBold',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: theme.tabBar.background,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
        }}
      />
      {/* Hidden from tab bar */}
      <Tabs.Screen
        name="child-dashboard"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="performance"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="report-card"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="achievements"
        options={{ href: null }}
      />
    </Tabs>
  );
}
