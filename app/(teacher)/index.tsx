import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/hooks/useTheme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Typography } from '../../src/constants/typography';
import { 
  Users, FileText, Calendar as CalendarIcon, Clock, ChevronRight, 
  BookOpen, MapPin, GraduationCap, TrendingUp, CheckCircle2
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { useRouter } from 'expo-router';

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#6366F1',
  'Math': '#6366F1',
  'Science': '#10B981',
  'English': '#F59E0B',
  'Hindi': '#EC4899',
  'Social Science': '#8B5CF6',
  'Advanced Physics': '#0EA5E9',
};

const SUBJECT_ICONS: Record<string, string> = {
  'Mathematics': '∑',
  'Math': '∑',
  'Science': '⚗️',
  'English': 'Aa',
  'Hindi': 'अ',
  'Social Science': '🌍',
  'Advanced Physics': '⚛️',
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [todayPeriods, setTodayPeriods] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    todayClasses: 0,
    activeExams: 0,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. Fetch profile (to get teacher's subject)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof);

      // 2. Fetch ONLY this teacher's classes (filtered by teacher_id)
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('class_level', { ascending: true });

      if (classData) {
        // For each class, get student count
        const classesWithCounts = await Promise.all(
          classData.map(async (cls) => {
            const { count } = await supabase
              .from('student_classes')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id);
            return { ...cls, student_count: count || 0 };
          })
        );
        setClasses(classesWithCounts);
      }

      // 3. Fetch today's timetable periods for this teacher
      const todayDow = new Date().getDay() || 7; // Sunday=7 for our DAYS array
      const { data: periods } = await supabase
        .from('timetable_periods')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('day_of_week', todayDow)
        .order('start_time', { ascending: true });
      if (periods) setTodayPeriods(periods);

      // 4. Fetch exam count for this teacher
      const { count: examCount } = await supabase
        .from('exam_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)
        .gte('exam_date', new Date().toISOString().split('T')[0]);

      // 5. Compute stats
      const totalStudents = classData
        ? (await Promise.all(
            classData.map(async (cls) => {
              const { count } = await supabase
                .from('student_classes')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', cls.id);
              return count || 0;
            })
          )).reduce((a, b) => a + b, 0)
        : 0;

      setStats({
        totalStudents,
        totalClasses: classData?.length || 0,
        todayClasses: periods?.length || 0,
        activeExams: examCount || 0,
      });
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const subjectColor = profile?.subject ? (SUBJECT_COLORS[profile.subject] || theme.primary) : theme.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>{getGreeting()}</Text>
            <Text style={[Typography.title, { color: theme.text }]} numberOfLines={1}>
              {profile?.full_name || 'Teacher'}
            </Text>
            {profile?.subject && (
              <View style={[styles.subjectBadge, { backgroundColor: subjectColor + '18' }]}>
                <Text style={[Typography.captionSmall, { color: subjectColor, fontWeight: '700' }]}>
                  {SUBJECT_ICONS[profile.subject] || '📚'} {profile.subject} Teacher
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.avatar, { backgroundColor: subjectColor + '20' }]}>
            <Text style={[Typography.title, { color: subjectColor, fontSize: 22 }]}>
              {profile?.full_name?.charAt(0) || 'T'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: '#6366F120' }]}>
              <Users size={18} color="#6366F1" />
            </View>
            <Text style={[Typography.title, { color: theme.text, fontSize: 20, marginTop: 8 }]}>{stats.totalStudents}</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('students')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <BookOpen size={18} color="#10B981" />
            </View>
            <Text style={[Typography.title, { color: theme.text, fontSize: 20, marginTop: 8 }]}>{stats.totalClasses}</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('totalClasses')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <CalendarIcon size={18} color="#F59E0B" />
            </View>
            <Text style={[Typography.title, { color: theme.text, fontSize: 20, marginTop: 8 }]}>{stats.todayClasses}</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('classesToday')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: '#EC489920' }]}>
              <FileText size={18} color="#EC4899" />
            </View>
            <Text style={[Typography.title, { color: theme.text, fontSize: 20, marginTop: 8 }]}>{stats.activeExams}</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('activeExams')}</Text>
          </View>
        </View>

        {/* My Classes — the main feature */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.heading, { color: theme.text }]}>{t('myClasses')}</Text>
            <Text style={[Typography.captionSmall, { color: subjectColor, fontWeight: '700' }]}>
              {profile?.subject || ''}
            </Text>
          </View>

          {classes.length > 0 ? (
            <View style={styles.classGrid}>
              {classes.map((cls, index) => {
                const color = SUBJECT_COLORS[cls.subject] || theme.primary;
                return (
                  <Pressable
                    key={cls.id}
                    onPress={() => router.push({
                      pathname: '/(teacher)/class/[id]',
                      params: { id: cls.id, name: cls.name, subject: cls.subject }
                    })}
                    style={({ pressed }) => [
                      styles.classCard,
                      { 
                        backgroundColor: theme.surface,
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }]
                      }
                    ]}
                  >
                    {/* Color accent bar */}
                    <View style={[styles.classAccent, { backgroundColor: color }]} />
                    
                    <View style={styles.classCardContent}>
                      {/* Grade label — big and prominent */}
                      <Text style={[Typography.title, { color: theme.text, fontSize: 22 }]}>
                        {cls.class_level}{cls.class_level === 1 ? 'st' : cls.class_level === 2 ? 'nd' : cls.class_level === 3 ? 'rd' : 'th'}
                      </Text>
                      <Text style={[Typography.bodySemiBold, { color, fontSize: 15, marginTop: 2 }]}>
                        Grade
                      </Text>

                      {/* Subject pill */}
                      <View style={[styles.subjectPill, { backgroundColor: color + '12' }]}>
                        <Text style={[Typography.captionSmall, { color, fontWeight: '700' }]}>
                          {cls.subject}
                        </Text>
                      </View>

                      {/* Bottom row: student count + room */}
                      <View style={styles.classCardFooter}>
                        <View style={styles.classMetaItem}>
                          <Users size={12} color={theme.textMuted} />
                          <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]}>
                            {cls.student_count}
                          </Text>
                        </View>
                        <View style={styles.classMetaItem}>
                          <MapPin size={12} color={theme.textMuted} />
                          <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]} numberOfLines={1}>
                            {cls.room || 'TBA'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Card variant="outlined" style={{ padding: 32, alignItems: 'center' }}>
              <BookOpen size={40} color={theme.border} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
                {t('noClassesMsg')}
              </Text>
            </Card>
          )}
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.heading, { color: theme.text }]}>{t('todaySchedule')}</Text>
            <Pressable onPress={() => router.push('/(teacher)/timetable')}>
              <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>{t('viewAll')}</Text>
            </Pressable>
          </View>

          {todayPeriods.length > 0 ? (
            <View style={{ gap: 0 }}>
              {todayPeriods.map((period, index) => (
                <View key={period.id} style={styles.scheduleRow}>
                  <View style={styles.scheduleTimeline}>
                    <View style={[styles.timelineDot, { backgroundColor: subjectColor }]} />
                    {index < todayPeriods.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: theme.borderLight }]} />
                    )}
                  </View>
                  <View style={[styles.scheduleCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.scheduleTop}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]}>
                        {period.subject_name}
                      </Text>
                      <View style={[styles.periodBadge, { backgroundColor: subjectColor + '15' }]}>
                        <Text style={[Typography.captionSmall, { color: subjectColor, fontWeight: '700' }]}>
                          P{period.period_number}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scheduleDetails}>
                      <View style={styles.scheduleMetaItem}>
                        <Clock size={13} color={theme.textMuted} />
                        <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]}>
                          {period.start_time} - {period.end_time}
                        </Text>
                      </View>
                      <View style={styles.scheduleMetaItem}>
                        <GraduationCap size={13} color={theme.textMuted} />
                        <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]}>
                          {period.class_name || `Class ${period.class_level}`}
                        </Text>
                      </View>
                      {period.room && (
                        <View style={styles.scheduleMetaItem}>
                          <MapPin size={13} color={theme.textMuted} />
                          <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]}>
                            {period.room}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={{ padding: 32, alignItems: 'center' }}>
              <CalendarIcon size={40} color={theme.border} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
                {t('noClasses')}
              </Text>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 16 }]}>{t('quickActions')}</Text>
          <View style={{ gap: 12 }}>
            <Pressable 
              onPress={() => router.push('/(teacher)/assignments')}
              style={({ pressed }) => [
                styles.actionCard, 
                { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 }
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10B98115' }]}>
                <FileText size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('createAssignment')}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('setupQuizzes')}</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </Pressable>

            <Pressable 
              onPress={() => router.push('/(teacher)/timetable')}
              style={({ pressed }) => [
                styles.actionCard, 
                { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 }
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: subjectColor + '15' }]}>
                <CalendarIcon size={20} color={subjectColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('mySchedule')}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('viewWeeklyTimetable')}</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </Pressable>

            <Pressable 
              onPress={() => router.push('/(teacher)/classes')}
              style={({ pressed }) => [
                styles.actionCard, 
                { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 }
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#6366F115' }]}>
                <Users size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('manageClasses')}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('timetableAttendanceGrades')}</Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 24 
  },
  avatar: { 
    width: 52, height: 52, borderRadius: 26, 
    alignItems: 'center', justifyContent: 'center' 
  },
  subjectBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 8, marginTop: 6 
  },
  statsContainer: { 
    flexDirection: 'row', gap: 10, marginBottom: 28 
  },
  statCard: { 
    flex: 1, padding: 12, borderRadius: 16, 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statIcon: { 
    width: 36, height: 36, borderRadius: 10, 
    alignItems: 'center', justifyContent: 'center' 
  },
  section: { marginBottom: 28 },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', marginBottom: 16 
  },

  /* Class card grid */
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classCard: {
    width: '47.5%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  classAccent: {
    height: 4,
    width: '100%',
  },
  classCardContent: {
    padding: 14,
  },
  classLevelBadge: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  subjectPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginTop: 8,
  },
  classCardFooter: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  classMetaItem: {
    flexDirection: 'row', alignItems: 'center',
  },

  /* Schedule timeline */
  scheduleRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  scheduleTimeline: {
    width: 24, alignItems: 'center', paddingTop: 8,
  },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5, zIndex: 1,
  },
  timelineLine: {
    width: 2, flex: 1, marginTop: -2,
  },
  scheduleCard: {
    flex: 1, marginLeft: 8, marginBottom: 12,
    padding: 14, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  scheduleTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  periodBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  scheduleDetails: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8,
  },
  scheduleMetaItem: {
    flexDirection: 'row', alignItems: 'center',
  },

  /* Quick actions */
  actionCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
});
