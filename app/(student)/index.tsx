import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, TextInput, Alert, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarCheck, BarChart3, BookOpen, LogOut, Award, Calendar, ChevronRight, Sparkles, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { StatCard } from '../../src/components/dashboard/StatCard';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useQuizzes } from '../../src/hooks/useQuizzes';
import { useClasses } from '../../src/hooks/useClasses';
import { useCalendarData } from '../../src/hooks/useCalendarData';
import { useAchievements } from '../../src/hooks/useAchievements';
import { useLanguage } from '../../src/context/LanguageContext';

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


export default function StudentHome() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { t } = useLanguage();
  
  const { attendance, stats: attendanceStats, refetch: refetchAttendance } = useAttendance(user?.id);
  const { stats: quizStats, refetch: refetchQuizzes } = useQuizzes(user?.id);
  const { classes, refetch: refetchClasses } = useClasses(user?.id);
  const { achievements, loading: loadingAchievements, refetch: refetchAchievements } = useAchievements(user?.id);

  const today = new Date();
  const { data: dbCalendarData } = useCalendarData(user?.id, today.getFullYear(), today.getMonth());
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
      refetchClasses(),
      refetchAchievements()
    ]);
    setRefreshing(false);
  };

  const handleLeaveSubmit = () => {
    if (!leaveReason.trim() || !leaveDates.trim()) {
      Alert.alert('Missing Info', 'Please fill in both dates and reason.');
      return;
    }
    Alert.alert('Leave Request Sent ✅', `Leave request for ${leaveDates} has been submitted to the school.`);
    setLeaveModalVisible(false);
    setLeaveReason('');
    setLeaveDates('');
  };

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
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

  // Attendance Chart Data
  const attendanceChartData = [
    { name: 'Present', population: attendanceStats.present, color: theme.success, legendFontColor: theme.textMuted },
    { name: 'Absent', population: attendanceStats.absent, color: theme.danger, legendFontColor: theme.textMuted },
    { name: 'Late', population: attendanceStats.late, color: theme.warning, legendFontColor: theme.textMuted },
  ].filter(d => d.population > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar name={profile?.full_name || 'Student'} size={48} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>{greeting()} 👋</Text>
              <Text style={[Typography.title, { color: theme.text }]}>{profile?.full_name?.split(' ')[0] || 'Student'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={signOut} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
              <LogOut size={20} color={theme.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Student Achievements Slider */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[Typography.heading, { color: theme.text }]}>🏆 {t('myAchievements')}</Text>
            <Pressable onPress={() => router.push('/(student)/achievements')}>
              <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>{t('viewAll')}</Text>
            </Pressable>
          </View>
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
              <Text style={[Typography.body, { color: theme.textMuted }]}>{t('noAchievements')}</Text>
            </Card>
          )}
        </View>

        {/* AI Study Recommendations */}
        <View style={styles.section}>
          <View style={styles.aiHeader}>
            <Sparkles size={20} color={theme.primary} />
            <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>{t('aiFocusTopics')}</Text>
          </View>
          <Card style={{ backgroundColor: theme.isDark ? '#1E1B4B' : '#F5F3FF', borderColor: theme.primary + '30' }}>
            <Text style={[Typography.bodyMedium, { color: theme.text, lineHeight: 22 }]}>
              {quizStats.averagePercentage < 75 
                ? t('aiStudyRecLow')
                : t('aiStudyRecHigh')}
            </Text>
            <Pressable 
              onPress={() => router.push('/(student)/insights')}
              style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>{t('viewDetailedPlan')}</Text>
              <ChevronRight size={16} color={theme.primary} />
            </Pressable>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>📋 {t('quickActions')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card onPress={() => router.push('/(student)/report-card')} style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                  <Award size={20} color={theme.primary} />
                </View>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('reportCard')}</Text>
              </View>
            </Card>
            <Card onPress={() => router.push('/(student)/insights')} style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#065F46' : '#D1FAE5' }]}>
                  <User size={20} color={theme.success} />
                </View>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('myMentor')}</Text>
              </View>
            </Card>
            <Card onPress={() => router.push('/(student)/calendar')} style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#78350F' : '#FEF3C7' }]}>
                  <Calendar size={20} color={theme.warning} />
                </View>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('calendar')}</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Attendance Pie Chart & Leave */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>📊 {t('attendance')}</Text>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 20 }}>🔥</Text>
                <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{t('dailyStreak')}: 4 days</Text>
              </View>
              <Badge label="ACTIVE" variant="success" size="small" />
            </View>
            {attendanceStats.total > 0 ? (
              <View style={{ alignItems: 'center' }}>
                <PieChart
                  data={attendanceChartData}
                  width={screenWidth - 80}
                  height={140}
                  chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <Text style={[Typography.body, { color: theme.textMuted, textAlign: 'center', marginVertical: 20 }]}>
                {t('noAttendanceData')}
              </Text>
            )}
            <View style={{ marginTop: 16 }}>
              <Button title={t('requestLeave')} onPress={() => setLeaveModalVisible(true)} variant="outline" icon={<CalendarCheck size={18} color={theme.primary} />} />
            </View>
          </Card>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title={t('avgScore')}
            value={`${quizStats.averagePercentage}%`}
            icon={<BarChart3 size={18} color="#FFFFFF" />}
            gradient={['#EC4899', '#F472B6']}
            delay={0}
          />
          <StatCard
            title={t('classesToday')}
            value={classes.length.toString()}
            icon={<BookOpen size={18} color="#FFFFFF" />}
            gradient={['#10B981', '#34D399']}
            delay={100}
          />
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>📅 {t('calendarOverview')}</Text>
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
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const dayNum = String(d).padStart(2, '0');
                    const dateStr = `${year}-${month}-${dayNum}`;
                    const dayRecords = attendance.filter(r => r.date.startsWith(dateStr));
                    
                    let emoji = null;
                    if (dayRecords.length > 0) {
                      const allPresent = dayRecords.every(r => r.status === 'present');
                      const anyAbsent = dayRecords.some(r => r.status === 'absent');
                      emoji = allPresent ? '🔥' : anyAbsent ? '😢' : '😐';
                    }

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
                          emoji ? { fontSize: 16 } : Typography.captionSmall,
                          !emoji && {
                            color: holiday ? '#059669' : exam ? '#EF4444' : isToday ? theme.primary : theme.text,
                            fontWeight: isToday || holiday || exam ? '700' : '400',
                          }
                        ]}>
                          {emoji || d}
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
          </Card>
        </View>

      </ScrollView>

      {/* Leave Request Modal */}
      <Modal visible={leaveModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[Typography.title, { color: theme.text, marginBottom: 16 }]}>{t('requestLeave')}</Text>
            
            <Text style={[Typography.bodySemiBold, { color: theme.text, marginBottom: 8 }]}>{t('leaveDates')}</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              placeholder={t('datesPlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={leaveDates}
              onChangeText={setLeaveDates}
            />

            <Text style={[Typography.bodySemiBold, { color: theme.text, marginBottom: 8 }]}>{t('leaveReason')}</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border, height: 100, textAlignVertical: 'top' }]}
              placeholder={t('reasonPlaceholder')}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: 24 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  calendarRow: { flexDirection: 'row' },
  calendarCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', margin: 1 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eventDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  calendarLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSquare: { width: 12, height: 12, borderRadius: 3 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
  modalActions: { flexDirection: 'row', marginTop: 16 },
});
