import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import Animated from 'react-native-reanimated';
import { BookOpen, User, MapPin, Calendar } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { useClasses } from '../../src/hooks/useClasses';

export default function StudentClasses() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { classes, loading, refetch } = useClasses(user?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
        <View >
          <Text style={[Typography.title, { color: theme.text }]}>My Classes</Text>
          <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
            Your current subject enrollments
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          {classes.map((item, i) => (
            <View key={item.id} >
              <Pressable onPress={() => router.push({ pathname: '/(student)/class/[id]', params: { id: item.id, name: item.name, subject: item.subject, teacher_name: item.teacher_name } })}>
                <Card variant="outlined" style={styles.classCard}>
                  <View style={styles.classHeader}>
                    <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                      <BookOpen size={24} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={[Typography.heading, { color: theme.text }]}>{item.name}</Text>
                      <Text style={[Typography.body, { color: theme.textMuted }]}>{item.subject}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <User size={16} color={theme.textMuted} />
                      <Text style={[Typography.caption, { color: theme.text, marginLeft: 8 }]}>
                        {item.teacher_name}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Calendar size={16} color={theme.textMuted} />
                      <Text style={[Typography.caption, { color: theme.text, marginLeft: 8 }]}>
                        {item.schedule}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MapPin size={16} color={theme.textMuted} />
                      <Text style={[Typography.caption, { color: theme.text, marginLeft: 8 }]}>
                        Room {item.room}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </View>
          ))}

          {classes.length === 0 && !loading && (
            <Card variant="outlined" style={styles.emptyCard}>
              <BookOpen size={40} color={theme.textMuted} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
                You are not enrolled in any classes yet.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
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
  classCard: {
    marginBottom: 16,
    padding: 20,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  detailsGrid: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
});
