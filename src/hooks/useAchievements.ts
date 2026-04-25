import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Achievement {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: string;
  award_type: string;
  date_awarded: string;
  image_url?: string;
}

export function useAchievements(studentId: string | undefined) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', studentId)
        .order('date_awarded', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return { achievements, loading, refetch: fetchAchievements };
}
