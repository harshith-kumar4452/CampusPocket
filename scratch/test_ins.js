import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function testInsert() {
  const { data: user } = await supabase.from('profiles').select('id').eq('role', 'student').limit(1).single();
  const { data: cls } = await supabase.from('classes').select('id').limit(1).single();
  
  console.log("User:", user?.id);
  console.log("Class:", cls?.id);

  if (user && cls) {
    const { error } = await supabase.from('attendance').insert({
        student_id: user.id,
        class_id: cls.id,
        date: '2026-04-20',
        status: 'present'
    });
    console.log("Insert attendance error:", error);
  }
}

testInsert().catch(console.error);
