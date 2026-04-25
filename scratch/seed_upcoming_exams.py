import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

# Seed Upcoming Exams for April/May 2026
print("Seeding upcoming exam dates...")
r = mcp("""
INSERT INTO public.exam_schedules (exam_name, exam_type, class_level, subject_name, exam_date) VALUES
('SI-4', 'SI', 5, 'Mathematics', '2026-04-20'),
('SI-4', 'SI', 5, 'Science', '2026-04-21'),
('SI-4', 'SI', 5, 'English', '2026-04-22'),
('SI-4', 'SI', 3, 'Mathematics', '2026-04-20'),
('SI-4', 'SI', 3, 'EVS', '2026-04-21'),
('Final Term', 'Half-Yearly', 5, 'Mathematics', '2026-05-10'),
('Final Term', 'Half-Yearly', 5, 'Science', '2026-05-11'),
('Final Term', 'Half-Yearly', 3, 'Hindi', '2026-05-10')
ON CONFLICT DO NOTHING;
""")
print("Done!")
