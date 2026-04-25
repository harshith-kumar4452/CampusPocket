import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Button } from '../ui/Button';

type Question = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

interface QuizViewProps {
  examId: string;
  subject: string;
  timeLimit: number; // in minutes
  onClose: () => void;
  isReviewMode?: boolean;
  initialAnswers?: Record<string, string>;
}

export function QuizView({ examId, subject, timeLimit, onClose, isReviewMode = false, initialAnswers = {} }: QuizViewProps) {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(isReviewMode);
  const [score, setScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);

  useEffect(() => {
    async function fetchQuestions() {
      if (!user?.id || !subject) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('class_level')
          .eq('id', user.id)
          .single();
          
        if (profile?.class_level) {
          let searchSubject = String(subject).toUpperCase().trim();
          if (searchSubject === 'MATH') searchSubject = 'MATHEMATICS';
          if (searchSubject === 'SOCIAL STUDIES' || searchSubject === 'SOCIAL') searchSubject = 'SOCIAL SCIENCE';

          const { data } = await supabase
            .from('mcq_questions')
            .select('*')
            .eq('class_level', profile.class_level)
            .ilike('subject_name', `%${searchSubject}%`)
            .limit(10);
            
          if (data && data.length > 0) {
            setQuestions(data);
          }
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [user?.id, subject]);

  useEffect(() => {
    if (loading || isFinished || isReviewMode) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, isFinished]);

  const finishQuiz = async () => {
    let totalScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        totalScore += 1;
      }
    });
    setScore(totalScore);
    setIsFinished(true);

    if (user?.id) {
      try {
        await supabase.from('student_assessments_history').insert({
          student_id: user.id,
          subject_name: subject,
          exam_name: examId,
          score: totalScore,
          total_questions: questions.length,
          answers: answers
        });
      } catch (e) {
        console.error("Failed to save score", e);
      }
    }
  };

  const handleSelectOption = (qId: string, option: string) => {
    if (isReviewMode) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ color: theme.textMuted }}>Loading Quiz...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ color: theme.textMuted }}>No questions available for this subject yet.</Text>
        <Button title="Go Back" onPress={onClose} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (isFinished && !isReviewMode) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <View style={[styles.resultIcon, { backgroundColor: score > questions.length / 2 ? theme.successLight : theme.dangerLight }]}>
          {score > questions.length / 2 ? 
            <CheckCircle size={64} color={theme.success} /> : 
            <XCircle size={64} color={theme.danger} />
          }
        </View>
        <Text style={[Typography.title, { color: theme.text, marginTop: 20 }]}>Quiz Completed!</Text>
        <Text style={[Typography.heading, { color: theme.textMuted, marginTop: 8 }]}>
          You scored {score} out of {questions.length}
        </Text>
        
        <View style={{ width: '100%', marginTop: 40, gap: 12 }}>
          <Button title="Back to Assessments" onPress={onClose} variant="outline" />
        </View>
      </View>
    );
  }

  const currentQ = questions[currentQIndex];
  const options = [
    { key: 'A', value: currentQ.option_a },
    { key: 'B', value: currentQ.option_b },
    { key: 'C', value: currentQ.option_c },
    { key: 'D', value: currentQ.option_d },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => {
          Alert.alert('Exit Quiz?', 'Your progress will be lost.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: onClose }
          ]);
        }} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[Typography.bodySemiBold, { color: theme.text }]} numberOfLines={1}>{examId || 'Assessment'}</Text>
          <Text style={[Typography.caption, { color: theme.textMuted }]}>{subject}</Text>
        </View>
        <View style={[styles.timerBadge, { backgroundColor: isReviewMode ? theme.surface : timeLeft < 300 ? theme.dangerLight : theme.surface }]}>
          {!isReviewMode && <Clock size={16} color={timeLeft < 300 ? theme.danger : theme.text} />}
          <Text style={[Typography.bodySemiBold, { color: isReviewMode ? theme.primary : timeLeft < 300 ? theme.danger : theme.text, marginLeft: isReviewMode ? 0 : 6 }]}>
            {isReviewMode ? 'Review Mode' : formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <View style={styles.scrollContent}>
        <Text style={[Typography.bodySemiBold, { color: theme.primary, marginBottom: 16 }]}>
          Question {currentQIndex + 1} of {questions.length}
        </Text>
        
        <Text style={[Typography.heading, { color: theme.text, marginBottom: 24, lineHeight: 28 }]}>
          {currentQ.question}
        </Text>

        <View style={{ gap: 12 }}>
          {options.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.key;
            let bgColor = isSelected ? theme.primary + '20' : theme.surface;
            let borderColor = isSelected ? theme.primary : 'transparent';
            let textColor = isSelected ? theme.primary : theme.text;
            let letterBg = isSelected ? theme.primary : theme.borderLight;
            let letterColor = isSelected ? '#FFF' : theme.text;

            if (isReviewMode) {
              const isCorrect = currentQ.correct_answer === opt.key;
              if (isCorrect) {
                bgColor = theme.successLight;
                borderColor = theme.success;
                textColor = theme.success;
                letterBg = theme.success;
                letterColor = '#FFF';
              } else if (isSelected && !isCorrect) {
                bgColor = theme.dangerLight;
                borderColor = theme.danger;
                textColor = theme.danger;
                letterBg = theme.danger;
                letterColor = '#FFF';
              }
            }

            return (
              <Pressable 
                key={opt.key}
                onPress={() => handleSelectOption(currentQ.id, opt.key)}
                style={[
                  styles.optionCard, 
                  { backgroundColor: bgColor, borderColor, borderWidth: 2 }
                ]}
              >
                <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
                  <Text style={[Typography.bodySemiBold, { color: letterColor }]}>{opt.key}</Text>
                </View>
                <Text style={[Typography.body, { color: textColor, flex: 1, marginLeft: 12 }]}>
                  {opt.value}
                </Text>
                {isReviewMode && currentQ.correct_answer === opt.key && (
                  <CheckCircle size={20} color={theme.success} style={{ marginLeft: 8 }} />
                )}
                {isReviewMode && isSelected && currentQ.correct_answer !== opt.key && (
                  <XCircle size={20} color={theme.danger} style={{ marginLeft: 8 }} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
        <Button 
          title="Previous" 
          variant="outline"
          onPress={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
          style={{ flex: 1, marginRight: 8 }}
        />
        {currentQIndex === questions.length - 1 ? (
          <Button 
            title={isReviewMode ? "Close Review" : "Finish"} 
            onPress={() => {
              if (isReviewMode) {
                onClose();
              } else {
                Alert.alert('Submit Quiz?', 'Are you sure you want to finish?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Submit', onPress: finishQuiz }
                ]);
              }
            }}
            style={{ flex: 1, marginLeft: 8 }}
          />
        ) : (
          <Button 
            title="Next" 
            onPress={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
            style={{ flex: 1, marginLeft: 8 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 8, 
    paddingBottom: 16 
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scrollContent: { paddingBottom: 40 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  }
});
