import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { LayoutDashboard, Users, FileText, User, Calendar } from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/context/AuthContext';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { useLanguage } from '../../src/context/LanguageContext';

export default function TeacherLayout() {
  const theme = useTheme();
  const { user, role, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (role !== 'teacher') return <Redirect href="/(student)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          position: 'absolute',
          ...styles.shadow,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint={theme.isDark ? 'dark' : 'light'} />
          ) : null,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: t('classes'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: t('timetable'),
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: t('assignments'),
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden helper screens */}
      <Tabs.Screen
        name="class/[id]"
        options={{ href: null, title: t('classDetails') }}
      />
      <Tabs.Screen
        name="create-assignment"
        options={{ href: null, title: t('createAssignment') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
});
