import json, subprocess, datetime

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, err = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

exam_periods = [
    ('SI-4 (Prep)', '2026-04-20', '2026-04-25'),
    ('SI-1', '2026-07-15', '2026-07-20'),
    ('SI-2', '2026-09-10', '2026-09-15'),
    ('Half-Yearly', '2026-10-05', '2026-10-15'),
]

subjects = ['Math', 'Science', 'English', 'Hindi', 'Social']

sql_values = []
for exam_name, start_date, end_date in exam_periods:
    start = datetime.datetime.strptime(start_date, '%Y-%m-%d')
    for i, sub in enumerate(subjects):
        curr_date = (start + datetime.timedelta(days=i)).strftime('%Y-%m-%d')
        for grade in range(1, 11):
            sql_values.append(f"('{exam_name}', 'SI', {grade}, '{sub}', '{curr_date}', 100)")

print(f"Total rows to insert: {len(sql_values)}")
print("Clearing table...")
print(mcp("DELETE FROM public.exam_schedules;"))

batch_size = 50
for i in range(0, len(sql_values), batch_size):
    batch = sql_values[i:i+batch_size]
    query = f"INSERT INTO public.exam_schedules (exam_name, exam_type, class_level, subject_name, exam_date, total_marks) VALUES {', '.join(batch)};"
    print(f"Inserting batch {i//batch_size + 1}...")
    res = mcp(query)
    if '"error"' in res.lower():
        print("ERROR in batch:", res)
    else:
        print("Batch successful.")

print("DONE!")
