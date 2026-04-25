import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

subjects_by_grade = {
    'primary': ['Mathematics', 'Science', 'English', 'Hindi', 'EVS', 'Art & Craft', 'Physical Ed', 'Music'],
    'middle': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Ed', 'Library'],
    'senior': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Physical Ed', 'Economics']
}

periods = [
    ('09:00', '10:00'),
    ('10:00', '11:00'),
    ('11:00', '12:00'), # Lunch
    ('12:00', '13:00'),
    ('13:00', '14:00'),
    ('14:00', '15:00'),
]

sql_values = []
for grade in range(1, 11):
    sub_list = subjects_by_grade['primary'] if grade <= 5 else subjects_by_grade['middle'] if grade <= 8 else subjects_by_grade['senior']
    for day in range(1, 6): # Mon-Fri
        for p_idx, (start, end) in enumerate(periods):
            p_num = p_idx + 1
            if p_num == 3:
                subject = 'Lunch Break'
            else:
                # Rotate subjects based on day and period
                subject = sub_list[(day + p_num) % len(sub_list)]
            sql_values.append(f"({grade}, {day}, {p_num}, '{subject}', '{start}', '{end}')")

print(f"Generating SQL for {len(sql_values)} periods...")

query = f"INSERT INTO public.timetable_periods (class_level, day_of_week, period_number, subject_name, start_time, end_time) VALUES {', '.join(sql_values)} ON CONFLICT DO NOTHING;"

print("Executing SQL...")
result = mcp(query)
print(result[:500])
print("DONE!")
