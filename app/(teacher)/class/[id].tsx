import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Pressable, 
  TextInput,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useTheme } from '../../../src/hooks/useTheme';
import { Typography } from '../../../src/constants/typography';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp,
  Plus,
  Send,
  MoreVertical,
  UserPlus,
  FileText,
  BarChart2
} from 'lucide-react-native';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useAuth } from '../../../src/context/AuthContext';
import { useLanguage } from '../../../src/context/LanguageContext';
import { TranslatablePost } from '../../../src/components/ui/TranslatablePost';

type TabType = 'stream' | 'attendance' | 'students' | 'grades' | 'analysis';

export default function ClassDetails() {
  const { id, name, subject } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<TabType>('stream');
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<any[]>([]);
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stream') {
        const { data } = await supabase
          .from('class_stream')
          .select('*')
          .eq('class_id', id)
          .order('created_at', { ascending: false });
        if (data) setStream(data);
      } else if (activeTab === 'students' || activeTab === 'attendance') {
        // Fetch students linked to this class
        const { data, error } = await supabase
          .from('student_classes')
          .select('student_id, profiles!student_id(id, full_name, email)')
          .eq('class_id', id);
        
        if (data) {
          const studentList = data.map(item => item.profiles);
          setStudents(studentList);
          
          if (activeTab === 'attendance') {
            // Check if attendance already exists for today
            const { data: existingAtt } = await supabase
              .from('attendance')
              .select('student_id, status')
              .eq('date', attendanceDate)
              .in('student_id', studentList.map(s => s.id));
              
            const initialAttendance: Record<string, boolean> = {};
            studentList.forEach(s => initialAttendance[s.id] = true); // Default all present
            existingAtt?.forEach(att => {
              initialAttendance[att.student_id] = att.status === 'present';
            });
            setAttendanceData(initialAttendance);
          }
        }
      } else if (activeTab === 'grades') {
        const { data, error } = await supabase
          .from('student_assessments_history')
          .select('*, profiles!student_id(full_name)')
          .eq('subject_name', subject)
          .order('created_at', { ascending: false });
          
        if (data) {
          // Store grades in stream state or a dedicated state. Let's reuse stream state for simplicity since tabs are exclusive.
          setStream(data);
        }
      }
    } catch (err) {
      console.error('Error fetching class data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, activeTab]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled === false) {
        setAttachment(result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !attachment) return;
    if (!user) return;
    setIsPosting(true);
    try {
      let attachmentUrl = null;
      let attachmentName = null;

      if (attachment && attachment.assets && attachment.assets.length > 0) {
        const file = attachment.assets[0];
        attachmentName = file.name;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;
        
        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
        
        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('class_materials')
          .upload(filePath, decodeURIComponent(escape(atob(base64))), {
            contentType: file.mimeType || 'application/octet-stream',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('class_materials')
          .getPublicUrl(filePath);
          
        attachmentUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('class_stream').insert({
        class_id: id,
        teacher_id: user.id,
        content: newPost,
        type: attachment ? 'material' : 'announcement',
        attachment_url: attachmentUrl,
        attachment_name: attachmentName
      });
      
      if (error) throw error;
      setNewPost('');
      setAttachment(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post announcement');
    } finally {
      setIsPosting(false);
    }
  };

  const saveAttendance = async () => {
    try {
      const attendancePayload = Object.entries(attendanceData).map(([studentId, isPresent]) => ({
        student_id: studentId,
        date: attendanceDate,
        status: isPresent ? 'present' : 'absent',
        subject: subject as string
      }));

      // In real scenario, we'd upsert based on (student_id, date, subject)
      const { error } = await supabase.from('attendance').upsert(attendancePayload, {
        onConflict: 'student_id,date,subject'
      });
      
      if (error) throw error;
      Alert.alert('Success', 'Attendance saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  const renderStream = () => (
    <View style={styles.tabContent}>
      <Card variant="elevated" style={styles.postInputCard}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={t('announcePlaceholder')}
          placeholderTextColor={theme.textMuted}
          multiline
          value={newPost}
          onChangeText={setNewPost}
        />
        {attachment && attachment.assets && attachment.assets.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary + '15', padding: 8, borderRadius: 8, marginTop: 8 }}>
            <FileText size={16} color={theme.primary} />
            <Text style={[Typography.caption, { color: theme.primary, marginLeft: 8, flex: 1 }]} numberOfLines={1}>
              {attachment.assets[0].name}
            </Text>
            <Pressable onPress={() => setAttachment(null)}>
              <Text style={{ color: theme.error, fontSize: 12, fontWeight: 'bold' }}>X</Text>
            </Pressable>
          </View>
        )}
        <View style={[styles.postActions, { justifyContent: 'space-between', flexDirection: 'row', marginTop: 12 }]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={pickDocument} style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
              <Plus size={20} color={theme.primary} />
              <Text style={[Typography.bodySemiBold, { color: theme.primary, marginLeft: 4 }]}>{t('file')}</Text>
            </Pressable>
            <Pressable 
              onPress={() => router.push({
                pathname: '/(teacher)/create-assignment',
                params: { class_id: id, class_level: name?.toString().match(/\d+/)?.[0] || '7' }
              })} 
              style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
            >
              <FileText size={20} color={theme.success} />
              <Text style={[Typography.bodySemiBold, { color: theme.success, marginLeft: 4 }]}>{t('assessment')}</Text>
            </Pressable>
          </View>
          <Button 
            title={t('post')} 
            variant="primary" 
            size="small" 
            loading={isPosting}
            icon={<Send size={16} color="#FFF" />}
            onPress={handlePost}
          />
        </View>
      </Card>

      {stream.map((item) => (
        <Card key={item.id} variant="outlined" style={styles.streamCard}>
          <View style={styles.streamHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
              <Text style={{ color: theme.primary }}>T</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[Typography.bodySemiBold, { color: theme.text }]}>Dr. Shalini Sharma</Text>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <MoreVertical size={20} color={theme.textMuted} />
          </View>
          <TranslatablePost 
            content={item.content} 
            attachmentUrl={item.attachment_url} 
            attachmentName={item.attachment_name} 
          />
        </Card>
      ))}
    </View>
  );

  const renderAttendance = () => (
    <View style={styles.tabContent}>
      <View style={styles.attendanceHeader}>
        <Text style={[Typography.heading, { color: theme.text }]}>{t('todaysAttendance')}</Text>
        <Text style={[Typography.caption, { color: theme.textMuted }]}>{attendanceDate}</Text>
      </View>
      
      {students.map((student) => (
        <Card key={student.id} variant="outlined" style={styles.studentItem}>
          <Text style={[Typography.bodySemiBold, { color: theme.text, flex: 1 }]}>{student.full_name}</Text>
          <View style={styles.attendanceButtons}>
            <Pressable 
              onPress={() => setAttendanceData(prev => ({ ...prev, [student.id]: true }))}
              style={[
                styles.attBtn, 
                { backgroundColor: attendanceData[student.id] ? theme.success + '20' : theme.surface }
              ]}
            >
              <Text style={{ color: attendanceData[student.id] ? theme.success : theme.textMuted }}>P</Text>
            </Pressable>
            <Pressable 
              onPress={() => setAttendanceData(prev => ({ ...prev, [student.id]: false }))}
              style={[
                styles.attBtn, 
                { backgroundColor: !attendanceData[student.id] ? theme.error + '20' : theme.surface }
              ]}
            >
              <Text style={{ color: !attendanceData[student.id] ? theme.error : theme.textMuted }}>A</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      
      <Button title={t('saveAttendance')} variant="primary" onPress={saveAttendance} style={{ marginTop: 24 }} />
    </View>
  );

  const renderStudents = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[Typography.heading, { color: theme.text }]}>{students.length} {t('students')}</Text>
        <Button 
          title={t('invite')} 
          variant="outline" 
          size="small" 
          icon={<UserPlus size={16} color={theme.primary} />}
        />
      </View>
      
      {students.map((student) => (
        <Card key={student.id} variant="outlined" style={styles.studentItem}>
          <View style={[styles.avatar, { backgroundColor: theme.borderLight }]}>
            <Text style={{ color: theme.text }}>{student.full_name?.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{student.full_name}</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>{student.email}</Text>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderGrades = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[Typography.heading, { color: theme.text }]}>{t('assessmentResults')}</Text>
      </View>
      
      {grades.length > 0 ? grades.map((grade) => (
        <Card key={grade.id} variant="outlined" style={styles.studentItem}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{grade.profiles?.full_name || 'Unknown Student'}</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>{grade.exam_name}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }]}>
            <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>
              {grade.score} / {grade.total_questions}
            </Text>
          </View>
        </Card>
      )) : (
        <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 20 }}>{t('noAssessmentResults')}</Text>
      )}
    </View>
  );

  const renderAnalysis = () => {
    const avgScore = grades.length > 0 
      ? (grades.reduce((acc, g) => acc + (parseFloat(g.score) / parseFloat(g.total_questions || '1')), 0) / grades.length * 100).toFixed(1)
      : '0';

    return (
      <View style={{ gap: 24 }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Card variant="elevated" style={{ flex: 1, padding: 16, alignItems: 'center' }}>
            <TrendingUp size={24} color={theme.success} />
            <Text style={[Typography.title, { color: theme.text, marginTop: 8 }]}>{avgScore}%</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('avgPerformance')}</Text>
          </Card>
          <Card variant="elevated" style={{ flex: 1, padding: 16, alignItems: 'center' }}>
            <CheckCircle2 size={24} color={theme.primary} />
            <Text style={[Typography.title, { color: theme.text, marginTop: 8 }]}>85%</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('attendanceRate')}</Text>
          </Card>
        </View>

        <Card variant="elevated" style={{ padding: 20 }}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 16 }]}>{t('performanceTrend')}</Text>
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.borderLight, borderRadius: 12 }}>
            <BarChart2 size={48} color={theme.border} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12 }]}>{t('visualAnalyticsSoon')}</Text>
          </View>
        </Card>

        <Card variant="elevated" style={{ padding: 20 }}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 16 }]}>{t('studentParticipation')}</Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[Typography.body, { color: theme.text }]}>{t('activeInStream')}</Text>
              <Text style={[Typography.bodySemiBold, { color: theme.success }]}>{t('high')}</Text>
            </View>
            <View style={{ height: 4, backgroundColor: theme.borderLight, borderRadius: 2 }}>
              <View style={{ width: '85%', height: '100%', backgroundColor: theme.success, borderRadius: 2 }} />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={[Typography.body, { color: theme.text }]}>{t('assignmentCompletion')}</Text>
              <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>72%</Text>
            </View>
            <View style={{ height: 4, backgroundColor: theme.borderLight, borderRadius: 2 }}>
              <View style={{ width: '72%', height: '100%', backgroundColor: theme.primary, borderRadius: 2 }} />
            </View>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[Typography.title, { color: theme.text }]} numberOfLines={1}>{name}</Text>
          <Text style={[Typography.caption, { color: theme.textMuted }]}>{subject}</Text>
        </View>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: theme.borderLight }]}>
        <TabItem id="stream" icon={MessageSquare} label={t('stream')} active={activeTab === 'stream'} onPress={setActiveTab} color={theme.primary} />
        <TabItem id="attendance" icon={CheckCircle2} label={t('attendance')} active={activeTab === 'attendance'} onPress={setActiveTab} color={theme.success} />
        <TabItem id="students" icon={Users} label={t('students')} active={activeTab === 'students'} onPress={setActiveTab} color={theme.warning} />
        <TabItem id="grades" icon={TrendingUp} label={t('grades')} active={activeTab === 'grades'} onPress={setActiveTab} color={theme.error} />
        <TabItem id="analysis" icon={BarChart2} label={t('analysis')} active={activeTab === 'analysis'} onPress={setActiveTab} color={theme.info || theme.primary} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={theme.primary} />}
      >
        {activeTab === 'stream' && renderStream()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'grades' && renderGrades()}
        {activeTab === 'analysis' && renderAnalysis()}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabItem({ id, icon: Icon, label, active, onPress, color }: any) {
  const theme = useTheme();
  return (
    <Pressable 
      onPress={() => onPress(id)} 
      style={[styles.tabItem, active && { borderBottomWidth: 2, borderBottomColor: color }]}
    >
      <Icon size={20} color={active ? color : theme.textMuted} />
      <Text style={[
        Typography.captionSmall, 
        { color: active ? color : theme.textMuted, marginTop: 4, fontWeight: active ? '600' : '400' }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 10 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  tabContent: { gap: 16 },
  postInputCard: { padding: 16, gap: 12 },
  input: { fontSize: 15, fontFamily: 'Inter_400Regular', minHeight: 60, textAlignVertical: 'top' },
  postActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  streamCard: { padding: 16 },
  streamHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  attendanceHeader: { marginBottom: 8 },
  studentItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  attendanceButtons: { flexDirection: 'row', gap: 8 },
  attBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }
});
