import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CalendarEntry {
  day: number;
  label: string;
  type: 'holiday' | 'event' | 'exam';
  color?: string;
}

export function useCalendarData(studentId: string | undefined, year: number, month: number) {
  const [data, setData] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    try {
      // 1. Fetch student's class level
      const { data: profile } = await supabase
        .from('profiles')
        .select('class_level')
        .eq('id', studentId)
        .single();

      const classLevel = profile?.class_level || 5;

      // 2. Fetch Exams from database for this specific class
      const { data: exams } = await supabase
        .from('exam_schedules')
        .select('exam_name, exam_date, subject_name')
        .eq('class_level', classLevel)
        .gte('exam_date', startDate)
        .lte('exam_date', endDate);

      // 3. Fetch Holidays
      const { data: holidays } = await supabase
        .from('holidays')
        .select('name, date')
        .gte('date', startDate)
        .lte('date', endDate);

      // 4. Fetch Events
      const { data: events } = await supabase
        .from('events')
        .select('title, date, image_url')
        .gte('date', startDate)
        .lte('date', endDate);

      const examEntries: CalendarEntry[] = (exams || []).map(e => ({
        day: parseInt(e.exam_date.split('-')[2], 10),
        label: `${e.exam_name}: ${e.subject_name || 'TBD'}`,
        type: 'exam',
        color: '#EF4444' // Red for exams
      }));

      const holidayEntries: CalendarEntry[] = (holidays || []).map(h => ({
        day: parseInt(h.date.split('-')[2], 10),
        label: h.name,
        type: 'holiday',
        color: '#10B981' // Green for holidays
      }));

      const eventEntries: CalendarEntry[] = (events || []).map(e => ({
        day: parseInt(e.date.split('-')[2], 10),
        label: e.title,
        type: 'event',
        color: '#6366F1' // Indigo for events
      }));

      setData([...examEntries, ...holidayEntries, ...eventEntries]);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
