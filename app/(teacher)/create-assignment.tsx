import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { ArrowLeft, Plus, Trash2, CheckCircle2, BrainCircuit } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useLanguage } from '../../src/context/LanguageContext';

type Question = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

export default function CreateAssignment() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [classLevel, setClassLevel] = useState('7');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (user?.id) {
      supabase.from('profiles').select('subject').eq('id', user.id).single().then(({ data }) => {
        if (data?.subject) setSubjectName(data.subject);
      });
    }
  }, [user]);

  const handleGenerateQuiz = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        Alert.alert('Missing API Key', 'Please provide your Gemini API key in the .env file (EXPO_PUBLIC_GEMINI_API_KEY) to use this feature.');
        return;
      }

      setIsGenerating(true);
      const fileUri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

      const prompt = "Analyze this chapter PDF. Generate exactly 20 comprehensive multiple-choice questions from it. Format your response STRICTLY as a JSON array where each element has: question (string), option_a (string), option_b (string), option_c (string), option_d (string), correct_answer (string, exactly A, B, C, or D). Return ONLY the JSON array, no markdown blocks, no code fences.";

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'application/pdf', data: base64 } }
            ]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const generatedQuestions = JSON.parse(text);
      if (questions.length === 1 && questions[0].question === '') {
        setQuestions(generatedQuestions);
      } else {
        setQuestions([...questions, ...generatedQuestions]);
      }
      Alert.alert('Success', `Successfully generated ${generatedQuestions.length} questions from the PDF!`);

    } catch (err: any) {
      Alert.alert('AI Error', err.message || 'Failed to generate quiz. Make sure the file is a valid PDF and the API key is correct.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleSubmit = async () => {
    if (!examName || !subjectName || !classLevel) {
      Alert.alert('Error', 'Please fill in all exam details.');
      return;
    }
    
    for (let i=0; i<questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d) {
        Alert.alert('Error', `Please fill all options for Question ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create Exam Schedule metadata
      const { data: examData, error: examError } = await supabase.from('exam_schedules').insert({
        exam_name: examName,
        exam_type: 'Assignment',
        class_level: parseInt(classLevel),
        subject_name: subjectName,
        exam_date: examDate,
        total_marks: questions.length,
        teacher_id: user?.id
      }).select().single();

      if (examError) throw examError;

      // 2. Insert Questions
      const mcqPayload = questions.map(q => ({
        class_level: parseInt(classLevel),
        subject_name: subjectName,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        source: examName // Using source to tag the assignment name
      }));

      const { error: mcqError } = await supabase.from('mcq_questions').insert(mcqPayload);
      
      if (mcqError) throw mcqError;

      // 3. Post to classroom stream if class_id was provided
      if (params.class_id) {
        await supabase.from('class_stream').insert({
          class_id: params.class_id,
          teacher_id: user?.id,
          content: `New Assignment: ${examName} for ${subjectName} has been posted. Date: ${examDate}`,
          type: 'announcement'
        });
      }

      Alert.alert('Success', 'Assignment created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={[Typography.title, { color: theme.text, marginLeft: 16 }]}>{t('createAssignment')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Exam Details Section */}
        <View style={styles.section}>
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 16 }]}>{t('details')}</Text>
          <Card variant="outlined" style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('assignmentName')}</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={examName}
                onChangeText={setExamName}
                placeholder="e.g. Chapter 1 Quiz"
                placeholderTextColor={theme.border}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('subjectAutoProfile')}</Text>
              <TextInput
                style={[styles.input, { color: theme.textMuted, borderColor: theme.border, backgroundColor: theme.borderLight }]}
                value={subjectName}
                editable={false}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('classLevel')}</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  value={classLevel}
                  onChangeText={setClassLevel}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('datePlaceholder')}</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  value={examDate}
                  onChangeText={setExamDate}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Questions Section */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[Typography.heading, { color: theme.text }]}>{t('questions')} ({questions.length})</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button 
                title={t('aiAutoGenerate')} 
                variant="outline" 
                size="small" 
                loading={isGenerating}
                icon={<BrainCircuit size={16} color={theme.primary} />}
                onPress={handleGenerateQuiz}
              />
              <Button 
                title={t('addQ')} 
                variant="outline" 
                size="small" 
                icon={<Plus size={16} color={theme.primary} />}
                onPress={addQuestion}
              />
            </View>
          </View>

          {questions.map((q, index) => (
            <Card key={index} variant="elevated" style={[styles.card, { marginTop: 16 }]}>
              <View style={styles.rowBetween}>
                <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>{t('question')} {index + 1}</Text>
                {questions.length > 1 && (
                  <Pressable onPress={() => removeQuestion(index)}>
                    <Trash2 size={18} color={theme.error} />
                  </Pressable>
                )}
              </View>
              
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, marginTop: 12, minHeight: 60 }]}
                value={q.question}
                onChangeText={(val) => updateQuestion(index, 'question', val)}
                placeholder={t('enterQuestionText')}
                placeholderTextColor={theme.border}
                multiline
              />

              <View style={styles.optionsContainer}>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <View key={opt} style={styles.optionRow}>
                    <Pressable 
                      style={[styles.radio, q.correct_answer === opt && { borderColor: theme.success }]}
                      onPress={() => updateQuestion(index, 'correct_answer', opt)}
                    >
                      {q.correct_answer === opt && <View style={[styles.radioInner, { backgroundColor: theme.success }]} />}
                    </Pressable>
                    <TextInput
                      style={[styles.inputOption, { color: theme.text, borderColor: theme.border }]}
                      value={q[`option_${opt.toLowerCase()}` as keyof Question]}
                      onChangeText={(val) => updateQuestion(index, `option_${opt.toLowerCase()}` as keyof Question, val)}
                      placeholder={`${t('option')} ${opt}`}
                      placeholderTextColor={theme.border}
                    />
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>

        <Button 
          title={t('publishAssignment')} 
          variant="primary" 
          size="large" 
          loading={loading}
          icon={<CheckCircle2 size={20} color="#FFF" />}
          style={{ marginTop: 24 }}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  section: { marginBottom: 24 },
  card: { padding: 16, gap: 12 },
  inputGroup: { gap: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionsContainer: { marginTop: 16, gap: 12 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  inputOption: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular' }
});
