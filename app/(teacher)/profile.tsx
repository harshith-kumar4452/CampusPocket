import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Button } from '../../src/components/ui/Button';
import { useThemeContext } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { 
  Languages, Mail, BookOpen, Users, GraduationCap, 
  Moon, Sun, LogOut, ChevronRight 
} from 'lucide-react-native';

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#6366F1',
  'Math': '#6366F1',
  'Science': '#10B981',
  'English': '#F59E0B',
  'Hindi': '#EC4899',
  'Social Science': '#8B5CF6',
  'Advanced Physics': '#0EA5E9',
};

export default function TeacherProfile() {
  const { signOut, user } = useAuth();
  const theme = useTheme();
  const { toggleTheme, isDark } = useThemeContext();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [classCount, setClassCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);

      // Get class count
      const { count: cc } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);
      setClassCount(cc || 0);

      // Get total student count across all classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id);
      if (classes) {
        let total = 0;
        for (const cls of classes) {
          const { count } = await supabase
            .from('student_classes')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          total += count || 0;
        }
        setStudentCount(total);
      }
    };
    fetchProfile();
  }, [user]);

  const subjectColor = profile?.subject ? (SUBJECT_COLORS[profile.subject] || theme.primary) : theme.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[Typography.title, { color: theme.text, marginBottom: 24 }]}>{t('profile')}</Text>
        
        {/* Profile Header Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatarLarge, { backgroundColor: subjectColor + '20' }]}>
            <Text style={{ color: subjectColor, fontSize: 32, fontWeight: '700' }}>
              {profile?.full_name?.charAt(0) || 'T'}
            </Text>
          </View>
          <Text style={[Typography.title, { color: theme.text, marginTop: 12 }]}>
            {profile?.full_name || 'Teacher'}
          </Text>
          {profile?.subject && (
            <View style={[styles.subjectBadge, { backgroundColor: subjectColor + '15' }]}>
              <BookOpen size={14} color={subjectColor} />
              <Text style={[Typography.bodySemiBold, { color: subjectColor, marginLeft: 6, fontSize: 13 }]}>
                {profile.subject} Teacher
              </Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[Typography.title, { color: theme.text, fontSize: 20 }]}>{classCount}</Text>
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('classes')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <Text style={[Typography.title, { color: theme.text, fontSize: 20 }]}>{studentCount}</Text>
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('students')}</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <Mail size={18} color={theme.textMuted} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('email')}</Text>
              <Text style={[Typography.body, { color: theme.text }]}>{user?.email}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
          <View style={styles.infoRow}>
            <BookOpen size={18} color={theme.textMuted} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Subject</Text>
              <Text style={[Typography.body, { color: theme.text }]}>{profile?.subject || 'Not assigned'}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
          <View style={styles.infoRow}>
            <GraduationCap size={18} color={theme.textMuted} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Role</Text>
              <Text style={[Typography.body, { color: theme.text }]}>Teacher</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Pressable onPress={toggleTheme} style={styles.settingRow}>
            {isDark ? <Moon size={18} color={theme.textMuted} /> : <Sun size={18} color={theme.textMuted} />}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[Typography.body, { color: theme.text }]}>{t('theme')}</Text>
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>
                {isDark ? t('dark') : t('light')}
              </Text>
            </View>
            <Text style={[Typography.bodySemiBold, { color: theme.primary, fontSize: 13 }]}>
              {isDark ? t('switchToLight') : t('switchToDark')}
            </Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.settingRow}>
            <Languages size={18} color={theme.textMuted} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[Typography.body, { color: theme.text }]}>{t('language')}</Text>
            </View>
          </View>
          <View style={styles.langRow}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'te', label: 'తెలుగు' }
            ].map((lang) => (
              <Pressable 
                key={lang.code}
                onPress={() => setLanguage(lang.code as any)}
                style={[
                  styles.langBtn, 
                  { 
                    backgroundColor: language === lang.code ? theme.primary : theme.borderLight,
                    borderWidth: language === lang.code ? 0 : 1,
                    borderColor: theme.border,
                  }
                ]}
              >
                <Text style={{ 
                  color: language === lang.code ? '#FFF' : theme.text, 
                  fontSize: 13, fontWeight: '600' 
                }}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout */}
        <Pressable 
          onPress={signOut}
          style={[styles.logoutBtn, { borderColor: theme.error + '30' }]}
        >
          <LogOut size={18} color={theme.error} />
          <Text style={[Typography.bodySemiBold, { color: theme.error, marginLeft: 8 }]}>
            {t('logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  profileCard: { 
    padding: 24, borderRadius: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  subjectBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row', marginTop: 20,
    paddingTop: 16, width: '100%',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: '100%' },
  section: {
    padding: 16, borderRadius: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
  },
  divider: { height: 1, marginVertical: 4 },
  langRow: { 
    flexDirection: 'row', gap: 8, marginTop: 8, paddingLeft: 30 
  },
  langBtn: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 16, borderWidth: 1.5,
    marginTop: 8,
  },
});
