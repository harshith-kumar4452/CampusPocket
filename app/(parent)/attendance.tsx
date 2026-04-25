import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarCheck, Check, X as XIcon, Clock, FileText, Send, X } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useAttendance } from '../../src/hooks/useAttendance';

// Pie Chart (pure RN)
function PieChart({ present, absent, late, size = 160, theme }: any) {
  const total = present + absent + late;
  if (total === 0) {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 3, borderColor: theme.borderLight,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={[Typography.caption, { color: theme.textMuted }]}>No data</Text>
        </View>
      </View>
    );
  }

  const presentPct = (present / total) * 100;
  const absentPct = (absent / total) * 100;
  const latePct = (late / total) * 100;

  const segments = [
    { pct: presentPct, color: '#10B981', label: 'Present', count: present },
    { pct: absentPct, color: '#EF4444', label: 'Absent', count: absent },
    { pct: latePct, color: '#F59E0B', label: 'Late', count: late },
  ];

  let rotation = 0;

  return (
    <View style={{ alignItems: 'center', gap: 20 }}>
      <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: theme.borderLight, position: 'absolute',
        }} />
        {segments.map((seg, i) => {
          const currentRotation = rotation;
          rotation += (seg.pct / 100) * 360;
          if (seg.pct === 0) return null;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: size, height: size, borderRadius: size / 2,
                borderWidth: size / 4,
                borderColor: 'transparent',
                borderTopColor: seg.color,
                borderRightColor: seg.pct > 25 ? seg.color : 'transparent',
                borderBottomColor: seg.pct > 50 ? seg.color : 'transparent',
                borderLeftColor: seg.pct > 75 ? seg.color : 'transparent',
                transform: [{ rotate: `${currentRotation}deg` }],
              }}
            />
          );
        })}
        <View style={{
          position: 'absolute',
          width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25,
          backgroundColor: theme.background,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={[Typography.stat, { color: theme.text }]}>{Math.round(presentPct)}%</Text>
          <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Present</Text>
        </View>
      </View>

      {/* Legend cards */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {segments.map((seg, i) => (
          <View key={i} style={[styles.legendCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <View style={[styles.legendColorBar, { backgroundColor: seg.color }]} />
            <Text style={[Typography.heading, { color: theme.text }]}>{seg.count}</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>{seg.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ParentAttendance() {
  const theme = useTheme();
  const { selectedChild } = useAuth();
  const { attendance, stats, loading, refetch } = useAttendance(selectedChild?.id);
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
    if (!leaveReason.trim() || !leaveDates.trim()) {
      Alert.alert('Missing Info', 'Please fill in both dates and reason.');
      return;
    }
    Alert.alert('Leave Request Sent ✅', `Leave request for ${leaveDates} has been submitted.`);
    setLeaveModalVisible(false);
    setLeaveReason('');
    setLeaveDates('');
  };

  // Group attendance by date for the calendar
  const dailyStatus = attendance.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) acc[date] = { date, records: [] };
    acc[date].records.push(record);
    return acc;
  }, {} as Record<string, { date: string; records: any[] }>);

  const selectedDayData = selectedDateStr ? dailyStatus[selectedDateStr] : null;

  // Group attendance by month
  const grouped = attendance.reduce((acc, record) => {
    const d = new Date(record.date);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[month]) acc[month] = [];
    acc[month].push(record);
    return acc;
  }, {} as Record<string, typeof attendance>);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check size={16} color={theme.success} />;
      case 'absent': return <XIcon size={16} color={theme.danger} />;
      case 'late': return <Clock size={16} color={theme.warning} />;
      default: return null;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'present': return 'success' as const;
      case 'absent': return 'danger' as const;
      case 'late': return 'warning' as const;
      default: return 'muted' as const;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View>
          <Text style={[Typography.title, { color: theme.text }]}>Attendance</Text>
          {selectedChild && (
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
              {selectedChild.full_name}'s attendance record
            </Text>
          )}
        </View>

        {/* Pie Chart */}
        <View style={styles.section}>
          <Card>
            <PieChart
              present={stats.present}
              absent={stats.absent}
              late={stats.late}
              theme={theme}
            />
          </Card>
        </View>

        {/* Leave Request Button */}
        <View style={styles.section}>
          <Pressable
            onPress={() => setLeaveModalVisible(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.leaveBtn}
            >
              <FileText size={20} color="#FFFFFF" />
              <Text style={styles.leaveBtnText}>Request Leave</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Overview Card */}
        <View style={styles.section}>
          <Card style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.primary }]}>{stats.percentage}%</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Overall</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.success }]}>{stats.present}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Present</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.danger }]}>{stats.absent}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Absent</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.warning }]}>{stats.late}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Late</Text>
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <ProgressBar
                progress={stats.percentage}
                color={stats.percentage >= 75 ? theme.success : theme.danger}
                height={10}
              />
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

        {/* Attendance Records by Month */}
        {Object.entries(grouped).map(([month, records]) => (
          <View key={month}>
            <Text style={[Typography.heading, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>
              {month}
            </Text>
            {records.map((record) => (
              <Card key={record.id} variant="outlined" style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={[styles.statusDot, {
                    backgroundColor: record.status === 'present' ? theme.successLight :
                      record.status === 'absent' ? theme.dangerLight : theme.warningLight,
                  }]}>
                    {statusIcon(record.status)}
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={[Typography.bodyMedium, { color: theme.text }]}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </Text>
                    <Text style={[Typography.caption, { color: theme.textMuted }]}>
                      {record.class?.name || 'Class'}
                    </Text>
                  </View>
                  <Badge
                    label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    variant={statusVariant(record.status)}
                    size="small"
                  />
                </View>
              </Card>
            ))}
          </View>
        ))}

        {attendance.length === 0 && !loading && (
          <Card variant="outlined" style={styles.emptyCard}>
            <CalendarCheck size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No attendance records yet.{'\n'}They'll appear here once marked.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Leave Request Modal */}
      <Modal visible={leaveModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setLeaveModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.heading, { color: theme.text }]}>Request Leave</Text>
              <Pressable onPress={() => setLeaveModalVisible(false)}>
                <X size={22} color={theme.textMuted} />
              </Pressable>
            </View>

            <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 16, marginBottom: 6 }]}>
              DATES (e.g., May 5 - May 7)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={leaveDates}
              onChangeText={setLeaveDates}
              placeholder="Enter leave dates..."
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 16, marginBottom: 6 }]}>
              REASON
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={leaveReason}
              onChangeText={setLeaveReason}
              placeholder="Why is the leave needed..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Pressable onPress={handleLeaveSubmit} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <LinearGradient
                colors={theme.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Submit Request</Text>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  section: { marginTop: 16 },
  overviewCard: { marginTop: 0 },
  overviewRow: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
  },
  overviewStat: { alignItems: 'center' },
  overviewDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0', opacity: 0.5 },
  legendCard: {
    flex: 1, borderRadius: 14, padding: 12,
    alignItems: 'center', borderWidth: 1,
  },
  legendColorBar: {
    width: '80%', height: 4, borderRadius: 2, marginBottom: 8,
  },
  recordCard: { marginBottom: 8 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  recordInfo: { flex: 1, gap: 2 },
  emptyCard: { alignItems: 'center', padding: 40, marginTop: 40 },
  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 10,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  leaveBtnText: { ...Typography.button, color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  textArea: { height: 100 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, marginTop: 20,
  },
  submitText: { ...Typography.button, color: '#FFFFFF' },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarCell: { width: '13%', alignItems: 'center', paddingVertical: 4 },
});
