import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

# Step 1: Create Mentors Table
print("Creating mentors table...")
r1 = mcp("""
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  class_level INT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public mentors view" ON public.mentors;
CREATE POLICY "Public mentors view" ON public.mentors FOR SELECT USING (true);
""")
print(r1[:200])

# Step 2: Seed Mentors
print("Seeding mentors...")
r2 = mcp("""
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
ON CONFLICT DO NOTHING;
""")
print(r2[:200])

# Step 3: Seed Timetable
print("Seeding timetable...")
r3 = mcp("""
INSERT INTO public.timetable_periods (class_level, day_of_week, period_number, subject_name, start_time, end_time) VALUES
(5, 1, 1, 'Mathematics', '09:00', '10:00'),
(5, 1, 2, 'Science', '10:00', '11:00'),
(5, 1, 3, 'Lunch Break', '11:00', '12:00'),
(5, 1, 4, 'English', '12:00', '13:00'),
(5, 1, 5, 'Social Studies', '13:00', '14:00'),
(5, 1, 6, 'Physical Ed', '14:00', '15:00'),
(3, 1, 1, 'Hindi', '09:00', '10:00'),
(3, 1, 2, 'Mathematics', '10:00', '11:00'),
(3, 1, 3, 'Lunch Break', '11:00', '12:00'),
(3, 1, 4, 'EVS', '12:00', '13:00'),
(3, 1, 5, 'Art & Craft', '13:00', '14:00'),
(3, 1, 6, 'Library', '14:00', '15:00')
ON CONFLICT DO NOTHING;
""")
print(r3[:200])

print("DONE!")
