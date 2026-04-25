import json, uuid, random
from datetime import datetime, timedelta

def generate_sql():
    families = [
        {
            "parent": {"email": "john@parent.com", "name": "John Doe"},
            "children": [
                {"name": "Michael Doe", "class": 8, "email": "michael.doe@student.com"},
                {"name": "Emily Doe", "class": 2, "email": "emily.doe@student.com"}
            ]
        },
        {
            "parent": {"email": "sarah@parent.com", "name": "Sarah Miller"},
            "children": [
                {"name": "David Miller", "class": 10, "email": "david.miller@student.com"}
            ]
        },
        {
            "parent": {"email": "robert@parent.com", "name": "Robert Wilson"},
            "children": [
                {"name": "Jessica Wilson", "class": 6, "email": "jessica.wilson@student.com"}
            ]
        }
    ]

    exams = [
        ('SI-1','SI'),('Half-Yearly 1','Half-Yearly'),('SI-2','SI'),
        ('SI-3','SI'),('Half-Yearly 2 (Annual)','Half-Yearly'),('SI-4','SI')
    ]

    subjects_map = {
        1: ['English','Hindi','Mathematics','EVS','Art & Craft'],
        2: ['English','Hindi','Mathematics','EVS','Art & Craft'],
        3: ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft'],
        4: ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft'],
        5: ['English','Hindi','Mathematics','EVS','Computer Science','Art & Craft'],
        6: ['English','Hindi','Mathematics','Science','Social Studies','Computer Science','Sanskrit'],
        7: ['English','Hindi','Mathematics','Science','Social Studies','Computer Science','Sanskrit'],
        8: ['English','Hindi','Mathematics','Science','Social Studies','Computer Science','Sanskrit'],
        9: ['English','Physics','Chemistry','Biology','History','Geography','Computer Science'],
        10: ['English','Physics','Chemistry','Biology','History','Geography','Computer Science']
    }

    sql_statements = []

    for family in families:
        p_id = str(uuid.uuid4())
        p_email = family['parent']['email']
        p_name = family['parent']['name']
        
        # Parent Auth & Profile
        sql_statements.append(f"""
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
        SELECT '{p_id}', '{p_email}', crypt('password123', gen_salt('bf')), now(), '{{"full_name": "{p_name}", "role": "parent"}}', '{{}}', 'authenticated', 'authenticated'
        WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '{p_email}');
        
        INSERT INTO public.profiles (id, email, full_name, role)
        SELECT id, email, raw_user_meta_data->>'full_name', 'parent'
        FROM auth.users WHERE email = '{p_email}'
        ON CONFLICT (id) DO NOTHING;
        """)

        # Get Parent ID (in case it existed)
        # We'll use a subquery for consistency in following statements
        p_id_sub = f"(SELECT id FROM auth.users WHERE email = '{p_email}')"

        for child in family['children']:
            c_id = str(uuid.uuid4())
            c_name = child['name']
            c_class = child['class']
            c_email = child['email']
            
            # Student Auth & Profile
            sql_statements.append(f"""
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
            SELECT '{c_id}', '{c_email}', crypt('password123', gen_salt('bf')), now(), '{{"full_name": "{c_name}", "role": "student"}}', '{{}}', 'authenticated', 'authenticated'
            WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '{c_email}');
            
            INSERT INTO public.profiles (id, email, full_name, role, class_level)
            SELECT id, email, raw_user_meta_data->>'full_name', 'student', {c_class}
            FROM auth.users WHERE email = '{c_email}'
            ON CONFLICT (id) DO NOTHING;
            """)

            c_id_sub = f"(SELECT id FROM auth.users WHERE email = '{c_email}')"

            # Parent-Student Link
            sql_statements.append(f"""
            INSERT INTO public.student_parents (student_id, parent_id)
            VALUES ({c_id_sub}, {p_id_sub})
            ON CONFLICT DO NOTHING;
            """)

            # Attendance
            for i in range(30):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                status = random.choice(['present', 'present', 'present', 'absent', 'late'])
                sql_statements.append(f"INSERT INTO public.attendance (student_id, date, status) VALUES ({c_id_sub}, '{date}', '{status}') ON CONFLICT DO NOTHING;")

            # Fees
            sql_statements.append(f"""
            INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
            VALUES 
            ({c_id_sub}, 'Term 1 Tuition Fee', 25000, '2025-06-15', 'PAID', '2025-06-10'),
            ({c_id_sub}, 'Term 2 Tuition Fee', 25000, '2025-11-15', 'PENDING', NULL)
            ON CONFLICT DO NOTHING;
            """)

            # Report Cards
            subs = subjects_map.get(c_class, subjects_map[1])
            for exam_name, exam_type in exams:
                for subj in subs:
                    m = random.randint(65, 98)
                    g = 'A+' if m>=90 else 'A' if m>=80 else 'B+' if m>=70 else 'B' if m>=60 else 'C'
                    sql_statements.append(f"INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ({c_id_sub}, '{exam_name}', '{exam_type}', '{subj}', {m}, '{g}');")

            # Achievements (with images)
            if c_name == "Michael Doe":
                achievements = [
                    ('Winner: Inter-School Debate 🏆', 'Won the first prize in the annual inter-school debate competition.', 'Academic', 'Trophy', '2026-03-15', 'achievement_trophy.png'),
                    ('Top Scorer: Math Olympiad 🏅', 'Achieved the highest score in the regional Mathematics Olympiad.', 'Academic', 'Medal', '2026-02-20', 'achievement_medal.png'),
                    ('First Prize: Science Fair 🔬', 'Created an innovative project on renewable energy.', 'Academic', 'Certificate', '2026-01-10', 'event_science.png')
                ]
                for title, desc, cat, award, date, img in achievements:
                    sql_statements.append(f"""
                    INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded, image_url)
                    VALUES ({c_id_sub}, '{title}', '{desc}', '{cat}', '{award}', '{date}', '{img}')
                    ON CONFLICT DO NOTHING;
                    """)
            else:
                sql_statements.append(f"""
                INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded)
                VALUES ({c_id_sub}, 'Excellence in {subs[0]}', 'Outstanding performance in the last term', 'Academic', 'Certificate', CURRENT_DATE - INTERVAL '10 days')
                ON CONFLICT DO NOTHING;
                """)

    return sql_statements

if __name__ == "__main__":
    statements = generate_sql()
    # Output to a file for review/execution
    with open("seed_migration.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(statements))
    print(f"Generated {len(statements)} SQL statements in seed_migration.sql")
