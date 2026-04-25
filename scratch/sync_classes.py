import os
from supabase import create_client

url = os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
key = os.environ.get("EXPO_PUBLIC_SUPABASE_KEY")
supabase = create_client(url, key)

def fix_classes():
    # 1. Get all students
    students = supabase.table('students').select('id, class_level').execute().data
    
    for student in students:
        s_id = student['id']
        c_level = student['class_level']
        
        # 2. Get distinct subjects for this class level from timetable_periods
        periods = supabase.table('timetable_periods').select('subject_name, teacher_name').eq('class_level', c_level).execute().data
        
        # Map of subject -> teacher
        subjects = {}
        for p in periods:
            subj = p['subject_name']
            if subj not in subjects:
                subjects[subj] = p['teacher_name'] or "Mr. Smith"
        
        # 3. Ensure a class exists for each subject + class_level
        class_ids = []
        for subj, teacher in subjects.items():
            class_name = f"Class {c_level} {subj}"
            
            # check if exists
            existing = supabase.table('classes').select('id').eq('name', class_name).execute().data
            if existing:
                class_ids.append(existing[0]['id'])
            else:
                # create
                new_class = supabase.table('classes').insert({
                    'name': class_name,
                    'subject': subj,
                    'teacher_name': teacher,
                    'room': f"Room {c_level}0{list(subjects.keys()).index(subj)+1}",
                    'schedule': "Mon-Fri"
                }).execute().data
                if new_class:
                    class_ids.append(new_class[0]['id'])
        
        # 4. Link to student_classes
        # first delete existing to avoid duplicates
        supabase.table('student_classes').delete().eq('student_id', s_id).execute()
        
        for cid in class_ids:
            supabase.table('student_classes').insert({
                'student_id': s_id,
                'class_id': cid
            }).execute()
            
    print("Done populating classes for all students based on their timetable.")

if __name__ == '__main__':
    fix_classes()
