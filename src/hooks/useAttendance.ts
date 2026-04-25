import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Attendance } from '../types/database';

export function useAttendance(studentId: string | undefined) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });

  const fetchAttendance = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          class:classes(*)
        `)
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;

      const records = (data || []) as Attendance[];
      setAttendance(records);

      const total = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setStats({ total, present, absent, late, percentage });
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Keep a ref to the latest fetch function so the realtime callback doesn't go stale
  const fetchRef = useRef(fetchAttendance);
  fetchRef.current = fetchAttendance;

  // Realtime subscription — only depends on studentId
  useEffect(() => {
    if (!studentId) return;

    const channelName = `attendance_${studentId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
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

  return { attendance, loading, stats, refetch: fetchAttendance };
}

