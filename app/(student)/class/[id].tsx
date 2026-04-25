import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, FileText, Download, CheckCircle, BookOpen, Clock, AlertCircle, Phone, Mail, X } from 'lucide-react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { useTheme } from '../../../src/hooks/useTheme';
import { Typography } from '../../../src/constants/typography';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Avatar } from '../../../src/components/ui/Avatar';
import { QuizView } from '../../../src/components/classroom/QuizView';

const SUBJECT_TEACHERS: Record<string, { phone: string; email: string }> = {
  'Mathematics': { phone: '+91 98765 43211', email: 'rajesh.k@school.com' },
  'Science': { phone: '+91 98765 43212', email: 'priya.v@school.com' },
  'English': { phone: '+91 98765 43215', email: 'lakshmi.r@school.com' },
  'Hindi': { phone: '+91 98765 43210', email: 'anita.s@school.com' },
  'Social Studies': { phone: '+91 98765 43213', email: 'vikram.s@school.com' },
};

export default function ClassDetails() {
  const { id, name, subject, teacher_name } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'syllabus' | 'resources' | 'assessments'>('syllabus');
  const [dbExams, setDbExams] = useState<any[]>([]);
  const [dbSyllabus, setDbSyllabus] = useState<any[]>([]);
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [reviewQuiz, setReviewQuiz] = useState<any | null>(null);
  const [showTeacher, setShowTeacher] = useState(false);

  const fetchData = React.useCallback(async () => {
      if (!user?.id || !subject) return;
      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('class_level')
          .eq('id', user.id)
          .single();
          
        if (profile?.class_level) {
          const classLevel = profile.class_level;
          // Normalize subject for NCERT lookup
          let searchSubject = String(subject).toUpperCase().trim();
          
          // Map common variations
          if (searchSubject === 'MATH') searchSubject = 'MATHEMATICS';
          if (searchSubject === 'SOCIAL STUDIES' || searchSubject === 'SOCIAL') searchSubject = 'SOCIAL SCIENCE';
          
          let examSearch = String(subject);
          if (examSearch === 'Mathematics') examSearch = 'Math';
          if (examSearch === 'Social Studies') examSearch = 'Social';

          // Fetch Exams
          const { data: exams } = await supabase
            .from('exam_schedules')
            .select('*')
            .eq('class_level', classLevel)
            .or(`subject_name.ilike.%${subject}%,subject_name.ilike.%${examSearch}%`)
            .order('exam_date', { ascending: true });

          const { data: history } = await supabase
            .from('student_assessments_history')
            .select('*')
            .eq('student_id', user.id)
            .eq('subject_name', subject)
            .order('created_at', { ascending: false });
            
          if (exams) {
            setDbExams(exams.map((e, index) => {
              const title = `Assignment ${index + 1}`;
              // Use the generated title to match since we save it under the generated title in QuizView
              const historyItem = history?.find(h => h.exam_name === title);
              return {
                title,
                originalTitle: e.exam_name, // Keep the original for tracking if needed
                dueDate: e.start_time ? `${e.exam_date} at ${e.start_time}` : e.exam_date,
                status: historyItem ? 'Completed' : (new Date(e.exam_date) < new Date() ? 'Pending' : 'Upcoming'),
                type: 'Quiz',
                score: historyItem?.score,
                total: historyItem?.total_questions,
                answers: historyItem?.answers
              };
            }));
          }

          // Fetch Syllabus
          // Try exact match first, then ilike
          const { data: syllabusData } = await supabase
            .from('syllabus_chapters')
            .select('*')
            .eq('class_level', classLevel)
            .or(`subject_name.ilike.${searchSubject},subject_name.ilike.%${searchSubject}%`)
            .order('chapter_number', { ascending: true });
          
          if (syllabusData && syllabusData.length > 0) {
            setDbSyllabus(syllabusData);
          }

          // Fetch Resources
          // For resources, we also check sub-categories like History/Geography if subject is Social Science
          let resourceQuery = supabase
            .from('subject_resources')
            .select('*')
            .eq('class_level', classLevel);
          
          if (searchSubject === 'SOCIAL SCIENCE') {
            resourceQuery = resourceQuery.or('subject_name.ilike.Social Science,subject_name.ilike.History,subject_name.ilike.Geography,subject_name.ilike.Civics');
          } else {
            resourceQuery = resourceQuery.ilike('subject_name', `%${searchSubject}%`);
          }

          const { data: resData } = await resourceQuery;
          if (resData) setDbResources(resData);
        }
      } catch (err) {
        console.error("Error fetching class data:", err);
      } finally {
        setLoading(false);
      }
  }, [user?.id, subject]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderTabContent = () => {
    if (loading) {
      return <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 40 }}>Loading data...</Text>;
    }

    switch (activeTab) {
      case 'syllabus':
        return (
          <View style={{ gap: 12 }}>
            {dbSyllabus.length > 0 ? dbSyllabus.map((item, index) => (
              <Card key={index} variant="outlined" style={styles.contentCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                      <BookOpen size={20} color={theme.primary} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]} numberOfLines={2}>
                        {item.chapter_number}. {item.title}
                      </Text>
                      <Text style={[Typography.caption, { color: theme.textMuted }]}>Chapter {item.chapter_number}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            )) : (
              <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No syllabus data found.</Text>
            )}
          </View>
        );
      case 'resources':
        return (
          <View style={{ gap: 12 }}>
            {dbResources.length > 0 ? dbResources.map((item, index) => (
              <Card key={index} variant="outlined" style={styles.contentCard}>
                <View style={styles.rowBetween}>
                  <View style={[styles.row, { flex: 1 }]}>
                    <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#78350F' : '#FEF3C7' }]}>
                      <FileText size={20} color={theme.warning} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[Typography.caption, { color: theme.textMuted }]}>{item.resource_type || 'Document'}</Text>
                    </View>
                  </View>
                  <Pressable 
                    onPress={async () => {
                      if (item.url) {
                        try {
                          await WebBrowser.openBrowserAsync(item.url);
                        } catch (err: any) {
                          alert('Cannot open URL: ' + err.message);
                        }
                      } else {
                        alert('No URL available for this resource.');
                      }
                    }}
                    style={[styles.downloadBtn, { backgroundColor: theme.surface }]}
                  >
                    <Download size={18} color={theme.primary} />
                  </Pressable>
                </View>
              </Card>
            )) : (
              <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No resources found.</Text>
            )}
          </View>
        );
      case 'assessments':
        if (activeQuiz) {
          return (
            <QuizView 
              examId={activeQuiz.title} 
              subject={String(subject)} 
              timeLimit={30} 
              onClose={() => {
                setActiveQuiz(null);
                // Trigger a re-fetch to update scores
                fetchData();
              }} 
            />
          );
        }
        if (reviewQuiz) {
          return (
            <QuizView 
              examId={reviewQuiz.title} 
              subject={String(subject)} 
              timeLimit={30} 
              isReviewMode={true}
              initialAnswers={reviewQuiz.answers || {}}
              onClose={() => setReviewQuiz(null)} 
            />
          );
        }
        return (
          <View style={{ gap: 12 }}>
            {dbExams.length > 0 ? (
              dbExams.map((item, index) => (
                <Pressable key={index} onPress={() => {
                   if (item.status === 'Completed') {
                     import('react-native').then(({ Alert }) => {
                       Alert.alert('Assignment Completed', 'What would you like to do?', [
                         { text: 'Cancel', style: 'cancel' },
                         { text: 'Review Analysis', onPress: () => setReviewQuiz(item) },
                         { text: 'Reattempt Quiz', onPress: () => setActiveQuiz(item) },
                       ]);
                     });
                   } else {
                     setActiveQuiz(item);
                   }
                }}>
                  <Card variant="outlined" style={styles.contentCard}>
                    <View style={styles.rowBetween}>
                      <View style={styles.row}>
                        <View style={[styles.iconBox, { backgroundColor: item.status === 'Pending' ? theme.dangerLight : item.status === 'Completed' ? theme.successLight : theme.surface }]}>
                          {item.status === 'Pending' ? <AlertCircle size={20} color={theme.danger} /> : 
                           item.status === 'Completed' ? <CheckCircle size={20} color={theme.success} /> : 
                           <Clock size={20} color={theme.textMuted} />}
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{item.title}</Text>
                          <Text style={[Typography.caption, { color: item.status === 'Pending' ? theme.danger : theme.textMuted }]}>
                            {item.type} • {item.status === 'Completed' && item.total ? `Score: ${item.score}/${item.total}` : item.dueDate}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Badge label={item.status} variant={item.status === 'Completed' ? 'success' : 'primary'} size="small" />
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))
            ) : (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Clock size={32} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 12 }}>No exams scheduled currently.</Text>
              </View>
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[Typography.title, { color: theme.text }]} numberOfLines={1}>{name || 'Class Details'}</Text>
            <Text style={[Typography.body, { color: theme.textMuted }]}>{subject || 'Subject Overview'}</Text>
          </View>
          
          <Button 
            title="Contact Teacher" 
            onPress={() => setShowTeacher(true)} 
            variant="outline" 
            size="small"
          />
        </View>

        {/* Custom Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
          {(['syllabus', 'resources', 'assessments'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: theme.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                Typography.bodySemiBold, 
                { color: activeTab === tab ? '#FFFFFF' : theme.textMuted, textTransform: 'capitalize' }
              ]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <View style={{ marginTop: 20 }}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Teacher Contact Modal */}
      <Modal visible={showTeacher} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.title, { color: theme.text }]}>Subject Teacher</Text>
              <Pressable onPress={() => setShowTeacher(false)}><X size={24} color={theme.textMuted} /></Pressable>
            </View>
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Avatar name={String(teacher_name || 'Teacher')} size={64} />
              <Text style={[Typography.heading, { color: theme.text }]}>{teacher_name || 'Class Teacher'}</Text>
              <Badge label={String(subject)} variant="primary" />
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                <Pressable 
                  onPress={() => Linking.openURL(`tel:${SUBJECT_TEACHERS[String(subject)]?.phone || '+91 9876500000'}`)} 
                  style={[styles.contactBtn, { backgroundColor: theme.isDark ? '#064E3B' : '#D1FAE5' }]}
                >
                  <Phone size={20} color={theme.success} />
                  <Text style={[Typography.captionSmall, { color: theme.success, marginTop: 4 }]}>Call</Text>
                </Pressable>
                <Pressable 
                  onPress={() => Linking.openURL(`mailto:${SUBJECT_TEACHERS[String(subject)]?.email || 'teacher@school.com'}`)} 
                  style={[styles.contactBtn, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}
                >
                  <Mail size={20} color={theme.primary} />
                  <Text style={[Typography.captionSmall, { color: theme.primary, marginTop: 4 }]}>Email</Text>
                </Pressable>
              </View>
              <View style={{ marginTop: 8, gap: 4, alignItems: 'center' }}>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>{SUBJECT_TEACHERS[String(subject)]?.phone || '+91 98765 00000'}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>{SUBJECT_TEACHERS[String(subject)]?.email || 'teacher@school.com'}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  contentCard: { padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  downloadBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  contactBtn: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
