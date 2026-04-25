import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Fee } from '../types/database';

export function useFees(studentId: string | undefined) {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    pendingCount: 0,
    overdueCount: 0,
  });

  const fetchFees = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: false });

      if (error) throw error;

      const records = (data || []) as Fee[];
      const normalized = records.map((f) => ({ ...f, status: (f.status || '').toLowerCase() as any }));
      setFees(normalized);

      const pending = normalized.filter((f) => f.status === 'pending');
      const overdue = normalized.filter((f) => f.status === 'overdue');
      const paid = normalized.filter((f) => f.status === 'paid');

      setStats({
        totalDue: [...pending, ...overdue].reduce((a, b) => a + b.amount, 0),
        totalPaid: paid.reduce((a, b) => a + b.amount, 0),
        pendingCount: pending.length,
        overdueCount: overdue.length,
      });
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  // Keep a ref to the latest fetch function
  const fetchRef = useRef(fetchFees);
  fetchRef.current = fetchFees;

  // Realtime subscription — only depends on studentId
  useEffect(() => {
    if (!studentId) return;

    const channelName = `fees_${studentId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fees',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          fetchRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  return { fees, loading, stats, refetch: fetchFees };
}

