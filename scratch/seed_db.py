import json
import subprocess
import sys
import uuid

def talk_to_mcp(command, input_json):
    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True
    )
    
    stdout, stderr = process.communicate(input=json.dumps(input_json) + '\n', timeout=60)
    return stdout, stderr

cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'

# Define UUIDs
alice_id = str(uuid.uuid4())
bob_id = str(uuid.uuid4())
charlie_id = str(uuid.uuid4())
smith_parent_id = str(uuid.uuid4())
brown_parent_id = str(uuid.uuid4())

math_class_id = str(uuid.uuid4())
physics_class_id = str(uuid.uuid4())

math_quiz_id = str(uuid.uuid4())
physics_quiz_id = str(uuid.uuid4())

sql_query = f"""
-- Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert into auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
('{alice_id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@student.com', crypt('password123', gen_salt('bf')), now(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"Alice Smith","role":"student"}}', now(), now()),
('{bob_id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@student.com', crypt('password123', gen_salt('bf')), now(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"Bob Smith","role":"student"}}', now(), now()),
('{charlie_id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@student.com', crypt('password123', gen_salt('bf')), now(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"Charlie Brown","role":"student"}}', now(), now()),
('{smith_parent_id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'smith@parent.com', crypt('password123', gen_salt('bf')), now(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"Mr. Smith","role":"parent"}}', now(), now()),
('{brown_parent_id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'brown@parent.com', crypt('password123', gen_salt('bf')), now(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"Mrs. Brown","role":"parent"}}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.profiles
INSERT INTO public.profiles (id, full_name, email, role, created_at)
VALUES
('{alice_id}', 'Alice Smith', 'alice@student.com', 'student', now()),
('{bob_id}', 'Bob Smith', 'bob@student.com', 'student', now()),
('{charlie_id}', 'Charlie Brown', 'charlie@student.com', 'student', now()),
('{smith_parent_id}', 'Mr. Smith', 'smith@parent.com', 'parent', now()),
('{brown_parent_id}', 'Mrs. Brown', 'brown@parent.com', 'parent', now())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert into public.student_parents (Linking parents to children)
-- Mr. Smith has TWO children: Alice and Bob
INSERT INTO public.student_parents (student_id, parent_id)
VALUES
('{alice_id}', '{smith_parent_id}'),
('{bob_id}', '{smith_parent_id}'),
('{charlie_id}', '{brown_parent_id}')
ON CONFLICT (student_id, parent_id) DO NOTHING;

-- 4. Insert into public.classes
INSERT INTO public.classes (id, name, subject, teacher_name, schedule, room)
VALUES
('{math_class_id}', 'Mathematics 101', 'Math', 'Mr. Newton', 'Mon/Wed/Fri 09:00 AM', 'Room A1'),
('{physics_class_id}', 'Physics 202', 'Physics', 'Dr. Einstein', 'Tue/Thu 11:00 AM', 'Lab 3')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert into public.student_classes
INSERT INTO public.student_classes (student_id, class_id)
VALUES
('{alice_id}', '{math_class_id}'),
('{alice_id}', '{physics_class_id}'),
('{bob_id}', '{math_class_id}'),
('{charlie_id}', '{physics_class_id}')
ON CONFLICT (student_id, class_id) DO NOTHING;

-- 6. Insert into public.quizzes
INSERT INTO public.quizzes (id, class_id, title, total_marks, quiz_date)
VALUES
('{math_quiz_id}', '{math_class_id}', 'Math Midterm', 100, now() - INTERVAL '3 days'),
('{physics_quiz_id}', '{physics_class_id}', 'Physics Pop Quiz', 50, now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert into public.quiz_results
INSERT INTO public.quiz_results (quiz_id, student_id, score, submitted_at)
VALUES
('{math_quiz_id}', '{alice_id}', 95, now() - INTERVAL '3 days'),
('{math_quiz_id}', '{bob_id}', 78, now() - INTERVAL '3 days'),
('{physics_quiz_id}', '{alice_id}', 48, now() - INTERVAL '1 day'),
('{physics_quiz_id}', '{charlie_id}', 42, now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert into public.attendance
INSERT INTO public.attendance (student_id, class_id, date, status, marked_at)
VALUES
('{alice_id}', '{math_class_id}', current_date, 'present', now()),
('{alice_id}', '{physics_class_id}', current_date - INTERVAL '1 day', 'present', now() - INTERVAL '1 day'),
('{bob_id}', '{math_class_id}', current_date, 'late', now()),
('{charlie_id}', '{physics_class_id}', current_date - INTERVAL '1 day', 'absent', now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

"""

# Call execute_sql
execute_sql_req = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "execute_sql",
        "arguments": {
            "project_id": "lwoahalttiywfozilnts",
            "query": sql_query
        }
    }
}

print("Seeding database...")
stdout, stderr = talk_to_mcp(cmd, execute_sql_req)

with open('seed_result.json', 'w', encoding='utf-8') as f:
    f.write(stdout)

if stderr:
    print("STDERR:", stderr, file=sys.stderr)
else:
    print("Database seeded. See seed_result.json")
