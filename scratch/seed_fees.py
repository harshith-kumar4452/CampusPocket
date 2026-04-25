import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=60)
    return out

# Seed fee data with UPPERCASE enum values
print("Seeding fees...")
r = mcp("""
INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
VALUES
-- Alice
('1bc63d81-95f6-42a7-a36a-4d47b7b7c03f', 'Term 1 Tuition Fee', 25000, '2026-01-15', 'PAID', '2026-01-10T10:00:00Z'),
('1bc63d81-95f6-42a7-a36a-4d47b7b7c03f', 'Term 1 Lab Fee', 5000, '2026-01-15', 'PAID', '2026-01-10T10:00:00Z'),
('1bc63d81-95f6-42a7-a36a-4d47b7b7c03f', 'Term 2 Tuition Fee', 25000, '2026-06-15', 'PENDING', NULL),
('1bc63d81-95f6-42a7-a36a-4d47b7b7c03f', 'Term 2 Lab Fee', 5000, '2026-06-15', 'PENDING', NULL),
('1bc63d81-95f6-42a7-a36a-4d47b7b7c03f', 'Annual Sports Fee', 3000, '2026-04-01', 'OVERDUE', NULL),
-- Bob
('82ed88a3-06ef-4d78-9c7c-d7a85084573d', 'Term 1 Tuition Fee', 25000, '2026-01-15', 'PAID', '2026-01-12T09:00:00Z'),
('82ed88a3-06ef-4d78-9c7c-d7a85084573d', 'Term 1 Lab Fee', 5000, '2026-01-15', 'PAID', '2026-01-12T09:00:00Z'),
('82ed88a3-06ef-4d78-9c7c-d7a85084573d', 'Term 2 Tuition Fee', 25000, '2026-06-15', 'PENDING', NULL),
('82ed88a3-06ef-4d78-9c7c-d7a85084573d', 'Annual Sports Fee', 3000, '2026-04-01', 'OVERDUE', NULL),
-- Charlie
('07a69d46-eba0-48ce-a2b1-612de8aa0d14', 'Term 1 Tuition Fee', 25000, '2026-01-15', 'PAID', '2026-01-14T11:00:00Z'),
('07a69d46-eba0-48ce-a2b1-612de8aa0d14', 'Term 2 Tuition Fee', 25000, '2026-06-15', 'PENDING', NULL);
""")
print(r[:300])
print("Done!")
