import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
}
