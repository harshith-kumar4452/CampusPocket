import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { FileText, Plus } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';

export default function TeacherAssignments() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('teacher_id', user.id)
        .order('exam_date', { ascending: false });
        
      if (data) setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.title, { color: theme.text }]}>{t('assignments')}</Text>
        <Button 
          title={t('create')} 
          variant="primary" 
          size="small" 
          icon={<Plus size={16} color="#FFF" />}
          onPress={() => {
            router.push('/(teacher)/create-assignment');
          }}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAssignments} tintColor={theme.primary} />}
      >
        {assignments.length > 0 ? (
          <View style={{ gap: 16 }}>
            {assignments.map((assignment) => (
              <Card key={assignment.id} variant="elevated" style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                  <FileText size={24} color={theme.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[Typography.heading, { color: theme.text }]}>{assignment.exam_name}</Text>
                  <Text style={[Typography.body, { color: theme.textMuted }]}>
                    {assignment.subject_name} • Class {assignment.class_level}
                  </Text>
                  <Text style={[Typography.caption, { color: theme.primary, marginTop: 4 }]}>
                    {t('date')}: {assignment.exam_date}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color={theme.border} />
            <Text style={[Typography.heading, { color: theme.text, marginTop: 16 }]}>{t('noAssignments')}</Text>
            <Text style={[Typography.body, { color: theme.textMuted, textAlign: 'center', marginTop: 8 }]}>
              {t('noAssignmentsMsg')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 16,
    paddingBottom: 8 
  },
  scrollContent: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
});
