import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function syncAttendance() {
  console.log('Fetching students...');
  const { data: students, error: stdErr } = await supabase.from('profiles').select('*').eq('role', 'student');
  if (stdErr) throw stdErr;

  console.log('Fetching all classes...');
  const { data: allClasses, error: clsErr } = await supabase.from('classes').select('*');
  if (clsErr) throw clsErr;

  console.log('Fetching all timetable periods...');
  const { data: allPeriods, error: perErr } = await supabase.from('timetable_periods').select('*');
  if (perErr) throw perErr;

  // Clear existing attendance
  console.log('Deleting old attendance...');
  const { error: delErr } = await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error("Could not delete attendance. Checking RLS.", delErr);
    // If RLS prevents delete, we can't delete. 
  }

  const attendanceToInsert = [];
  
  // Generate last 30 days
  const today = new Date();
  const dates = [];
  for(let i=0; i<30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if(d.getDay() !== 0 && d.getDay() !== 6) { // skip weekends
          dates.push(d);
      }
  }

  const dayMap = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday'
  };

  for (const student of students) {
    if (!student.class_level) continue;

    // get periods for this student's class level
    const studentPeriods = allPeriods.filter(p => p.class_level === student.class_level);
    
    for (const date of dates) {
        const dayOfWeekName = dayMap[date.getDay()];
        if (!dayOfWeekName) continue;

        const periodsForDay = studentPeriods.filter(p => p.day_of_week === dayOfWeekName && p.subject_name !== 'Lunch Break');
        
        for (const p of periodsForDay) {
            // Find the class_id for this subject
            const targetClass = allClasses.find(c => c.name === `Class ${student.class_level} ${p.subject_name}`);
            if (!targetClass) continue;

            const dateStr = date.toISOString().split('T')[0];
            
            // Randomly assign status (90% present, 5% absent, 5% late)
            const rand = Math.random();
            let status = 'present';
            if (rand > 0.95) status = 'absent';
            else if (rand > 0.90) status = 'late';

            attendanceToInsert.push({
                student_id: student.id,
                class_id: targetClass.id,
                date: dateStr,
                status: status
            });
        }
    }
  }

  console.log(`Inserting ${attendanceToInsert.length} attendance records...`);
  // Insert in batches of 1000
  for(let i=0; i<attendanceToInsert.length; i+=1000) {
      const batch = attendanceToInsert.slice(i, i+1000);
      const { error: insErr } = await supabase.from('attendance').insert(batch);
      if(insErr) console.error("Insert error:", insErr);
  }

  console.log('Done syncing attendance!');
}

syncAttendance().catch(console.error);
