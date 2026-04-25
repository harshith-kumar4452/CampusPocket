import json, subprocess, uuid, random

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=180)
    return out

# New Parent/Student Data Definition
data = [
    {
        "parent": {"email": "john@parent.com", "name": "John Doe"},
        "children": [
            {"name": "Michael Doe", "class": 8},
            {"name": "Emily Doe", "class": 2}
        ]
    },
    {
        "parent": {"email": "sarah@parent.com", "name": "Sarah Miller"},
        "children": [
            {"name": "David Miller", "class": 10}
        ]
    },
    {
        "parent": {"email": "robert@parent.com", "name": "Robert Wilson"},
        "children": [
            {"name": "Jessica Wilson", "class": 6}
        ]
    }
]

exams = [
    ('SI-1','SI'),('Half-Yearly 1','Half-Yearly'),('SI-2','SI'),
    ('SI-3','SI'),('Half-Yearly 2 (Annual)','Half-Yearly'),('SI-4','SI')
]

subjects_map = {
    1: ['English','Hindi','Mathematics','EVS','Art & Craft'],
    2: ['English','Hindi','Mathematics','EVS','Art & Craft'],
    3: ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft'],
    4: ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft'],
    5: ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft'],
    6: ['English','Hindi','Mathematics','Science','Social Studies','Computer Science','Sanskrit'],
    7: ['English','Hindi','Mathematics','Science','Social Studies','Computer Science','Sanskrit'],
    8: ['English','Hindi','Mathematics','Science','Social Studies','Computer Science','Sanskrit'],
    9: ['English','Hindi','Mathematics','Physics','Chemistry','Biology','History','Geography','Computer Science'],
    10: ['English','Hindi','Mathematics','Physics','Chemistry','Biology','History','Geography','Computer Science']
}

all_sql = []

# For each family
for family in data:
    p_id = str(uuid.uuid4())
    p_email = family['parent']['email']
    p_name = family['parent']['name']
    
    # Create Auth User & Profile (Parent)
    all_sql.append(f"""
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES ('{p_id}', '{p_email}', crypt('password123', gen_salt('bf')), now(), '{{"full_name": "{p_name}", "role": "parent"}}')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES ('{p_id}', '{p_email}', '{p_name}', 'parent')
    ON CONFLICT (id) DO NOTHING;
    """)
    
    for child in family['children']:
        c_id = str(uuid.uuid4())
        c_name = child['name']
        c_class = child['class']
        
        # Create Student Profile
        all_sql.append(f"""
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES ('{c_id}', '{c_name.lower().replace(" ",".")}@student.com', crypt('password123', gen_salt('bf')), now(), '{{"full_name": "{c_name}", "role": "student"}}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES ('{c_id}', '{c_name.lower().replace(" ",".")}@student.com', '{c_name}', 'student')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO public.student_parents (student_id, parent_id)
        VALUES ('{c_id}', '{p_id}')
        ON CONFLICT DO NOTHING;
        """)
        
        # Seed Attendance (last 30 days)
        for i in range(30):
            status = random.choice(['present', 'present', 'present', 'absent', 'late'])
            all_sql.append(f"INSERT INTO public.attendance (student_id, date, status) VALUES ('{c_id}', CURRENT_DATE - INTERVAL '{i} days', '{status}') ON CONFLICT DO NOTHING;")
            
        # Seed Fees (2 terms)
        all_sql.append(f"""
        INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
        VALUES 
        ('{c_id}', 'Term 1 Tuition Fee', 25000, '2025-06-15', 'PAID', '2025-06-10'),
        ('{c_id}', 'Term 2 Tuition Fee', 25000, '2025-11-15', 'PENDING', NULL);
        """)
        
        # Seed Report Cards (6 exams)
        subs = subjects_map.get(c_class, subjects_map[1])
        for exam_name, exam_type in exams:
            for subj in subs:
                m = random.randint(60, 98)
                g = 'A+' if m>=90 else 'A' if m>=80 else 'B+' if m>=70 else 'B' if m>=60 else 'C'
                all_sql.append(f"INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ('{c_id}', '{exam_name}', '{exam_type}', '{subj}', {m}, '{g}');")
        
        # Seed Achievements
        all_sql.append(f"""
        INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded)
        VALUES ('{c_id}', 'Excellence in {subs[0]}', 'Outstanding performance in the last term', 'Academic', 'Certificate', CURRENT_DATE - INTERVAL '10 days');
        """)

print("Executing Batch SQL Seeding...")
# Execute in chunks to avoid overwhelming the connection
chunk_size = 50
for i in range(0, len(all_sql), chunk_size):
    chunk = "\n".join(all_sql[i:i+chunk_size])
    mcp(chunk)

print("MASS SEEDING COMPLETE!")
