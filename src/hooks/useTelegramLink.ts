import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useTelegramLink() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const generateCode = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. Generate a random 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Insert into the database with a 10-minute expiry
      const { error } = await supabase
        .from('telegram_verification_codes')
        .insert([
          { 
            user_id: user.id, 
            code: newCode,
            expires_at: new Date(Date.now() + 10 * 60000).toISOString()
          }
        ]);

      if (error) throw error;
      
      setCode(newCode);
    } catch (err) {
      console.error('Error generating Telegram code:', err);
    } finally {
      setLoading(false);
    }
  };

  return { code, generateCode, loading };
}
