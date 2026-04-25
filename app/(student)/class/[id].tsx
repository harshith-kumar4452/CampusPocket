import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, FileText, Download, CheckCircle, BookOpen, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../src/hooks/useTheme';
import { Typography } from '../../../src/constants/typography';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';

export default function ClassDetails() {
  const { id, name, subject } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'syllabus' | 'resources' | 'assessments'>('syllabus');

  // Mock Data
  const syllabus = [
    { chapter: '1. Introduction', status: 'Completed', weeks: 'Week 1-2' },
    { chapter: '2. Core Concepts', status: 'In Progress', weeks: 'Week 3-5' },
    { chapter: '3. Advanced Topics', status: 'Upcoming', weeks: 'Week 6-8' },
    { chapter: '4. Final Project', status: 'Upcoming', weeks: 'Week 9-10' },
  ];

  const resources = [
    { title: 'Chapter 1 & 2 Notes', type: 'PDF', size: '2.4 MB' },
    { title: 'Practice Worksheets', type: 'DOCX', size: '1.1 MB' },
    { title: 'Reference Book Chapter', type: 'PDF', size: '5.6 MB' },
  ];

  const assessments = [
    { title: 'Mid-Term Quiz', dueDate: 'Tomorrow, 10:00 AM', status: 'Pending', type: 'Quiz' },
    { title: 'Assignment 1', dueDate: 'Last Week', status: 'Submitted', score: '95/100', type: 'Homework' },
    { title: 'Final Assessment', dueDate: 'Next Month', status: 'Upcoming', type: 'Exam' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'syllabus':
        return (
          <View style={{ gap: 12 }}>
            {syllabus.map((item, index) => (
              <Card key={index} variant="outlined" style={styles.contentCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: item.status === 'Completed' ? theme.successLight : theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                      {item.status === 'Completed' ? <CheckCircle size={20} color={theme.success} /> : <BookOpen size={20} color={theme.primary} />}
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{item.chapter}</Text>
                      <Text style={[Typography.caption, { color: theme.textMuted }]}>{item.weeks}</Text>
                    </View>
                  </View>
                  <Badge 
                    label={item.status} 
                    variant={item.status === 'Completed' ? 'success' : item.status === 'In Progress' ? 'warning' : 'primary'} 
                    size="small" 
                  />
                </View>
              </Card>
            ))}
          </View>
        );
      case 'resources':
        return (
          <View style={{ gap: 12 }}>
            {resources.map((item, index) => (
              <Card key={index} variant="outlined" style={styles.contentCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#78350F' : '#FEF3C7' }]}>
                      <FileText size={20} color={theme.warning} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[Typography.caption, { color: theme.textMuted }]}>{item.type} • {item.size}</Text>
                    </View>
                  </View>
                  <Pressable style={[styles.downloadBtn, { backgroundColor: theme.surface }]}>
                    <Download size={18} color={theme.primary} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        );
      case 'assessments':
        return (
          <View style={{ gap: 12 }}>
            {assessments.map((item, index) => (
              <Card key={index} variant="outlined" style={styles.contentCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: item.status === 'Pending' ? theme.dangerLight : item.status === 'Submitted' ? theme.successLight : theme.surface }]}>
                      {item.status === 'Pending' ? <AlertCircle size={20} color={theme.danger} /> : 
                       item.status === 'Submitted' ? <CheckCircle size={20} color={theme.success} /> : 
                       <Clock size={20} color={theme.textMuted} />}
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[Typography.caption, { color: item.status === 'Pending' ? theme.danger : theme.textMuted }]}>
                        {item.status === 'Submitted' ? `Score: ${item.score}` : `Due: ${item.dueDate}`}
                      </Text>
                    </View>
                  </View>
                  {item.status === 'Pending' && <Button title="Start" size="small" onPress={() => {}} />}
                  {item.status !== 'Pending' && <Badge label={item.status} variant={item.status === 'Submitted' ? 'success' : 'primary'} size="small" />}
                </View>
              </Card>
            ))}
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
          <View style={{ marginLeft: 16 }}>
            <Text style={[Typography.title, { color: theme.text }]}>{name || 'Class Details'}</Text>
            <Text style={[Typography.body, { color: theme.textMuted }]}>{subject || 'Subject Overview'}</Text>
          </View>
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
});
