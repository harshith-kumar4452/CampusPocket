import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Modal, TextInput, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { Check, X, Clock, CalendarCheck } from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useAttendance } from '../../src/hooks/useAttendance';

const { width: screenWidth } = Dimensions.get('window');

export default function StudentAttendance() {
  const theme = useTheme();
  const { user } = useAuth();
  const { attendance, stats, loading, refetch } = useAttendance(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDates, setLeaveDates] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLeaveSubmit = () => {
    if (!leaveReason || !leaveDates) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    Alert.alert('Success', 'Leave request submitted to mentor.');
    setLeaveModalVisible(false);
    setLeaveReason('');
    setLeaveDates('');
  };

  const attendanceChartData = [
    { name: 'Present', population: stats.present, color: theme.success, legendFontColor: theme.textMuted },
    { name: 'Absent', population: stats.absent, color: theme.danger, legendFontColor: theme.textMuted },
    { name: 'Late', population: stats.late, color: theme.warning, legendFontColor: theme.textMuted },
  ].filter(d => d.population > 0);

  const dailyStatus = attendance.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) acc[date] = { date, records: [] };
    acc[date].records.push(record);
    return acc;
  }, {} as Record<string, { date: string; records: any[] }>);

  const sortedDates = Object.values(dailyStatus).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedByMonth = sortedDates.reduce((acc, day) => {
    const d = new Date(day.date);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[month]) acc[month] = [];
    acc[month].push(day);
    return acc;
  }, {} as Record<string, typeof sortedDates>);

  const selectedDayData = selectedDateStr ? dailyStatus[selectedDateStr] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View >
          <Text style={[Typography.title, { color: theme.text }]}>Attendance Streak</Text>
          <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
            Maintain your presence to keep the fire burning! 🔥
          </Text>
        </View>

        <View >
          <Card style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.primary }]}>{stats.percentage}%</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Reliability</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={{ fontSize: 24 }}>🔥</Text>
                <Text style={[Typography.stat, { color: theme.success }]}>
                  {sortedDates.filter(d => d.records.every(r => r.status === 'present')).length}
                </Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Perfect Days</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={{ fontSize: 24 }}>😢</Text>
                <Text style={[Typography.stat, { color: theme.danger }]}>
                  {sortedDates.filter(d => d.records.some(r => r.status === 'absent')).length}
                </Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Missed</Text>
              </View>
            </View>
            <ProgressBar
              progress={stats.percentage}
              color={stats.percentage >= 75 ? theme.success : theme.danger}
              style={{ marginTop: 16 }}
            />
            {stats.total > 0 && (
              <View style={{ alignItems: 'center', marginTop: 16 }}>
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
            )}
            <View style={{ marginTop: 16 }}>
              <Button title="Request Leave" onPress={() => setLeaveModalVisible(true)} variant="outline" icon={<CalendarCheck size={18} color={theme.primary} />} />
            </View>
          </Card>
        </View>

        {/* Interactive Calendar Section */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>📅 Calendar Overview</Text>
          <Card>
            <Text style={[Typography.bodySemiBold, { color: theme.text, textAlign: 'center', marginBottom: 12 }]}>{currentMonthName}</Text>
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
                    const dayRecords = dailyStatus[dateStr]?.records || [];
                    
                    let emoji = null;
                    if (dayRecords.length > 0) {
                      const allPresent = dayRecords.every(r => r.status === 'present');
                      const anyAbsent = dayRecords.some(r => r.status === 'absent');
                      emoji = allPresent ? '🔥' : anyAbsent ? '😢' : '😐';
                    }

                    const isToday = d === today.getDate();
                    const isSelected = selectedDateStr === dateStr;

                    cells.push(
                      <Pressable 
                        key={col} 
                        style={[
                          styles.calendarCell,
                          isToday && { backgroundColor: theme.primary + '15', borderRadius: 8 },
                          isSelected && { borderColor: theme.primary, borderWidth: 1, borderRadius: 8 }
                        ]}
                        onPress={() => setSelectedDateStr(dateStr)}
                      >
                        <Text style={[
                          Typography.caption, 
                          { color: isToday ? theme.primary : theme.textMuted, fontWeight: isToday ? 'bold' : 'normal' }
                        ]}>
                          {d}
                        </Text>
                        <Text style={{ fontSize: 16, marginTop: 2 }}>{emoji || ' '}</Text>
                      </Pressable>
                    );
                    dayCounter++;
                  }
                }
                rows.push(<View key={row} style={styles.calendarRow}>{cells}</View>);
                if (dayCounter > daysInMonth) break;
              }
              return rows;
            })()}
          </Card>
        </View>

        {/* Selected Day Details */}
        {selectedDayData && (
          <View style={styles.section}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>
              Details for {new Date(selectedDateStr!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <Card>
              <Text style={[Typography.bodySemiBold, { color: theme.text, marginBottom: 8 }]}>
                {selectedDayData.records.filter(r => r.status === 'present').length} classes present out of {selectedDayData.records.length}
              </Text>
              {selectedDayData.records.map((r, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i < selectedDayData.records.length - 1 ? 1 : 0, borderBottomColor: theme.borderLight }}>
                  <Text style={[Typography.body, { color: theme.text }]}>{r.class?.name || 'Class'}</Text>
                  <Badge 
                    label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} 
                    variant={r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : 'warning'} 
                    size="small" 
                  />
                </View>
              ))}
            </Card>
          </View>
        )}

        {Object.entries(groupedByMonth).map(([month, days], idx) => (
          <View key={month}>
            <Text style={[Typography.heading, { color: theme.text, marginTop: 24, marginBottom: 12 }]}>
              {month}
            </Text>
            {days.map((day) => {
              const allPresent = day.records.every(r => r.status === 'present');
              const anyAbsent = day.records.some(r => r.status === 'absent');
              const emoji = allPresent ? '🔥' : anyAbsent ? '😢' : '😐';
              const statusColor = allPresent ? theme.success : anyAbsent ? theme.danger : theme.warning;
              
              return (
                <Card key={day.date} variant="outlined" style={styles.recordCard}>
                  <View style={styles.recordRow}>
                    <View style={[styles.statusIcon, { backgroundColor: statusColor + '15' }]}>
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]}>
                        {(() => {
                          const d = new Date(day.date);
                          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
                        })()}
                      </Text>
                      <Text style={[Typography.caption, { color: theme.textMuted }]}>
                        {day.records.length} Classes • {allPresent ? 'Perfect Attendance!' : anyAbsent ? 'Missed some classes' : 'Partial Attendance'}
                      </Text>
                    </View>
                    <Badge 
                      label={allPresent ? 'PERFECT' : anyAbsent ? 'MISSED' : 'PARTIAL'} 
                      variant={allPresent ? 'success' : anyAbsent ? 'danger' : 'warning'} 
                      size="small" 
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        ))}

        {attendance.length === 0 && !loading && (
          <Card variant="outlined" style={styles.emptyCard}>
            <CalendarCheck size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No attendance records found.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Leave Request Modal */}
      <Modal visible={leaveModalVisible} animationType="slide" transparent={true} onRequestClose={() => setLeaveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.title, { color: theme.text }]}>Request Leave</Text>
              <Button title="✕" onPress={() => setLeaveModalVisible(false)} variant="ghost" size="small" />
            </View>
            <View style={styles.modalBody}>
              <Text style={[Typography.bodySemiBold, { color: theme.text, marginBottom: 8 }]}>Date(s)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Oct 20 - Oct 22"
                placeholderTextColor={theme.textMuted}
                value={leaveDates}
                onChangeText={setLeaveDates}
              />
              <Text style={[Typography.bodySemiBold, { color: theme.text, marginTop: 16, marginBottom: 8 }]}>Reason</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Please state your reason for leave..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                value={leaveReason}
                onChangeText={setLeaveReason}
              />
            </View>
            <View style={styles.modalFooter}>
              <Button title="Cancel" onPress={() => setLeaveModalVisible(false)} variant="outline" style={{ flex: 1 }} />
              <Button title="Submit Request" onPress={handleLeaveSubmit} variant="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  overviewCard: {
    marginTop: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  recordCard: {
    marginBottom: 8,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  section: { marginTop: 16 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarCell: { width: '13%', alignItems: 'center', paddingVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalBody: { marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, fontFamily: 'Inter_400Regular' },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalFooter: { flexDirection: 'row', gap: 12 },
});
