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
      // 1. Fetch real attendance records from the database
      const { data: dbRecords, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) throw error;

      // 2. Fetch student's class level to get their timetable
      const { data: profile } = await supabase
        .from('profiles')
        .select('class_level')
        .eq('id', studentId)
        .single();

      const classLevel = profile?.class_level || 5;

      // 3. Fetch timetable periods for this class level
      const { data: periods } = await supabase
        .from('timetable_periods')
        .select('*')
        .eq('class_level', classLevel);

      // 4. Map daily records to subject-level records
      const mappedRecords: any[] = [];
      
      // Group records by date
      const recordsByDate: Record<string, any[]> = {};
      (dbRecords || []).forEach(r => {
        if (!recordsByDate[r.date]) recordsByDate[r.date] = [];
        recordsByDate[r.date].push(r);
      });

      Object.keys(recordsByDate).forEach(dateStr => {
        const dateRecords = recordsByDate[dateStr];
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();
        const dayPeriods = (periods || []).filter(p => p.day_of_week === dayOfWeek);

        if (dayPeriods.length > 0) {
          dayPeriods.forEach(period => {
            // Check if there is a specific record for this subject
            const specificRecord = dateRecords.find(r => r.subject_name === period.subject_name);
            // Otherwise find a global record (one without subject_name)
            const globalRecord = dateRecords.find(r => !r.subject_name);
            
            const recordToUse = specificRecord || globalRecord;

            if (recordToUse) {
              mappedRecords.push({
                ...recordToUse,
                id: `${recordToUse.id}-${period.id}`, // unique id
                class: {
                  name: period.subject_name,
                  subject: period.subject_name,
                  teacher_name: period.teacher_name,
                }
              });
            }
          });
        } else {
          // Fallback: use global records if no periods found
          dateRecords.filter(r => !r.subject_name).forEach(r => {
            mappedRecords.push({
              ...r,
              class: { name: 'General Session', subject: 'Academic' }
            });
          });
        }
      });

      setAttendance(mappedRecords);

      // 3. Calculate Stats
      const total = mappedRecords.length;
      const present = mappedRecords.filter((r) => r.status === 'present').length;
      const absent = mappedRecords.filter((r) => r.status === 'absent').length;
      const late = mappedRecords.filter((r) => r.status === 'late').length;
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

