import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=120)
    return out

# Step 1: Create tables
print("Creating tables...")
r = mcp("""
-- Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class_level INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Timetable periods
CREATE TABLE IF NOT EXISTS public.timetable_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_level INT NOT NULL,
  day_of_week INT NOT NULL,
  period_number INT NOT NULL,
  subject_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  teacher_name TEXT,
  room TEXT
);

-- Exam schedules
CREATE TABLE IF NOT EXISTS public.exam_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  class_level INT NOT NULL,
  subject_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  total_marks INT DEFAULT 100
);

-- Report cards (per student, per exam, per subject)
CREATE TABLE IF NOT EXISTS public.report_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  marks_obtained INT NOT NULL,
  total_marks INT DEFAULT 100,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  award_type TEXT,
  date_awarded DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public subjects view" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public timetable view" ON public.timetable_periods FOR SELECT USING (true);
CREATE POLICY "Public exam_schedules view" ON public.exam_schedules FOR SELECT USING (true);
CREATE POLICY "Public report_cards view" ON public.report_cards FOR SELECT USING (true);
CREATE POLICY "Public achievements view" ON public.achievements FOR SELECT USING (true);
""")
print(r[:200])
print("Tables created!")
