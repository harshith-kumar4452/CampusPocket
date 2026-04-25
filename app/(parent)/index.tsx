import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LogOut,
  Moon,
  Sun,
  CalendarCheck,
  BarChart3,
  ChevronRight,
  GraduationCap,
  Clock,
  Star,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { useThemeContext } from '../../src/context/ThemeContext';
import { Typography } from '../../src/constants/typography';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useQuizzes } from '../../src/hooks/useQuizzes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDER_EVENTS = [
  { id: '1', title: 'Annual Sports Day 🏅', image: require('../../assets/images/event_sports.png'), date: 'May 5' },
  { id: '2', title: 'Science Exhibition 🔬', image: require('../../assets/images/event_science.png'), date: 'May 20' },
  { id: '3', title: 'Annual Day Gala 🎭', image: require('../../assets/images/event_annual_day.png'), date: 'Dec 15' },
  { id: '4', title: 'Christmas Celebration 🎄', image: require('../../assets/images/event_christmas.png'), date: 'Dec 24' },
  { id: '5', title: 'Summer Camp 🏕️', image: require('../../assets/images/event_summer_camp.png'), date: 'Jun 15' },
];

function ChildCard({ child, onPress, theme }: any) {
  const { stats: attendanceStats } = useAttendance(child.id);
  const { stats: quizStats } = useQuizzes(child.id);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}>
      <LinearGradient
        colors={theme.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.childCard}
      >
        <View style={styles.childCardHeader}>
          <Avatar name={child.full_name} size={56} />
          <View style={styles.childCardArrow}>
            <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        <Text style={styles.childName}>{child.full_name}</Text>
        <Text style={styles.childRole}>Student</Text>

        <View style={styles.childStats}>
          <View style={styles.childStat}>
            <CalendarCheck size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.childStatValue}>{attendanceStats.percentage}%</Text>
            <Text style={styles.childStatLabel}>Attendance</Text>
          </View>
          <View style={styles.childStatDivider} />
          <View style={styles.childStat}>
            <BarChart3 size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.childStatValue}>{quizStats.averagePercentage}%</Text>
            <Text style={styles.childStatLabel}>Avg Score</Text>
          </View>
          <View style={styles.childStatDivider} />
          <View style={styles.childStat}>
            <Star size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.childStatValue}>{quizStats.totalQuizzes}</Text>
            <Text style={styles.childStatLabel}>Quizzes</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function ParentHome() {
  const theme = useTheme();
  const { toggleTheme, isDark } = useThemeContext();
  const router = useRouter();
  const { profile, children, setSelectedChild, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const sliderRef = useRef<FlatList>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % SLIDER_EVENTS.length;
      setCurrentSlide(nextSlide);
      sliderRef.current?.scrollToIndex({ index: nextSlide, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleChildPress = (child: any) => {
    setSelectedChild(child);
    router.push('/(parent)/child-dashboard');
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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>
              {greeting()} 👋
            </Text>
            <Text style={[Typography.title, { color: theme.text }]}>
              {profile?.full_name || 'Parent'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={signOut}
              style={[styles.iconButton, { backgroundColor: theme.surface }]}
            >
              <LogOut size={20} color={theme.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Slideshow */}
        <View style={{ marginBottom: 24 }}>
          <FlatList
            ref={sliderRef}
            data={SLIDER_EVENTS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentSlide(index);
            }}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH - 40, height: 180, borderRadius: 20, overflow: 'hidden' }}>
                <Image source={item.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <Text style={[Typography.bodySemiBold, { color: '#FFF' }]}>{item.title}</Text>
                  <Text style={[Typography.captionSmall, { color: 'rgba(255,255,255,0.8)' }]}>{item.date}</Text>
                </View>
              </View>
            )}
          />
          {/* Dot Indicators */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 }}>
            {SLIDER_EVENTS.map((_, i) => (
              <View 
                key={i} 
                style={{ 
                  width: currentSlide === i ? 20 : 6, 
                  height: 6, 
                  borderRadius: 3, 
                  backgroundColor: currentSlide === i ? theme.primary : theme.border 
                }} 
              />
            ))}
          </View>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={20} color={theme.primary} />
            <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>
              Your Children
            </Text>
          </View>

          {children.length > 0 ? (
            <View style={styles.childrenGrid}>
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  theme={theme}
                  onPress={() => handleChildPress(child)}
                />
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <GraduationCap size={40} color={theme.textMuted} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
                No children linked to your account yet.
              </Text>
            </Card>
          )}
        </View>



        {/* Quick Info */}
        <View style={styles.section}>
          <Card style={[styles.infoCard, { borderLeftColor: theme.primary, borderLeftWidth: 4 }]}>
            <Text style={[Typography.bodySemiBold, { color: theme.text }]}>
              💡 Tip
            </Text>
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 4 }]}>
              Tap on a child's card to view their detailed dashboard with calendar, attendance, and grades.
            </Text>
          </Card>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  childrenGrid: {
    gap: 16,
  },
  childCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  childCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  childCardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    ...Typography.title,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  childRole: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  childStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  childStat: {
    alignItems: 'center',
    gap: 4,
  },
  childStatValue: {
    ...Typography.heading,
    color: '#FFFFFF',
  },
  childStatLabel: {
    ...Typography.captionSmall,
    color: 'rgba(255,255,255,0.65)',
  },
  childStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  eventsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  eventCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  infoCard: {
    borderRadius: 16,
  },
});
