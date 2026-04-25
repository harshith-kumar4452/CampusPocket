import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Clock, MapPin, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { useLanguage } from '../../src/context/LanguageContext';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function TeacherTimetable() {
  const { user } = useAuth();
  const theme = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1); // Default to Monday if Sunday

  const fetchTimetable = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('timetable_periods')
        .select('*')
        .eq('teacher_id', user.id)
        .order('start_time', { ascending: true });
      
      if (data) setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user]);

  const filteredTimetable = timetable.filter(item => item.day_of_week === selectedDay);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.title, { color: theme.text }]}>{t('mySchedule')}</Text>
      </View>

      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {[1, 2, 3, 4, 5, 6].map((day) => (
            <Pressable 
              key={day} 
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton, 
                { backgroundColor: selectedDay === day ? theme.primary : theme.surface },
                selectedDay === day && styles.activeDay
              ]}
            >
              <Text style={[
                Typography.bodySemiBold, 
                { color: selectedDay === day ? '#FFF' : theme.textMuted }
              ]}>
                {t(DAYS[day] as any).substring(0, 3)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTimetable} tintColor={theme.primary} />}
      >
        {filteredTimetable.length > 0 ? (
          filteredTimetable.map((period) => (
            <Card key={period.id} variant="elevated" style={styles.periodCard}>
              <View style={[styles.timeColumn, { borderRightColor: theme.borderLight }]}>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{period.start_time}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>{period.end_time}</Text>
              </View>
              <View style={styles.detailsColumn}>
                <Text style={[Typography.heading, { color: theme.text }]}>{period.subject_name}</Text>
                <View style={styles.infoRow}>
                  <Calendar size={14} color={theme.primary} />
                  <Text style={[Typography.caption, { color: theme.textMuted, marginLeft: 4 }]}>
                    {period.class_name} (Level {period.class_level})
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin size={14} color={theme.textMuted} />
                  <Text style={[Typography.caption, { color: theme.textMuted, marginLeft: 4 }]}>
                    {period.room}
                  </Text>
                </View>
              </View>
              <View style={[styles.periodNumber, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[Typography.caption, { color: theme.primary, fontWeight: '700' }]}>P{period.period_number}</Text>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.border} />
            <Text style={[Typography.heading, { color: theme.text, marginTop: 16 }]}>{t('noClasses')}</Text>
            <Text style={[Typography.body, { color: theme.textMuted, textAlign: 'center', marginTop: 8 }]}>
              {t('noClassesMsg')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  daySelector: { marginBottom: 16 },
  dayScroll: { paddingHorizontal: 24, gap: 12 },
  dayButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  activeDay: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 100 },
  periodCard: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  timeColumn: { padding: 16, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, width: 80 },
  detailsColumn: { flex: 1, padding: 16, gap: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  periodNumber: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
});
