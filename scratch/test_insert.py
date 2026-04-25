import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=60)
    return out

# Try to insert one row
q = "INSERT INTO public.report_cards (student_id, exam_name, subject_name, marks_obtained, total_marks, grade, academic_year) VALUES ('1ce2395a-21d0-4830-98d4-d999e8f0fd55', 'Test Exam', 'Test Subject', 80, 100, 'A', '2025-2026');"
print(mcp(q))
