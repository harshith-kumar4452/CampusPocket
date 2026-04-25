import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function fixClasses() {
  const { data: students, error: studentsErr } = await supabase.from('profiles').select('id, class_level').eq('role', 'student');
  if (studentsErr) throw studentsErr;

  for (const student of students) {
    const sId = student.id;
    const cLevel = student.class_level;
    
    if (!cLevel) continue;

    const { data: periods, error: periodsErr } = await supabase.from('timetable_periods').select('subject_name, teacher_name').eq('class_level', cLevel);
    if (periodsErr) throw periodsErr;

    const subjects = {};
    for (const p of periods) {
      if (!subjects[p.subject_name]) {
        subjects[p.subject_name] = p.teacher_name || "Mr. Smith";
      }
    }

    const classIds = [];
    let idx = 1;
    for (const [subj, teacher] of Object.entries(subjects)) {
      const className = `Class ${cLevel} ${subj}`;

      const { data: existing, error: existErr } = await supabase.from('classes').select('id').eq('name', className);
      if (existErr) console.error("Exist err:", existErr);
      
      if (existing && existing.length > 0) {
        classIds.push(existing[0].id);
      } else {
        const { data: newClass, error: insErr } = await supabase.from('classes').insert({
          name: className,
          subject: subj,
          teacher_name: teacher,
          room: `Room ${cLevel}0${idx}`,
          schedule: "Mon-Fri"
        }).select();
        
        if (insErr) {
            console.error("Insert class err:", insErr);
        }
        
        if (newClass && newClass.length > 0) {
          classIds.push(newClass[0].id);
        }
      }
      idx++;
    }

    // Link to student_classes
    const {error: delErr} = await supabase.from('student_classes').delete().eq('student_id', sId);
    if(delErr) console.error("Delete student classes err:", delErr);

    for (const cid of classIds) {
      const {error: insSC} = await supabase.from('student_classes').insert({
        student_id: sId,
        class_id: cid
      });
      if(insSC) console.error("Insert student_class err:", insSC);
    }
  }
  console.log("Done populating classes!");
}

fixClasses().catch(console.error);
