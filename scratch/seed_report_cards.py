import json, subprocess, random, re

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

# 1. Get all student IDs
print("Fetching students...")
res = mcp("SELECT id FROM public.profiles WHERE role = 'student';")
try:
    res_json = json.loads(res)
    inner_text = res_json['result']['content'][0]['text']
    inner_json = json.loads(inner_text)
    sql_res_text = inner_json['result']
    start = sql_res_text.find('[')
    end = sql_res_text.rfind(']') + 1
    student_ids = [row['id'] for row in json.loads(sql_res_text[start:end])]
except:
    print("Failed to fetch students. MCP Response:", res)
    exit()

if not student_ids:
    print("No students found.")
    exit()

print(f"Found {len(student_ids)} students.")

years = ['2025-2026', '2024-2025', '2023-2024']
exams = [
    ('SI-1', 'SI'), ('SI-2', 'SI'), ('Half-Yearly', 'Term'),
    ('SI-3', 'SI'), ('SI-4', 'SI'), ('Half-Yearly (Annual)', 'Term')
]
subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science']

print("Clearing old data...")
mcp("DELETE FROM public.report_cards;")

sql_values = []
for s_id in student_ids:
    for year in years:
        base_score = random.randint(65, 92)
        for exam_name, exam_type in exams:
            for sub in subjects:
                marks = min(100, max(45, base_score + random.randint(-15, 8)))
                grade = 'A+' if marks >= 90 else 'A' if marks >= 80 else 'B+' if marks >= 70 else 'B' if marks >= 60 else 'C'
                sql_values.append(f"('{s_id}', '{exam_name}', '{exam_type}', '{sub}', {marks}, 100, '{grade}', '{year}')")

print(f"Total rows to insert: {len(sql_values)}")
batch_size = 50
for i in range(0, len(sql_values), batch_size):
    batch = sql_values[i:i+batch_size]
    query = f"INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, total_marks, grade, academic_year) VALUES {', '.join(batch)};"
    res = mcp(query)
    if '"error"' in res.lower():
        print(f"ERROR in batch {i//batch_size + 1}:", res)
    else:
        print(f"Batch {i//batch_size + 1} done.")

print("DONE!")
