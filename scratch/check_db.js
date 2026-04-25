import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function checkClasses() {
  const { data: students } = await supabase.from('profiles').select('id, class_level, full_name').eq('role', 'student');
  console.log("Students:", students);

  for (const user of students) {
      console.log("Checking:", user.full_name, user.class_level);
      const { data: classes } = await supabase.from('student_classes').select('class:classes(*)').eq('student_id', user.id);
      console.log("Classes enrolled in:", classes?.length);
      classes?.forEach(c => console.log(c.class.name));

      const { data: periods } = await supabase.from('timetable_periods').select('subject_name').eq('class_level', user.class_level);
      const uniqueSubjects = [...new Set(periods?.map(p => p.subject_name))];
      console.log("Unique subjects in timetable:", uniqueSubjects);
  }
}

checkClasses().catch(console.error);
