import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';
import { useCalendarData } from '../../src/hooks/useCalendarData';

// Mock holidays and events data
const SCHOOL_HOLIDAYS: Record<string, { day: number; label: string }[]> = {
  '2026-4': [{ day: 14, label: 'Ambedkar Jayanti' }],
  '2026-5': [{ day: 1, label: 'May Day' }, { day: 23, label: 'Buddha Purnima' }],
  '2026-6': [
    ...Array.from({ length: 30 }, (_, i) => ({ day: i + 1, label: i === 0 ? '🏖️ Summer Break Begins' : 'Summer Break' })),
  ],
  '2026-7': [
    ...Array.from({ length: 14 }, (_, i) => ({ day: i + 1, label: i === 13 ? '🏖️ Summer Break Ends' : 'Summer Break' })),
    { day: 15, label: 'School Reopens' },
  ],
  '2026-8': [{ day: 15, label: 'Independence Day' }],
  '2026-10': [{ day: 2, label: 'Gandhi Jayanti' }, { day: 12, label: 'Dussehra' }, { day: 31, label: 'Diwali' }],
  '2026-11': [{ day: 1, label: 'Diwali Holiday' }],
  '2026-1': [{ day: 26, label: 'Republic Day' }],
};

const SCHOOL_EVENTS: Record<string, { day: number; label: string; color: string }[]> = {
  '2026-5': [
    { day: 5, label: 'Annual Sports Day', color: '#6366F1' },
    { day: 12, label: 'Parent-Teacher Meet', color: '#EC4899' },
    { day: 20, label: 'Science Exhibition', color: '#10B981' },
  ],
  '2026-7': [{ day: 20, label: 'Orientation Day', color: '#6366F1' }],
  '2026-8': [{ day: 10, label: 'Inter-School Quiz', color: '#F59E0B' }],
  '2026-12': [{ day: 15, label: 'Annual Day', color: '#EC4899' }, { day: 20, label: 'Christmas Celebration', color: '#10B981' }],
};

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export default function StudentCalendarPage() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { data: dbCalendarData } = useCalendarData(user?.id, year, month);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const monthKey = `${year}-${month + 1}`;
  const holidays = SCHOOL_HOLIDAYS[monthKey] || [];
  const events = SCHOOL_EVENTS[monthKey] || [];
  const dbExams = dbCalendarData.filter(d => d.type === 'exam');

  const goToPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Text style={[Typography.title, { color: theme.text, marginLeft: 12 }]}>{t('schoolCalendar')}</Text>
        </View>

        {/* Month Navigation */}
        <Card style={{ marginTop: 16 }}>
          <View style={styles.monthNav}>
            <Pressable onPress={goToPrevMonth} style={[styles.navBtn, { backgroundColor: theme.background }]}>
              <ChevronLeft size={20} color={theme.text} />
            </Pressable>
            <Text style={[Typography.heading, { color: theme.text }]}>
              {t(MONTH_NAMES[month] as any)} {year}
            </Text>
            <Pressable onPress={goToNextMonth} style={[styles.navBtn, { backgroundColor: theme.background }]}>
              <ChevronRight size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Day name headers */}
          <View style={styles.calendarRow}>
            {dayNames.map((d, i) => (
              <View key={i} style={styles.calendarCell}>
                <Text style={[Typography.captionSmall, { color: theme.textMuted, fontWeight: '700' }]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Day grid */}
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
                  const holiday = holidays.find(h => h.day === d);
                  const event = events.find(e => e.day === d);
                  const exam = dbExams.find(e => e.day === d);
                  const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  
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

          {/* Calendar Legend */}
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: '#D1FAE5' }]} />
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('holiday')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: '#FEE2E2' }]} />
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('exam')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDotLg, { backgroundColor: theme.primary }]} />
              <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{t('event')}</Text>
            </View>
          </View>
        </Card>

        {/* Exams List */}
        {dbExams.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>
              🔴 {t('examsThisMonth')}
            </Text>
            {dbExams.map((e, i) => (
              <Card key={i} variant="outlined" style={[styles.listCard, { borderLeftColor: '#EF4444', borderLeftWidth: 4 }]}>
                <View style={styles.listRow}>
                  <Text style={[Typography.bodySemiBold, { color: '#B91C1C' }]}>{e.label}</Text>
                  <Badge label={`${t(MONTH_NAMES[month] as any)} ${e.day}`} variant="danger" size="small" />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Holidays for this month */}
        {holidays.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>
              🟢 {t('holidaysThisMonth')}
            </Text>
            {(() => {
              const isSummerMonth = holidays.some(h => h.label.includes('Summer Break'));
              const uniqueHolidays = isSummerMonth
                ? [{ day: 0, label: `🏖️ Summer Break (${MONTH_NAMES[month]})` }, ...holidays.filter(h => !h.label.includes('Summer Break'))]
                : holidays;
              return uniqueHolidays.map((h, i) => (
                <Card key={i} variant="outlined" style={[styles.listCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
                  <View style={styles.listRow}>
                    <Text style={[Typography.bodySemiBold, { color: '#059669' }]}>{h.label}</Text>
                    {h.day > 0 && <Badge label={`${t(MONTH_NAMES[month] as any)} ${h.day}`} variant="success" size="small" />}
                    {h.day === 0 && <Badge label={t('fullMonth')} variant="success" size="small" />}
                  </View>
                </Card>
              ));
            })()}
          </View>
        )}

        {/* Events this month */}
        {events.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>
              📌 {t('eventsThisMonth')}
            </Text>
            {events.map((e, i) => (
              <Card key={i} variant="outlined" style={[styles.listCard, { borderLeftColor: e.color, borderLeftWidth: 4 }]}>
                <View style={styles.listRow}>
                  <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{e.label}</Text>
                  <Badge label={`${t(MONTH_NAMES[month] as any)} ${e.day}`} variant="primary" size="small" />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  calendarRow: { flexDirection: 'row' },
  calendarCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', margin: 1 },
  eventDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 2 },
  calendarLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSquare: { width: 12, height: 12, borderRadius: 3 },
  legendDotLg: { width: 8, height: 8, borderRadius: 4 },
  section: { marginTop: 24 },
  listCard: { marginBottom: 8 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
