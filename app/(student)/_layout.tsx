import React from 'react';
import { Tabs } from 'expo-router';
import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import {
  Home,
  BookOpen,
  CalendarCheck,
  BarChart3,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';

export default function StudentLayout() {
  const theme = useTheme();
  const { user, role, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (role !== 'student') return <Redirect href="/(parent)" />;

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
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: t('classes'),
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: t('attendance'),
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="performance"
        options={{
          title: t('performance'),
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('hub'),
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report-card"
        options={{
          href: null,
          title: t('reportCard'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('calendar'),
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          href: null,
          title: t('achievements'),
        }}
      />
      <Tabs.Screen
        name="class/[id]"
        options={{
          href: null,
          title: t('classDetails'),
        }}
      />
    </Tabs>
  );
}
