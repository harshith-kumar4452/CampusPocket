import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Mentor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  class_level: number;
  avatar_url?: string;
}

export interface TimetableEntry {
  id: string;
  day_of_week: number;
  period_number: number;
  subject_name: string;
  start_time: string;
  end_time: string;
}

export function useAcademicInfo(classLevel: number | undefined) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInfo = useCallback(async () => {
    if (!classLevel) return;
    setLoading(true);
    try {
      // Fetch Mentor
      const { data: mentorData } = await supabase
        .from('mentors')
        .select('*')
        .eq('class_level', classLevel)
        .single();
      
      if (mentorData) setMentor(mentorData);

      // Fetch Timetable (Monday = 1)
      const { data: ttData } = await supabase
        .from('timetable_periods')
        .select('*')
        .eq('class_level', classLevel)
        .order('period_number', { ascending: true });

      if (ttData) setTimetable(ttData);
    } catch (err) {
      console.log('Error fetching academic info:', err);
    } finally {
      setLoading(false);
    }
  }, [classLevel]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return { mentor, timetable, loading, refetch: fetchInfo };
}
