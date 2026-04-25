import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function checkClasses() {
  const { data: classes } = await supabase.from('classes').select('*');
  console.log("Total classes:", classes?.length);
  if (classes?.length > 0) {
      console.log(classes.slice(0, 5));
  }
}

checkClasses().catch(console.error);
