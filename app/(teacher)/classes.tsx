import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Users, ChevronRight, MapPin, BookOpen, Clock } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#6366F1',
  'Math': '#6366F1',
  'Science': '#10B981',
  'English': '#F59E0B',
  'Hindi': '#EC4899',
  'Social Science': '#8B5CF6',
  'Advanced Physics': '#0EA5E9',
};

export default function TeacherClasses() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const fetchClasses = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get teacher's profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof);

      // Only fetch classes belonging to this teacher
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('class_level', { ascending: true });
        
      if (data) {
        // Enrich each class with student count
        const enriched = await Promise.all(
          data.map(async (cls) => {
            const { count } = await supabase
              .from('student_classes')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id);
            return { ...cls, student_count: count || 0 };
          })
        );
        setClasses(enriched);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const subjectColor = profile?.subject ? (SUBJECT_COLORS[profile.subject] || theme.primary) : theme.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[Typography.title, { color: theme.text }]}>{t('myClasses')}</Text>
          {profile?.subject && (
            <View style={[styles.subjectTag, { backgroundColor: subjectColor + '15' }]}>
              <BookOpen size={13} color={subjectColor} />
              <Text style={[Typography.captionSmall, { color: subjectColor, fontWeight: '700', marginLeft: 4 }]}>
                {profile.subject}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.countBadge, { backgroundColor: subjectColor + '15' }]}>
          <Text style={[Typography.heading, { color: subjectColor }]}>{classes.length}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchClasses} tintColor={theme.primary} />}
      >
        {classes.length > 0 ? (
          <View style={{ gap: 14 }}>
            {classes.map((cls) => {
              const color = SUBJECT_COLORS[cls.subject] || theme.primary;
              return (
                <Pressable 
                  key={cls.id}
                  onPress={() => {
                    router.push({
                      pathname: '/(teacher)/class/[id]',
                      params: { id: cls.id, name: cls.name, subject: cls.subject }
                    });
                  }}
                  style={({ pressed }) => [
                    styles.classCard, 
                    { 
                      backgroundColor: theme.surface, 
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                  ]}
                >
                  {/* Left color strip */}
                  <View style={[styles.colorStrip, { backgroundColor: color }]} />
                  
                  <View style={styles.classContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {/* Class level circle */}
                      <View style={[styles.levelCircle, { backgroundColor: color + '15' }]}>
                        <Text style={[Typography.title, { color, fontSize: 18 }]}>{cls.class_level}</Text>
                      </View>

                      {/* Class info */}
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={[Typography.bodySemiBold, { color: theme.text, fontSize: 15 }]} numberOfLines={1}>
                          {cls.name}
                        </Text>
                        <Text style={[Typography.captionSmall, { color: theme.textMuted, marginTop: 2 }]}>
                          {cls.subject}
                        </Text>
                        
                        {/* Meta row */}
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <Users size={12} color={color} />
                            <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]}>
                              {cls.student_count} students
                            </Text>
                          </View>
                          {cls.room && (
                            <View style={styles.metaItem}>
                              <MapPin size={12} color={theme.textMuted} />
                              <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]}>
                                {cls.room}
                              </Text>
                            </View>
                          )}
                          {cls.schedule && (
                            <View style={styles.metaItem}>
                              <Clock size={12} color={theme.textMuted} />
                              <Text style={[Typography.captionSmall, { color: theme.textMuted, marginLeft: 4 }]} numberOfLines={1}>
                                {cls.schedule}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <ChevronRight size={20} color={theme.textMuted} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={theme.border} />
            <Text style={[Typography.heading, { color: theme.text, marginTop: 16 }]}>{t('noClassesYet')}</Text>
            <Text style={[Typography.body, { color: theme.textMuted, textAlign: 'center', marginTop: 8 }]}>
              {t('noClassesMsg')}
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
    alignItems: 'flex-start', 
    paddingHorizontal: 20, 
    paddingTop: 16,
    paddingBottom: 8 
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  countBadge: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { padding: 20, paddingBottom: 100 },
  classCard: { 
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  colorStrip: {
    width: 4,
  },
  classContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  levelCircle: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: { 
    alignItems: 'center', justifyContent: 'center', paddingVertical: 60 
  },
});
