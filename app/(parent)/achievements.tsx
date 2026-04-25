import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Medal, Award, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { supabase } from '../../src/lib/supabase';

interface Achievement {
  id: string; title: string; description: string; category: string;
  award_type: string; date_awarded: string;
}

const CATEGORY_CONFIG: Record<string, { icon: string; gradient: readonly [string, string] }> = {
  'Academic': { icon: '📚', gradient: ['#6366F1', '#8B5CF6'] },
  'Sports': { icon: '🏅', gradient: ['#10B981', '#34D399'] },
  'Extra-curricular': { icon: '🎨', gradient: ['#EC4899', '#F472B6'] },
};

const AWARD_EMOJI: Record<string, string> = {
  'Gold Medal': '🥇', 'Silver Medal': '🥈', 'Bronze Medal': '🥉', 'Certificate': '📜',
};

export default function Achievements() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedChild } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!selectedChild) return;
    setLoading(true);
    let query = supabase.from('achievements').select('*').eq('student_id', selectedChild.id).order('date_awarded', { ascending: false });
    if (filter) query = query.eq('category', filter);
    const { data, error } = await query;
    if (!error && data) setAchievements(data);
    setLoading(false);
  }, [selectedChild, filter]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  const categories = ['Academic', 'Sports', 'Extra-curricular'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Trophy size={22} color={theme.warning} />
          <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>Achievements</Text>
        </View>

        {selectedChild && (
          <Text style={[Typography.body, { color: theme.textMuted, marginBottom: 16 }]}>
            {selectedChild.full_name}'s awards and recognition
          </Text>
        )}

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            onPress={() => setFilter(null)}
            style={[styles.filterChip, {
              backgroundColor: !filter ? theme.primary : theme.surface,
              borderColor: !filter ? theme.primary : theme.border,
            }]}
          >
            <Text style={[Typography.caption, { color: !filter ? '#FFFFFF' : theme.text }]}>All</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setFilter(filter === cat ? null : cat)}
              style={[styles.filterChip, {
                backgroundColor: filter === cat ? theme.primary : theme.surface,
                borderColor: filter === cat ? theme.primary : theme.border,
              }]}
            >
              <Text style={[Typography.caption, { color: filter === cat ? '#FFFFFF' : theme.text }]}>
                {CATEGORY_CONFIG[cat]?.icon} {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={{ fontSize: 24 }}>🏆</Text>
            <Text style={[Typography.heading, { color: theme.text }]}>{achievements.length}</Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Total</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={{ fontSize: 24 }}>🥇</Text>
            <Text style={[Typography.heading, { color: theme.text }]}>
              {achievements.filter(a => a.award_type === 'Gold Medal').length}
            </Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Gold</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={{ fontSize: 24 }}>📜</Text>
            <Text style={[Typography.heading, { color: theme.text }]}>
              {achievements.filter(a => a.award_type === 'Certificate').length}
            </Text>
            <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>Certs</Text>
          </Card>
        </View>

        {/* Achievement Cards */}
        {achievements.map((ach) => {
          const config = CATEGORY_CONFIG[ach.category] || CATEGORY_CONFIG['Academic'];
          const emoji = AWARD_EMOJI[ach.award_type] || '🏆';
          return (
            <Card key={ach.id} variant="outlined" style={styles.achCard}>
              <View style={styles.achRow}>
                <View style={[styles.achIcon, { backgroundColor: theme.isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{ach.title}</Text>
                  <Text style={[Typography.captionSmall, { color: theme.textMuted, marginTop: 2 }]}>{ach.description}</Text>
                  <View style={styles.achTags}>
                    <Badge label={ach.category} variant="primary" size="small" />
                    <Badge label={ach.award_type} variant="success" size="small" />
                    <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>
                      {new Date(ach.date_awarded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {achievements.length === 0 && !loading && (
          <Card variant="outlined" style={styles.emptyCard}>
            <Trophy size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No achievements recorded yet.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterRow: { gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  achCard: { marginBottom: 12 },
  achRow: { flexDirection: 'row', alignItems: 'flex-start' },
  achIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  achTags: { flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' },
  emptyCard: { alignItems: 'center', padding: 40, marginTop: 40 },
});
