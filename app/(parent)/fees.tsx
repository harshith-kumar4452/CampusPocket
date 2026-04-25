import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { CreditCard, AlertCircle, CheckCircle2, Clock } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useFees } from '../../src/hooks/useFees';
import { useLanguage } from '../../src/context/LanguageContext';

export default function ParentFees() {
  const theme = useTheme();
  const { selectedChild } = useAuth();
  const { fees, stats, loading, refetch } = useFees(selectedChild?.id);
  const [refreshing, setRefreshing] = React.useState(false);
  const { t } = useLanguage();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 size={18} color={theme.success} />;
      case 'pending':
        return <Clock size={18} color={theme.warning} />;
      case 'overdue':
        return <AlertCircle size={18} color={theme.danger} />;
      default:
        return null;
    }
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
          <Text style={[Typography.title, { color: theme.text }]}>{t('feesAndPayments')}</Text>
          {selectedChild && (
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
              {t('feeStatusFor')} {selectedChild.full_name}
            </Text>
          )}
        </View>

        {/* Overview Stats */}
        <View >
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('totalDue')}</Text>
              <Text style={[Typography.stat, { color: theme.danger, marginTop: 4 }]}>
                ₹{stats.totalDue.toLocaleString()}
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>{t('totalPaid')}</Text>
              <Text style={[Typography.stat, { color: theme.success, marginTop: 4 }]}>
                ₹{stats.totalPaid.toLocaleString()}
              </Text>
            </Card>
          </View>
        </View>

        {/* Fee List */}
        <View >
          <Text style={[Typography.heading, { color: theme.text, marginTop: 24, marginBottom: 12 }]}>
            {t('paymentHistory')}
          </Text>
          {fees.map((fee) => (
            <Card key={fee.id} variant="outlined" style={styles.feeCard}>
              <View style={styles.feeRow}>
                <View style={[styles.iconBg, { 
                  backgroundColor: fee.status === 'paid' ? theme.successLight : 
                                   fee.status === 'overdue' ? theme.dangerLight : theme.warningLight 
                }]}>
                  {statusIcon(fee.status)}
                </View>
                <View style={styles.feeInfo}>
                  <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{fee.title}</Text>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>
                    {t('due')} {new Date(fee.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.feeAmount}>
                  <Text style={[Typography.heading, { color: theme.text }]}>₹{fee.amount.toLocaleString()}</Text>
                  <Badge 
                    label={fee.status === 'paid' ? t('paid') : fee.status === 'overdue' ? t('overdue') : t('pending')} 
                    variant={fee.status === 'paid' ? 'success' : fee.status === 'overdue' ? 'danger' : 'warning'} 
                    size="small" 
                  />
                </View>
              </View>
              {fee.paid_at && (
                <View style={[styles.paidAt, { borderTopColor: theme.borderLight }]}>
                  <Text style={[Typography.captionSmall, { color: theme.textMuted }]}>
                    {t('paidOn')} {new Date(fee.paid_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </Card>
          ))}

          {fees.length === 0 && !loading && (
            <Card variant="outlined" style={styles.emptyCard}>
              <CreditCard size={40} color={theme.textMuted} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
                {t('noFeeRecords')}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  feeCard: {
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeInfo: {
    flex: 1,
  },
  feeAmount: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paidAt: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
});
