import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Calendar, Clock, User, Phone, Mail, ChevronRight, BookOpen, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { useLanguage } from '../../src/context/LanguageContext';
import { InsightCard } from '../../src/components/ai/InsightCard';
import { useAIInsights } from '../../src/hooks/useAIInsights';
import { useAcademicInfo } from '../../src/hooks/useAcademicInfo';

import { supabase } from '../../src/lib/supabase';

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

export default function StudentHub() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);
  const [mentor, setMentor] = useState<any>(null);
  const [dailyTimetable, setDailyTimetable] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'info' | 'ai'>('info');
  const { insights, loading: aiLoading, fetchInsights } = useAIInsights();

  const fetchAcademicData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setDailyTimetable([]); // Clear previous to avoid overlapping subjects
    try {
      // Concurrent fetching for better performance
      const [mentorRes, ttRes, profileRes] = await Promise.all([
        supabase
          .from('mentors')
          .select('*')
          .limit(1)
          .single(),
        supabase
          .from('timetable_periods')
          .select('*')
          .eq('day_of_week', selectedDay)
          .order('period_number'),
        supabase
          .from('profiles')
          .select('class_level')
          .eq('id', user.id)
          .single()
      ]);

      if (mentorRes.data) setMentor(mentorRes.data);
      if (ttRes.data) setDailyTimetable(ttRes.data);
      
      const classLevel = profileRes.data?.class_level || profile?.class_level || 5;

      if (classLevel) {
        const { data: classMentor } = await supabase
          .from('mentors')
          .select('*')
          .eq('class_level', classLevel)
          .single();
        if (classMentor) setMentor(classMentor);

        const { data: classTT } = await supabase
          .from('timetable_periods')
          .select('*')
          .eq('class_level', classLevel)
          .eq('day_of_week', selectedDay)
          .order('period_number');
        if (classTT) setDailyTimetable(classTT);
      }

      const { data: examData } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('class_level', classLevel)
        .order('exam_date');
      
      setExams(examData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDay]);

  // Separate useEffect for AI Insights - only triggers once on load/user change
  useEffect(() => {
    if (user) {
      fetchInsights(user.id);
    }
  }, [user?.id, fetchInsights]);

  // Separate useEffect for Academic Info - triggers on day change
  useEffect(() => {
    if (user) {
      fetchAcademicData();
    }
  }, [user?.id, selectedDay, fetchAcademicData]);

  const onRefresh = () => {
    if (user) {
      fetchAcademicData();
      fetchInsights(user.id);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={aiLoading || loading} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[Typography.title, { color: theme.text }]}>{t('studentHub')}</Text>
          <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
            {t('studentHubSub')}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
          <Pressable 
            onPress={() => setActiveSection('info')}
            style={[styles.tab, activeSection === 'info' && { backgroundColor: theme.primary }]}
          >
            <Text style={[Typography.bodySemiBold, { color: activeSection === 'info' ? '#FFF' : theme.textMuted }]}>{t('academicInfo')}</Text>
          </Pressable>
          <Pressable 
            onPress={() => setActiveSection('ai')}
            style={[styles.tab, activeSection === 'ai' && { backgroundColor: theme.primary }]}
          >
            <Text style={[Typography.bodySemiBold, { color: activeSection === 'ai' ? '#FFF' : theme.textMuted }]}>{t('aiInsights')}</Text>
          </Pressable>
        </View>

        {activeSection === 'info' ? (
          <View style={{ gap: 24 }}>
            {/* Mentor Section */}
            <View>
              <View style={styles.sectionHeader}>
                <User size={20} color={theme.primary} />
                <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>{t('classMentor')}</Text>
              </View>
              {mentor ? (
                <Card variant="default">
                  <View style={styles.mentorRow}>
                    <Avatar name={mentor.full_name} size={60} />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text, fontSize: 17 }]}>{mentor.full_name}</Text>
                      <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{mentor.specialization}</Text>
                      <View style={styles.mentorContact}>
                        <Pressable onPress={() => Linking.openURL(`tel:${mentor.phone}`)} style={styles.contactBtn}>
                          <Phone size={14} color={theme.primary} />
                        </Pressable>
                        <Pressable onPress={() => Linking.openURL(`mailto:${mentor.email}`)} style={styles.contactBtn}>
                          <Mail size={14} color={theme.primary} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Card>
              ) : (
                <Card variant="outlined" style={styles.emptyCard}><ActivityIndicator color={theme.primary}/></Card>
              )}
            </View>

            {/* Complete Timetable Section */}
            <View>
              <View style={styles.sectionHeader}>
                <Clock size={20} color={theme.secondary} />
                <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>{t('weeklyTimetable')}</Text>
              </View>
              
              <View style={styles.daySelector}>
                {DAYS.map((day) => (
                  <Pressable
                    key={day.id}
                    onPress={() => setSelectedDay(day.id)}
                    style={[
                      styles.dayButton,
                      { backgroundColor: theme.surface, borderColor: theme.borderLight },
                      selectedDay === day.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                  >
                    <Text style={[
                      Typography.caption,
                      { color: theme.textMuted },
                      selectedDay === day.id && { color: '#FFF', fontWeight: '700' }
                    ]}>
                      {t(day.label.toLowerCase() as any)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {dailyTimetable.length > 0 ? dailyTimetable.map((item, index) => (
                  <View 
                    key={item.id} 
                    style={[
                      styles.ttRow, 
                      { borderBottomColor: theme.borderLight },
                      index === dailyTimetable.length - 1 && { borderBottomWidth: 0 },
                      item.subject_name === 'Lunch Break' && { backgroundColor: theme.isDark ? '#1E293B' : '#F8FAFC' }
                    ]}
                  >
                    <View style={styles.ttTimeCol}>
                      <Text style={[Typography.captionSmall, { color: theme.primary, fontWeight: '700' }]}>{item.start_time}</Text>
                      <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{item.end_time}</Text>
                    </View>
                    <View style={styles.ttContentCol}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{item.subject_name}</Text>
                      <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('period')} {item.period_number}</Text>
                    </View>
                    {item.subject_name === 'Lunch Break' ? (
                       <BookOpen size={16} color={theme.textMuted} style={{ opacity: 0.5 }} />
                    ) : (
                       <ChevronRight size={16} color={theme.border} />
                    )}
                  </View>
                )) : (
                  <View style={styles.emptyTimetable}>
                    <AlertCircle size={24} color={theme.textMuted} />
                    <Text style={[Typography.body, { color: theme.textMuted, marginTop: 8 }]}>{t('noSchedule')}</Text>
                  </View>
                )}
              </Card>
            </View>

            {/* Academic Calendar Section */}
            <View>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={theme.warning} />
                <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>{t('academicCalendar')}</Text>
              </View>
              
              {/* Categorized Exams */}
              {Array.from(new Set(exams.map(e => e.exam_name))).map((examGroup) => (
                <View key={examGroup} style={{ marginBottom: 16 }}>
                  <View style={{ backgroundColor: theme.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 8, alignSelf: 'flex-start' }}>
                    <Text style={[Typography.caption, { color: theme.primary, fontWeight: '700' }]}>{examGroup}</Text>
                  </View>
                  <Card>
                    {exams.filter(e => e.exam_name === examGroup).map((event, i, arr) => (
                      <View key={i} style={[styles.eventRow, i !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}>
                        <View style={styles.eventDate}>
                          <Text style={[Typography.bodySemiBold, { color: theme.text, textAlign: 'center' }]}>
                            {new Date(event.exam_date).getDate()}
                          </Text>
                          <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>
                            {new Date(event.exam_date).toLocaleString('default', { month: 'short' })}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={[Typography.bodyMedium, { color: theme.text }]}>{event.subject_name}</Text>
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                            <Badge label={t('written')} variant="primary" size="small" />
                            <Badge label={t('confirmed')} variant="danger" size="small" />
                          </View>
                        </View>
                      </View>
                    ))}
                  </Card>
                </View>
              ))}

              {exams.length === 0 && (
                <Card>
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={[Typography.body, { color: theme.textMuted }]}>{t('noUpcomingExams')}</Text>
                  </View>
                </Card>
              )}
            </View>
          </View>
        ) : (
          /* AI Insights Section */
          <View>
             <View style={styles.aiHeader}>
                <Sparkles size={20} color={theme.primary} />
                <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>{t('smartAnalysis')}</Text>
                <View style={[styles.aiBadge, { backgroundColor: theme.primaryLight + '40' }]}>
                  <Text style={[Typography.captionSmall, { color: theme.primary }]}>{t('active')}</Text>
                </View>
             </View>
             {aiLoading ? (
               <View style={styles.loadingContainer}>
                 <ActivityIndicator size="large" color={theme.primary} />
                 <Text style={[Typography.body, { color: theme.textMuted, marginTop: 16 }]}>{t('analyzingPerf')}</Text>
               </View>
             ) : insights ? (
               <InsightCard insights={insights} />
             ) : (
               <Card style={styles.emptyCard}><Text style={{color: theme.textMuted}}>{t('noInsightsYet')}</Text></Card>
             )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  header: { marginBottom: 24 },
  tabBar: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mentorRow: { flexDirection: 'row', alignItems: 'center' },
  mentorContact: { flexDirection: 'row', gap: 10, marginTop: 10 },
  contactBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.1)', alignItems: 'center', justifyContent: 'center' },
  daySelector: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dayButton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  ttRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  ttTimeCol: { width: 60, marginRight: 16 },
  ttContentCol: { flex: 1 },
  emptyTimetable: { padding: 40, alignItems: 'center' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  eventDate: { width: 65, alignItems: 'center', justifyContent: 'center' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyCard: { alignItems: 'center', padding: 20 },
});
