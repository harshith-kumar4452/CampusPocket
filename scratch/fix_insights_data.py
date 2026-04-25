import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

# Step 1: Ensure mentors for ALL levels 1-10
print("Seeding mentors for all levels...")
mcp("""
INSERT INTO public.mentors (full_name, email, phone, specialization, class_level) VALUES
('Mrs. Anita Sharma', 'anita.s@school.com', '+91 98765 43210', 'Primary Coordinator', 1),
('Mrs. Anita Sharma', 'anita.s@school.com', '+91 98765 43210', 'Primary Coordinator', 2),
('Mr. Rajesh Kumar', 'rajesh.k@school.com', '+91 98765 43211', 'Mathematics', 3),
('Mr. Rajesh Kumar', 'rajesh.k@school.com', '+91 98765 43211', 'Mathematics', 4),
('Ms. Priya Verma', 'priya.v@school.com', '+91 98765 43212', 'Science Coordinator', 5),
('Ms. Priya Verma', 'priya.v@school.com', '+91 98765 43212', 'Science Coordinator', 6),
('Dr. Vikram Singh', 'vikram.s@school.com', '+91 98765 43213', 'Social Studies', 7),
('Dr. Vikram Singh', 'vikram.s@school.com', '+91 98765 43213', 'Social Studies', 8),
('Mrs. Sunita Goel', 'sunita.g@school.com', '+91 98765 43214', 'Senior Faculty', 9),
('Mrs. Sunita Goel', 'sunita.g@school.com', '+91 98765 43214', 'Senior Faculty', 10)
ON CONFLICT (class_level) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone;
""")

# Step 2: Seed Saturday Timetable
print("Seeding Saturday timetable...")
saturday_sql = []
subjects = ['Mathematics', 'Science', 'English', 'Library', 'Physical Ed', 'Art & Craft']
periods = [('09:00', '10:00'), ('10:00', '11:00'), ('11:00', '12:00'), ('12:00', '13:00'), ('13:00', '14:00'), ('14:00', '15:00')]

for level in range(1, 11):
    for p_idx, (start, end) in enumerate(periods):
        p_num = p_idx + 1
        if p_num == 3:
            sub = 'Lunch Break'
        else:
            sub = subjects[(level + p_num) % len(subjects)]
        saturday_sql.append(f"({level}, 6, {p_num}, '{sub}', '{start}', '{end}')")

mcp(f"INSERT INTO public.timetable_periods (class_level, day_of_week, period_number, subject_name, start_time, end_time) VALUES {', '.join(saturday_sql)} ON CONFLICT DO NOTHING;")

print("DONE!")
