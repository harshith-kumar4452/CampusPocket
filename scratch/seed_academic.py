import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

# Seed subjects for classes 1-10
print("Seeding subjects...")
r = mcp("""
INSERT INTO public.subjects (name, class_level) VALUES
('English',1),('Hindi',1),('Mathematics',1),('EVS',1),('Art & Craft',1),
('English',2),('Hindi',2),('Mathematics',2),('EVS',2),('Art & Craft',2),
('English',3),('Hindi',3),('Mathematics',3),('EVS',3),('Computer Science',3),('Art & Craft',3),
('English',4),('Hindi',4),('Mathematics',4),('EVS',4),('Computer Science',4),('Art & Craft',4),
('English',5),('Hindi',5),('Mathematics',5),('EVS',5),('Computer Science',5),('Art & Craft',5),
('English',6),('Hindi',6),('Mathematics',6),('Science',6),('Social Studies',6),('Computer Science',6),('Sanskrit',6),
('English',7),('Hindi',7),('Mathematics',7),('Science',7),('Social Studies',7),('Computer Science',7),('Sanskrit',7),
('English',8),('Hindi',8),('Mathematics',8),('Science',8),('Social Studies',8),('Computer Science',8),('Sanskrit',8),
('English',9),('Hindi',9),('Mathematics',9),('Physics',9),('Chemistry',9),('Biology',9),('History',9),('Geography',9),('Computer Science',9),
('English',10),('Hindi',10),('Mathematics',10),('Physics',10),('Chemistry',10),('Biology',10),('History',10),('Geography',10),('Computer Science',10);
""")
print("Subjects done:", r[:100])

# Seed report cards for Alice (class 5) and Bob (class 3)
ALICE = '1bc63d81-95f6-42a7-a36a-4d47b7b7c03f'
BOB = '82ed88a3-06ef-4d78-9c7c-d7a85084573d'

alice_subjects = ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft']
bob_subjects = ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft']
exams = [
    ('SI-1','SI'),('Half-Yearly 1','Half-Yearly'),('SI-2','SI'),
    ('SI-3','SI'),('Half-Yearly 2 (Annual)','Half-Yearly'),('SI-4','SI')
]

import random
random.seed(42)

values = []
for exam_name, exam_type in exams:
    for subj in alice_subjects:
        m = random.randint(55, 98)
        g = 'A+' if m>=90 else 'A' if m>=80 else 'B+' if m>=70 else 'B' if m>=60 else 'C'
        values.append(f"('{ALICE}','{exam_name}','{exam_type}','{subj}',{m},100,'{g}')")
    for subj in bob_subjects:
        m = random.randint(50, 95)
        g = 'A+' if m>=90 else 'A' if m>=80 else 'B+' if m>=70 else 'B' if m>=60 else 'C'
        values.append(f"('{BOB}','{exam_name}','{exam_type}','{subj}',{m},100,'{g}')")

sql = "INSERT INTO public.report_cards (student_id,exam_name,exam_type,subject_name,marks_obtained,total_marks,grade) VALUES\n" + ",\n".join(values) + ";"
print("Seeding report cards...")
r = mcp(sql)
print("Report cards done:", r[:100])

# Seed achievements
print("Seeding achievements...")
r = mcp(f"""
INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded) VALUES
('{ALICE}','Science Olympiad Gold','Won 1st place in district-level Science Olympiad','Academic','Gold Medal','2026-02-10'),
('{ALICE}','Best Student Award','Awarded best student of the quarter for outstanding performance','Academic','Certificate','2026-01-15'),
('{ALICE}','Inter-School Debate Winner','Won 2nd place in inter-school debate competition','Extra-curricular','Silver Medal','2025-11-20'),
('{ALICE}','100m Sprint Champion','Won 1st place in annual sports day 100m sprint','Sports','Gold Medal','2026-01-25'),
('{BOB}','Mathematics Wizard','Scored highest in class in Mathematics SI-1 exam','Academic','Certificate','2025-08-15'),
('{BOB}','Art Competition Winner','Won 1st place in district art competition','Extra-curricular','Gold Medal','2025-12-05'),
('{BOB}','Perfect Attendance','Maintained 100% attendance for the entire term','Academic','Certificate','2026-03-31');
""")
print("Achievements done:", r[:100])
print("ALL SEEDING COMPLETE!")
