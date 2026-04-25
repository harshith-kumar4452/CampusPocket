import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, TextInput, Alert, FlatList, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CalendarCheck, BarChart3, Award, Trophy, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Typography } from '../../src/constants/typography';
import { StatCard } from '../../src/components/dashboard/StatCard';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useQuizzes } from '../../src/hooks/useQuizzes';
import { useFees } from '../../src/hooks/useFees';
import { useCalendarData } from '../../src/hooks/useCalendarData';
import { useAchievements } from '../../src/hooks/useAchievements';
import { useEvents } from '../../src/hooks/useEvents';

const IMAGE_MAPPING: Record<string, any> = {
  'achievement_medal.png': require('../../assets/images/achievement_medal.png'),
  'achievement_trophy.png': require('../../assets/images/achievement_trophy.png'),
  'event_annual_day.png': require('../../assets/images/event_annual_day.png'),
  'event_christmas.png': require('../../assets/images/event_christmas.png'),
  'event_science.png': require('../../assets/images/event_science.png'),
  'event_sports.png': require('../../assets/images/event_sports.png'),
  'event_summer_camp.png': require('../../assets/images/event_summer_camp.png'),
};


const screenWidth = Dimensions.get('window').width;

export default function ChildDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { selectedChild } = useAuth();
  
  const { stats: attendanceStats, refetch: refetchAttendance } = useAttendance(selectedChild?.id);
  const { stats: quizStats, refetch: refetchQuizzes } = useQuizzes(selectedChild?.id);
  const { stats: feeStats, refetch: refetchFees } = useFees(selectedChild?.id);
  const { achievements, refetch: refetchAchievements } = useAchievements(selectedChild?.id);
  const { events, refetch: refetchEvents } = useEvents();

  const today = new Date();
  const { data: dbCalendarData } = useCalendarData(selectedChild?.id, today.getFullYear(), today.getMonth());
  const dbExams = dbCalendarData.filter(d => d.type === 'exam');
  const dbHolidays = dbCalendarData.filter(d => d.type === 'holiday');
  const dbEvents = dbCalendarData.filter(d => d.type === 'event');

  const [refreshing, setRefreshing] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDates, setLeaveDates] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchAttendance(), 
      refetchQuizzes(), 
      refetchFees(),
      refetchAchievements(),
      refetchEvents()
    ]);
    setRefreshing(false);
  };

  const handleLeaveSubmit = () => {
    if (!leaveReason.trim() || !leaveDates.trim()) {
      Alert.alert(t('missingInfo'), t('pleaseFillBoth'));
      return;
    }
    Alert.alert(t('leaveRequestSent'), t('leaveRequestSubmitted'));
    setLeaveModalVisible(false);
    setLeaveReason('');
    setLeaveDates('');
  };

  const sliderRef = useRef<FlatList>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) return;
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % achievements.length;
      setCurrentSlide(nextSlide);
      sliderRef.current?.scrollToIndex({ index: nextSlide, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlide, achievements.length]);

  // Calendar grid
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Avatar name={selectedChild?.full_name || 'Student'} size={36} />
            <Text style={[Typography.heading, { color: theme.text, marginLeft: 10 }]}>
              {selectedChild?.full_name || 'Student'}
            </Text>
          </View>
        </View>

        {/* Student Achievements Slider */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>🏆 {t('latestAchievements')}</Text>
          {achievements.length > 0 ? (
            <>
              <FlatList
                ref={sliderRef}
                data={achievements}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 40));
                  setCurrentSlide(index);
                }}
                renderItem={({ item }) => (
                  <View style={{ width: screenWidth - 40, height: 160, borderRadius: 16, overflow: 'hidden', marginRight: 16 }}>
                    <Image 
                      source={item.image_url ? IMAGE_MAPPING[item.image_url] : require('../../assets/images/achievement_trophy.png')} 
                      style={{ width: '100%', height: '100%' }} 
                      resizeMode="cover" 
                    />
                    <View
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, justifyContent: 'center' }}
                    >
                      <Text style={[Typography.bodySemiBold, { color: '#FFF' }]}>{item.title}</Text>
                    </View>
                  </View>
                )}
              />
              {/* Dot Indicators */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 }}>
                {achievements.map((_, i) => (
                  <View 
                    key={i} 
                    style={{ 
                      width: currentSlide === i ? 20 : 6, 
                      height: 6, 
                      borderRadius: 3, 
                      backgroundColor: currentSlide === i ? theme.primary : theme.border 
                    }} 
                  />
                ))}
              </View>
            </>
          ) : (
            <Card style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[Typography.body, { color: theme.textMuted }]}>{t('noAchievementsRecorded')}</Text>
            </Card>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title={t('attendance')}
            value={`${attendanceStats.percentage}%`}
            subtitle={`${attendanceStats.present}/${attendanceStats.total} ${t('days')}`}
            icon={<CalendarCheck size={18} color="#FFFFFF" />}
            gradient={['#6366F1', '#8B5CF6']}
          />
          <StatCard
            title={t('avgScore')}
            value={`${quizStats.averagePercentage}%`}
            subtitle={`${quizStats.totalQuizzes} ${t('quizzes')}`}
            icon={<BarChart3 size={18} color="#FFFFFF" />}
            gradient={['#EC4899', '#F472B6']}
          />
        </View>

        {/* Quick Actions - Report Card & Achievements */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>📋 {t('quickActions')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card onPress={() => router.push('/(parent)/report-card')} style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={[styles.feeTermIcon, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                  <Award size={20} color={theme.primary} />
                </View>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('reportCard')}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('viewExamMarks')}</Text>
              </View>
            </Card>
            <Card onPress={() => router.push('/(parent)/achievements')} style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={[styles.feeTermIcon, { backgroundColor: theme.isDark ? '#78350F' : '#FEF3C7' }]}>
                  <Trophy size={20} color={theme.warning} />
                </View>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('achievements')}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('awardsMedals')}</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>📅 {t('schoolCalendar')}</Text>
          <Card>
            <Text style={[Typography.bodySemiBold, { color: theme.text, textAlign: 'center', marginBottom: 12 }]}>{currentMonth}</Text>
            <View style={styles.calendarRow}>
              {dayNames.map((d, i) => (
                <View key={i} style={styles.calendarCell}>
                  <Text style={[Typography.captionSmall, { color: theme.textMuted, fontWeight: '700' }]}>{d}</Text>
                </View>
              ))}
            </View>
            {(() => {
              const rows = [];
              let dayCounter = 1;
              for (let row = 0; row < 6; row++) {
                const cells = [];
                for (let col = 0; col < 7; col++) {
                  if ((row === 0 && col < firstDayOfWeek) || dayCounter > daysInMonth) {
                    cells.push(<View key={col} style={styles.calendarCell} />);
                  } else {
                    const d = dayCounter;
                    const holiday = dbHolidays.find(h => h.day === d);
                    const event = dbEvents.find(e => e.day === d);
                    const exam = dbExams.find(e => e.day === d);
                    const isToday = d === today.getDate();
                    cells.push(
                      <View key={col} style={[
                        styles.calendarCell,
                        holiday && { backgroundColor: '#D1FAE5', borderRadius: 8 },
                        exam && { backgroundColor: '#FEE2E2', borderRadius: 8 },
                        isToday && !holiday && !exam && { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF', borderRadius: 8 },
                      ]}>
                        <Text style={[
                          Typography.captionSmall,
                          {
                            color: holiday ? '#059669' : exam ? '#EF4444' : isToday ? theme.primary : theme.text,
                            fontWeight: isToday || holiday || exam ? '700' : '400',
                          }
                        ]}>
                          {d}
                        </Text>
                        {event && <View style={[styles.eventDot, { backgroundColor: event.color }]} />}
                        {exam && <View style={[styles.eventDot, { backgroundColor: '#EF4444' }]} />}
                      </View>
                    );
                    dayCounter++;
                  }
                }
                rows.push(<View key={row} style={styles.calendarRow}>{cells}</View>);
                if (dayCounter > daysInMonth) break;
              }
              return rows;
            })()}
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}><View style={[styles.legendSquare, { backgroundColor: '#D1FAE5' }]} /><Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('holidays')}</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendSquare, { backgroundColor: '#FEE2E2' }]} /><Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('exams')}</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} /><Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('events')}</Text></View>
            </View>
            <View style={{ marginTop: 16 }}>
              <Button title={t('requestLeave')} onPress={() => setLeaveModalVisible(true)} variant="outline" icon={<CalendarCheck size={18} color={theme.primary} />} />
            </View>
          </Card>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>🎉 {t('upcomingEvents')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {events.slice(0, 3).map((event) => (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <Text style={styles.eventEmoji}>📅</Text>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]} numberOfLines={2}>{event.title}</Text>
                <Badge 
                  label={new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                  variant="primary" 
                  size="small" 
                  style={{ marginTop: 8 }} 
                />
              </View>
            ))}
            {events.length === 0 && (
              <Text style={[Typography.body, { color: theme.textMuted }]}>{t('noUpcomingEventsFound')}</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Leave Request Modal */}
      <Modal visible={leaveModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.title, { color: theme.text, marginBottom: 16 }]}>{t('requestLeave')}</Text>
              <Pressable onPress={() => setLeaveModalVisible(false)}><X size={24} color={theme.textMuted} style={{ marginBottom: 16 }} /></Pressable>
            </View>
            
            <Text style={[Typography.bodySemiBold, { color: theme.text, marginBottom: 8 }]}>{t('dates')}</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              placeholder="e.g., Oct 15 - Oct 16"
              placeholderTextColor={theme.textMuted}
              value={leaveDates}
              onChangeText={setLeaveDates}
            />

            <Text style={[Typography.bodySemiBold, { color: theme.text, marginBottom: 8 }]}>{t('reason')}</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border, height: 100, textAlignVertical: 'top' }]}
              placeholder={t('reasonForLeave')}
              placeholderTextColor={theme.textMuted}
              value={leaveReason}
              onChangeText={setLeaveReason}
              multiline
            />

            <View style={styles.modalActions}>
              <Button title={t('cancel')} onPress={() => setLeaveModalVisible(false)} variant="outline" style={{ flex: 1 }} />
              <Button title={t('submitRequest')} onPress={handleLeaveSubmit} style={{ flex: 1, marginLeft: 12 }} />
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  section: { marginBottom: 20 },
  feeTermIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  calendarRow: { flexDirection: 'row' },
  calendarCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', margin: 1 },
  eventDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  calendarLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSquare: { width: 12, height: 12, borderRadius: 3 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  eventCard: { width: 150, borderRadius: 16, padding: 16, borderWidth: 1 },
  eventEmoji: { fontSize: 28, marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
  modalActions: { flexDirection: 'row', marginTop: 16 },
});
