import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Class } from '../types/database';

const SUBJECT_TEACHERS: Record<string, string> = {
  'Mathematics': 'Mr. Rajesh Kumar',
  'Science': 'Ms. Priya Verma',
  'English': 'Mrs. Lakshmi Rao',
  'Hindi': 'Mrs. Anita Sharma',
  'Social Studies': 'Dr. Vikram Singh',
  'Computer Science': 'Mr. Arjun Mehta',
  'Physical Ed': 'Mr. Suresh Patil',
  'EVS': 'Mrs. Kavita Nair',
  'Art & Craft': 'Ms. Deepa Joshi',
  'Music': 'Mr. Ravi Shankar',
};

export function useClasses(studentId: string | undefined) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('class_level')
        .eq('id', studentId)
        .single();

      if (profileErr) throw profileErr;
      if (!profile?.class_level) {
        setClasses([]);
        return;
      }

      const { data: periods, error: periodsErr } = await supabase
        .from('timetable_periods')
        .select('subject_name, teacher_name')
        .eq('class_level', profile.class_level);

      if (periodsErr) throw periodsErr;

      const uniqueSubjects = new Map();
      let roomIdx = 1;
      
      periods?.forEach(p => {
        const subj = p.subject_name;
        if (subj && subj !== 'Lunch Break' && !uniqueSubjects.has(subj)) {
          uniqueSubjects.set(subj, {
            id: `class-${profile.class_level}-${subj.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${subj}`,
            subject: subj,
            teacher_name: p.teacher_name || SUBJECT_TEACHERS[subj] || 'Assigned Teacher',
            schedule: 'Mon-Fri',
            room: `Room ${profile.class_level}0${roomIdx++}`,
          });
        }
      });

      setClasses(Array.from(uniqueSubjects.values()) as Class[]);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, refetch: fetchClasses };
}
