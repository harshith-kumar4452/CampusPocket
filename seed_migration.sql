
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
        SELECT '1520fd1e-e86a-4e81-9fae-d1dda7b618b9', 'rahul@parent.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Rahul Sharma", "role": "parent"}', '{}', 'authenticated', 'authenticated'
        WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rahul@parent.com');
        
        INSERT INTO public.profiles (id, email, full_name, role)
        SELECT id, email, raw_user_meta_data->>'full_name', 'parent'
        FROM auth.users WHERE email = 'rahul@parent.com'
        ON CONFLICT (id) DO NOTHING;
        

            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
            SELECT '2d123c20-ef05-4123-8ca8-9e9a4de71e68', 'arjun@student.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Arjun Sharma", "role": "student"}', '{}', 'authenticated', 'authenticated'
            WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'arjun@student.com');
            
            INSERT INTO public.profiles (id, email, full_name, role, class_level)
            SELECT id, email, raw_user_meta_data->>'full_name', 'student', 8
            FROM auth.users WHERE email = 'arjun@student.com'
            ON CONFLICT (id) DO NOTHING;
            

            INSERT INTO public.student_parents (student_id, parent_id)
            VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), (SELECT id FROM auth.users WHERE email = 'rahul@parent.com'))
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-25', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-24', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-23', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-22', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-21', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-20', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-19', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-18', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-17', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-16', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-15', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-14', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-13', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-12', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-11', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-10', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-09', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-08', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-07', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-06', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-05', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-04', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-03', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-02', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-04-01', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-03-31', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-03-30', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-03-29', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-03-28', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), '2026-03-27', 'present') ON CONFLICT DO NOTHING;

            INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
            VALUES 
            ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Term 1 Tuition Fee', 25000, '2025-06-15', 'PAID', '2025-06-10'),
            ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Term 2 Tuition Fee', 25000, '2025-11-15', 'PENDING', NULL)
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'English', 71, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'Hindi', 94, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'Mathematics', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'Science', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'Social Studies', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'Computer Science', 86, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-1', 'SI', 'Sanskrit', 80, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'English', 81, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Hindi', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Mathematics', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Science', 96, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Social Studies', 93, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Computer Science', 85, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Sanskrit', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'English', 92, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'Hindi', 88, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'Mathematics', 92, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'Science', 86, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'Social Studies', 96, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'Computer Science', 90, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-2', 'SI', 'Sanskrit', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'English', 85, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'Hindi', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'Mathematics', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'Science', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'Social Studies', 83, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'Computer Science', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-3', 'SI', 'Sanskrit', 94, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'English', 88, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Hindi', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Mathematics', 94, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Science', 81, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Social Studies', 67, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Computer Science', 85, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Sanskrit', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'English', 68, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'Hindi', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'Mathematics', 82, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'Science', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'Social Studies', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'Computer Science', 81, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'SI-4', 'SI', 'Sanskrit', 77, 'B+');

                    INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded, image_url)
                    VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Winner: Inter-School Debate 🏆', 'Won the first prize in the annual inter-school debate competition.', 'Academic', 'Trophy', '2026-03-15', 'achievement_trophy.png')
                    ON CONFLICT DO NOTHING;
                    

                    INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded, image_url)
                    VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'Top Scorer: Math Olympiad 🏅', 'Achieved the highest score in the regional Mathematics Olympiad.', 'Academic', 'Medal', '2026-02-20', 'achievement_medal.png')
                    ON CONFLICT DO NOTHING;
                    

                    INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded, image_url)
                    VALUES ((SELECT id FROM auth.users WHERE email = 'arjun@student.com'), 'First Prize: Science Fair 🔬', 'Created an innovative project on renewable energy.', 'Academic', 'Certificate', '2026-01-10', 'event_science.png')
                    ON CONFLICT DO NOTHING;
                    

            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
            SELECT '33ce22b7-868c-486a-b57b-30820eec6419', 'ishani@student.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Ishani Sharma", "role": "student"}', '{}', 'authenticated', 'authenticated'
            WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ishani@student.com');
            
            INSERT INTO public.profiles (id, email, full_name, role, class_level)
            SELECT id, email, raw_user_meta_data->>'full_name', 'student', 2
            FROM auth.users WHERE email = 'ishani@student.com'
            ON CONFLICT (id) DO NOTHING;
            

            INSERT INTO public.student_parents (student_id, parent_id)
            VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), (SELECT id FROM auth.users WHERE email = 'rahul@parent.com'))
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-25', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-24', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-23', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-22', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-21', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-20', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-19', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-18', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-17', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-16', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-15', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-14', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-13', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-12', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-11', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-10', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-09', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-08', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-07', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-06', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-05', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-04', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-03', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-02', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-04-01', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-03-31', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-03-30', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-03-29', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-03-28', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), '2026-03-27', 'absent') ON CONFLICT DO NOTHING;

            INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
            VALUES 
            ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Term 1 Tuition Fee', 25000, '2025-06-15', 'PAID', '2025-06-10'),
            ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Term 2 Tuition Fee', 25000, '2025-11-15', 'PENDING', NULL)
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-1', 'SI', 'English', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-1', 'SI', 'Hindi', 67, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-1', 'SI', 'Mathematics', 88, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-1', 'SI', 'EVS', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-1', 'SI', 'Art & Craft', 82, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'English', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Hindi', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Mathematics', 90, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'EVS', 87, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Art & Craft', 96, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-2', 'SI', 'English', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-2', 'SI', 'Hindi', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-2', 'SI', 'Mathematics', 96, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-2', 'SI', 'EVS', 93, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-2', 'SI', 'Art & Craft', 90, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-3', 'SI', 'English', 76, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-3', 'SI', 'Hindi', 79, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-3', 'SI', 'Mathematics', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-3', 'SI', 'EVS', 82, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-3', 'SI', 'Art & Craft', 80, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'English', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Hindi', 91, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Mathematics', 66, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'EVS', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Art & Craft', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-4', 'SI', 'English', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-4', 'SI', 'Hindi', 74, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-4', 'SI', 'Mathematics', 79, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-4', 'SI', 'EVS', 83, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'SI-4', 'SI', 'Art & Craft', 91, 'A+');

                INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded)
                VALUES ((SELECT id FROM auth.users WHERE email = 'ishani@student.com'), 'Excellence in English', 'Outstanding performance in the last term', 'Academic', 'Certificate', CURRENT_DATE - INTERVAL '10 days')
                ON CONFLICT DO NOTHING;
                

        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
        SELECT '1dedef55-31c9-4694-ab36-65d062bc38e3', 'shalini@parent.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Shalini Kumar", "role": "parent"}', '{}', 'authenticated', 'authenticated'
        WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shalini@parent.com');
        
        INSERT INTO public.profiles (id, email, full_name, role)
        SELECT id, email, raw_user_meta_data->>'full_name', 'parent'
        FROM auth.users WHERE email = 'shalini@parent.com'
        ON CONFLICT (id) DO NOTHING;
        

            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
            SELECT 'fe51887d-7e83-4788-862a-297a5446df95', 'vikram@student.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Vikram Kumar", "role": "student"}', '{}', 'authenticated', 'authenticated'
            WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vikram@student.com');
            
            INSERT INTO public.profiles (id, email, full_name, role, class_level)
            SELECT id, email, raw_user_meta_data->>'full_name', 'student', 10
            FROM auth.users WHERE email = 'vikram@student.com'
            ON CONFLICT (id) DO NOTHING;
            

            INSERT INTO public.student_parents (student_id, parent_id)
            VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), (SELECT id FROM auth.users WHERE email = 'shalini@parent.com'))
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-25', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-24', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-23', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-22', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-21', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-20', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-19', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-18', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-17', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-16', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-15', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-14', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-13', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-12', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-11', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-10', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-09', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-08', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-07', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-06', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-05', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-04', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-03', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-02', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-04-01', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-03-31', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-03-30', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-03-29', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-03-28', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), '2026-03-27', 'late') ON CONFLICT DO NOTHING;

            INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
            VALUES 
            ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Term 1 Tuition Fee', 25000, '2025-06-15', 'PAID', '2025-06-10'),
            ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Term 2 Tuition Fee', 25000, '2025-11-15', 'PENDING', NULL)
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'English', 90, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'Physics', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'Chemistry', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'Biology', 80, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'History', 88, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'Geography', 80, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-1', 'SI', 'Computer Science', 82, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'English', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Physics', 82, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Chemistry', 80, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Biology', 93, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'History', 69, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Geography', 71, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Computer Science', 68, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'English', 66, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'Physics', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'Chemistry', 71, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'Biology', 66, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'History', 86, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'Geography', 67, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-2', 'SI', 'Computer Science', 77, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'English', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'Physics', 66, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'Chemistry', 80, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'Biology', 72, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'History', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'Geography', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-3', 'SI', 'Computer Science', 81, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'English', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Physics', 94, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Chemistry', 77, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Biology', 79, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'History', 83, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Geography', 68, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Computer Science', 74, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'English', 81, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'Physics', 74, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'Chemistry', 82, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'Biology', 65, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'History', 91, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'Geography', 81, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'SI-4', 'SI', 'Computer Science', 66, 'B');

                INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded)
                VALUES ((SELECT id FROM auth.users WHERE email = 'vikram@student.com'), 'Excellence in English', 'Outstanding performance in the last term', 'Academic', 'Certificate', CURRENT_DATE - INTERVAL '10 days')
                ON CONFLICT DO NOTHING;
                

        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
        SELECT '48bb1647-9b00-4964-ad37-dc93dcd8e641', 'rajesh@parent.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Rajesh Verma", "role": "parent"}', '{}', 'authenticated', 'authenticated'
        WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rajesh@parent.com');
        
        INSERT INTO public.profiles (id, email, full_name, role)
        SELECT id, email, raw_user_meta_data->>'full_name', 'parent'
        FROM auth.users WHERE email = 'rajesh@parent.com'
        ON CONFLICT (id) DO NOTHING;
        

            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
            SELECT '33bce633-d223-4984-816d-11964025719e', 'jiya@student.com', crypt('password123', gen_salt('bf')), now(), '{"full_name": "Jiya Verma", "role": "student"}', '{}', 'authenticated', 'authenticated'
            WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jiya@student.com');
            
            INSERT INTO public.profiles (id, email, full_name, role, class_level)
            SELECT id, email, raw_user_meta_data->>'full_name', 'student', 6
            FROM auth.users WHERE email = 'jiya@student.com'
            ON CONFLICT (id) DO NOTHING;
            

            INSERT INTO public.student_parents (student_id, parent_id)
            VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), (SELECT id FROM auth.users WHERE email = 'rajesh@parent.com'))
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-25', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-24', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-23', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-22', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-21', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-20', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-19', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-18', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-17', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-16', 'late') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-15', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-14', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-13', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-12', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-11', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-10', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-09', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-08', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-07', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-06', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-05', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-04', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-03', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-02', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-04-01', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-03-31', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-03-30', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-03-29', 'absent') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-03-28', 'present') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance (student_id, date, status) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), '2026-03-27', 'present') ON CONFLICT DO NOTHING;

            INSERT INTO public.fees (student_id, title, amount, due_date, status, paid_at)
            VALUES 
            ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Term 1 Tuition Fee', 25000, '2025-06-15', 'PAID', '2025-06-10'),
            ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Term 2 Tuition Fee', 25000, '2025-11-15', 'PENDING', NULL)
            ON CONFLICT DO NOTHING;
            
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'English', 93, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'Hindi', 69, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'Mathematics', 69, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'Science', 72, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'Social Studies', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'Computer Science', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-1', 'SI', 'Sanskrit', 92, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'English', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Hindi', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Mathematics', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Science', 79, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Social Studies', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Computer Science', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 1', 'Half-Yearly', 'Sanskrit', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'English', 87, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'Hindi', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'Mathematics', 73, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'Science', 87, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'Social Studies', 77, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'Computer Science', 84, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-2', 'SI', 'Sanskrit', 97, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'English', 89, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'Hindi', 79, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'Mathematics', 71, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'Science', 65, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'Social Studies', 88, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'Computer Science', 77, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-3', 'SI', 'Sanskrit', 95, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'English', 66, 'B');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Hindi', 87, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Mathematics', 90, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Science', 92, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Social Studies', 71, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Computer Science', 91, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Half-Yearly 2 (Annual)', 'Half-Yearly', 'Sanskrit', 75, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'English', 78, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'Hindi', 91, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'Mathematics', 70, 'B+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'Science', 85, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'Social Studies', 96, 'A+');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'Computer Science', 85, 'A');
INSERT INTO public.report_cards (student_id, exam_name, exam_type, subject_name, marks_obtained, grade) VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'SI-4', 'SI', 'Sanskrit', 82, 'A');

                INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded)
                VALUES ((SELECT id FROM auth.users WHERE email = 'jiya@student.com'), 'Excellence in English', 'Outstanding performance in the last term', 'Academic', 'Certificate', CURRENT_DATE - INTERVAL '10 days')
                ON CONFLICT DO NOTHING;

                INSERT INTO public.achievements (student_id, title, description, category, award_type, date_awarded)
                VALUES ((SELECT id FROM auth.users WHERE email = 'jessica.wilson@student.com'), 'Excellence in English', 'Outstanding performance in the last term', 'Academic', 'Certificate', CURRENT_DATE - INTERVAL '10 days')
                ON CONFLICT DO NOTHING;
                