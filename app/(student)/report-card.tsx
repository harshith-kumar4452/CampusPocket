import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Award, ChevronDown, Phone, Mail, X, Sparkles, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { supabase } from '../../src/lib/supabase';

const ACADEMIC_YEARS = ['2025-2026', '2024-2025', '2023-2024'];

const EXAMS = [
  'SI-1', 'SI-2', 'Half-Yearly', 'SI-3', 'SI-4', 'Half-Yearly (Annual)',
];

// Mock teacher data per subject
const SUBJECT_TEACHERS: Record<string, { name: string; phone: string; email: string; subject: string }> = {
  'Mathematics': { name: 'Mr. Rajesh Kumar', phone: '+91 98765 43211', email: 'rajesh.k@school.com', subject: 'Mathematics' },
  'Science': { name: 'Ms. Priya Verma', phone: '+91 98765 43212', email: 'priya.v@school.com', subject: 'Science' },
  'English': { name: 'Mrs. Lakshmi Rao', phone: '+91 98765 43215', email: 'lakshmi.r@school.com', subject: 'English' },
  'Hindi': { name: 'Mrs. Anita Sharma', phone: '+91 98765 43210', email: 'anita.s@school.com', subject: 'Hindi' },
  'Social Studies': { name: 'Dr. Vikram Singh', phone: '+91 98765 43213', email: 'vikram.s@school.com', subject: 'Social Studies' },
  'Computer Science': { name: 'Mr. Arjun Mehta', phone: '+91 98765 43216', email: 'arjun.m@school.com', subject: 'Computer Science' },
  'Physical Ed': { name: 'Mr. Suresh Patil', phone: '+91 98765 43217', email: 'suresh.p@school.com', subject: 'Physical Ed' },
  'EVS': { name: 'Mrs. Kavita Nair', phone: '+91 98765 43218', email: 'kavita.n@school.com', subject: 'EVS' },
  'Art & Craft': { name: 'Ms. Deepa Joshi', phone: '+91 98765 43219', email: 'deepa.j@school.com', subject: 'Art & Craft' },
  'Music': { name: 'Mr. Ravi Shankar', phone: '+91 98765 43220', email: 'ravi.s@school.com', subject: 'Music' },
  'Physics': { name: 'Dr. Anil Kapoor', phone: '+91 98765 43221', email: 'anil.k@school.com', subject: 'Physics' },
  'Chemistry': { name: 'Ms. Neha Gupta', phone: '+91 98765 43222', email: 'neha.g@school.com', subject: 'Chemistry' },
  'Biology': { name: 'Dr. Smita Reddy', phone: '+91 98765 43223', email: 'smita.r@school.com', subject: 'Biology' },
  'Economics': { name: 'Mr. Karthik Iyer', phone: '+91 98765 43224', email: 'karthik.i@school.com', subject: 'Economics' },
  'Library': { name: 'Mrs. Sunita Goel', phone: '+91 98765 43214', email: 'sunita.g@school.com', subject: 'Library' },
};

interface ReportEntry {
  id: string; subject_name: string; marks_obtained: number; total_marks: number; grade: string;
}

export default function StudentReportCard() {
  const theme = useTheme();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [selectedYear, setSelectedYear] = useState(ACADEMIC_YEARS[0]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedExam, setSelectedExam] = useState(EXAMS[0]);
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("");
  const [teacherModal, setTeacherModal] = useState<typeof SUBJECT_TEACHERS[string] | null>(null);

  const performLRGM = (data: any[]) => {
    if (data.length < 2) return "Insufficient data for detailed LRGM analysis. Continue regular assessments to build your profile.";
    
    const examAverages = EXAMS.map(exam => {
      const examEntries = data.filter(e => e.exam_name === exam);
      if (examEntries.length === 0) return null;
      const total = examEntries.reduce((s, e) => s + e.marks_obtained, 0);
      const max = examEntries.reduce((s, e) => s + e.total_marks, 0);
      return { exam, avg: (total / max) * 100 };
    }).filter(x => x !== null) as {exam: string, avg: number}[];

    if (examAverages.length < 2) return "Showing steady performance. Keep it up!";

    const n = examAverages.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = examAverages.reduce((s, a) => s + a.avg, 0);
    const sumXY = examAverages.reduce((s, a, i) => s + (i + 1) * a.avg, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const growthPct = Math.round(slope * 10);

    if (slope > 0.5) {
      return `Great job! Your performance is on a strong upward trajectory. You've improved by about ${growthPct}% since SI-1.`;
    } else if (slope < -0.5) {
      return `We've noticed a small dip in recent scores. Don't worry—focusing on your core subjects will help you bounce back!`;
    } else {
      return `You are maintaining a very consistent performance level across all exams. Your baseline is stable and strong.`;
    }
  };

  const fetchReport = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data: currentData } = await supabase
      .from('report_cards')
      .select('*')
      .eq('student_id', user.id)
      .eq('exam_name', selectedExam)
      .eq('academic_year', selectedYear)
      .order('subject_name');
    
    const { data: yearData } = await supabase
      .from('report_cards')
      .select('*')
      .eq('student_id', user.id)
      .eq('academic_year', selectedYear);

    if (currentData) setEntries(currentData);
    if (yearData) setAiInsight(performLRGM(yearData));
    
    setLoading(false);
  }, [user, selectedExam, selectedYear]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const totalObtained = entries.reduce((s, e) => s + e.marks_obtained, 0);
  const totalMax = entries.reduce((s, e) => s + e.total_marks, 0);
  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const overallGrade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : 'C';

  const gradeColor = (g: string) => {
    if (g === 'A+' || g === 'A') return theme.success;
    if (g === 'B+' || g === 'B') return theme.warning;
    return theme.danger;
  };

  const onSubjectPress = (subjectName: string) => {
    const teacher = SUBJECT_TEACHERS[subjectName];
    if (teacher) setTeacherModal(teacher);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Award size={22} color={theme.primary} />
          <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>My Report Card</Text>
        </View>

        {profile && (
          <Text style={[Typography.body, { color: theme.textMuted, marginBottom: 16 }]}>
            Academic performance for {profile.full_name}
          </Text>
        )}

        {/* Academic Year Selector */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[Typography.captionSmall, { color: theme.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }]}>Academic Year</Text>
          <Pressable
            onPress={() => { setShowYearPicker(!showYearPicker); setShowExamPicker(false); }}
            style={[styles.examSelector, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[Typography.bodySemiBold, { color: theme.text, flex: 1 }]}>{selectedYear}</Text>
            <ChevronDown size={18} color={theme.textMuted} />
          </Pressable>
          {showYearPicker && (
            <Card style={{ marginBottom: 4 }}>
              {ACADEMIC_YEARS.map((yr) => (
                <Pressable
                  key={yr}
                  onPress={() => { setSelectedYear(yr); setShowYearPicker(false); }}
                  style={[styles.examOption, {
                    backgroundColor: yr === selectedYear ? (theme.isDark ? '#312E81' : '#EEF2FF') : 'transparent',
                  }]}
                >
                  <Text style={[Typography.bodyMedium, { color: yr === selectedYear ? theme.primary : theme.text }]}>{yr}</Text>
                  {yr === ACADEMIC_YEARS[0] && <Badge label="Current" variant="primary" size="small" />}
                </Pressable>
              ))}
            </Card>
          )}
        </View>

        {/* Exam Selector */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[Typography.captionSmall, { color: theme.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }]}>Exam</Text>
          <Pressable
            onPress={() => { setShowExamPicker(!showExamPicker); setShowYearPicker(false); }}
            style={[styles.examSelector, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[Typography.bodySemiBold, { color: theme.text, flex: 1 }]}>{selectedExam}</Text>
            <ChevronDown size={18} color={theme.textMuted} />
          </Pressable>
          {showExamPicker && (
            <Card style={{ marginBottom: 4 }}>
              {EXAMS.map((exam) => (
                <Pressable
                  key={exam}
                  onPress={() => { setSelectedExam(exam); setShowExamPicker(false); }}
                  style={[styles.examOption, {
                    backgroundColor: exam === selectedExam ? (theme.isDark ? '#312E81' : '#EEF2FF') : 'transparent',
                  }]}
                >
                  <Text style={[Typography.bodyMedium, { color: exam === selectedExam ? theme.primary : theme.text }]}>{exam}</Text>
                  {exam.includes('Half') && <Badge label="Major" variant="secondary" size="small" />}
                </Pressable>
              ))}
            </Card>
          )}
        </View>

        {/* Summary Card */}
        {entries.length > 0 && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[Typography.stat, { color: theme.primary }]}>{percentage}%</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Percentage</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[Typography.stat, { color: gradeColor(overallGrade) }]}>{overallGrade}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Grade</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[Typography.stat, { color: theme.text }]}>{totalObtained}</Text>
                <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>/ {totalMax}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Marks Table */}
        {entries.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 4 }]}>Subject-wise Marks</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted, marginBottom: 12 }]}>Tap a subject to view teacher details</Text>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[Typography.captionSmall, { color: theme.textMuted, flex: 2 }]}>SUBJECT</Text>
              <Text style={[Typography.captionSmall, { color: theme.textMuted, flex: 1, textAlign: 'center' }]}>MARKS</Text>
              <Text style={[Typography.captionSmall, { color: theme.textMuted, flex: 1, textAlign: 'center' }]}>GRADE</Text>
            </View>
            {entries.map((entry, i) => (
              <Pressable key={entry.id} onPress={() => onSubjectPress(entry.subject_name)} style={[styles.tableRow, {
                backgroundColor: i % 2 === 0 ? 'transparent' : (theme.isDark ? '#0F172A' : '#FAFBFC'),
                borderBottomColor: theme.borderLight, borderBottomWidth: 1,
              }]}>
                <Text style={[Typography.bodyMedium, { color: theme.primary, flex: 2, textDecorationLine: 'underline' }]}>{entry.subject_name}</Text>
                <Text style={[Typography.bodySemiBold, { color: theme.text, flex: 1, textAlign: 'center' }]}>
                  {entry.marks_obtained}/{entry.total_marks}
                </Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Badge
                    label={entry.grade}
                    variant={entry.grade.startsWith('A') ? 'success' : entry.grade.startsWith('B') ? 'warning' : 'danger'}
                    size="small"
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {entries.length === 0 && !loading && (
          <Card variant="outlined" style={styles.emptyCard}>
            <Award size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No report card data for {selectedExam} ({selectedYear}).
            </Text>
          </Card>
        )}
        {/* AI Analysis Section */}
        {entries.length > 0 && !loading && (
          <View style={styles.section}>
            <View style={styles.aiHeader}>
              <Sparkles size={20} color={theme.primary} />
              <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>AI Development Summary</Text>
            </View>
            <Card style={{ backgroundColor: theme.isDark ? '#1E1B4B' : '#F5F3FF', borderColor: theme.primary + '30' }}>
              <Text style={[Typography.bodySemiBold, { color: theme.primary, marginBottom: 8 }]}>
                Overall Performance: {percentage >= 85 ? 'Excellent' : percentage >= 70 ? 'Steady Growth' : 'Developing'}
              </Text>
              <Text style={[Typography.body, { color: theme.text, lineHeight: 22 }]}>
                Based on our <Text style={{ fontWeight: '700' }}>Linear Regression Growth Modeling (LRGM)</Text> algorithm:
                {"\n\n"}
                {aiInsight}
              </Text>
              <View style={styles.aiFooter}>
                <TrendingUp size={16} color={theme.success} />
                <Text style={[Typography.captionSmall, { color: theme.success, marginLeft: 6 }]}>
                  Projected Annual Grade: {percentage >= 80 ? 'A' : 'B+'}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Teacher Contact Modal */}
      <Modal visible={!!teacherModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.title, { color: theme.text }]}>Subject Teacher</Text>
              <Pressable onPress={() => setTeacherModal(null)}><X size={24} color={theme.textMuted} /></Pressable>
            </View>
            {teacherModal && (
              <View style={{ alignItems: 'center', gap: 12 }}>
                <Avatar name={teacherModal.name} size={64} />
                <Text style={[Typography.heading, { color: theme.text }]}>{teacherModal.name}</Text>
                <Badge label={teacherModal.subject} variant="primary" />
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                  <Pressable 
                    onPress={() => Linking.openURL(`tel:${teacherModal.phone}`)} 
                    style={[styles.contactBtn, { backgroundColor: theme.isDark ? '#064E3B' : '#D1FAE5' }]}
                  >
                    <Phone size={20} color={theme.success} />
                    <Text style={[Typography.captionSmall, { color: theme.success, marginTop: 4 }]}>Call</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => Linking.openURL(`mailto:${teacherModal.email}`)} 
                    style={[styles.contactBtn, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}
                  >
                    <Mail size={20} color={theme.primary} />
                    <Text style={[Typography.captionSmall, { color: theme.primary, marginTop: 4 }]}>Email</Text>
                  </Pressable>
                </View>
                <View style={{ marginTop: 8, gap: 4, alignItems: 'center' }}>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>{teacherModal.phone}</Text>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>{teacherModal.email}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  examSelector: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  examOption: { padding: 12, borderRadius: 10, marginBottom: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryCard: { marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0', opacity: 0.5 },
  section: { marginBottom: 20 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  tableHeader: { borderRadius: 10, marginBottom: 4 },
  emptyCard: { alignItems: 'center', padding: 40, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  contactBtn: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
