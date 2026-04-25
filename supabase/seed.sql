-- 1. Insert Classes
INSERT INTO classes (name, subject, teacher_name, schedule, room) VALUES
('Mathematics 101', 'Math', 'Dr. Sanjay Gupta', 'Mon/Wed 09:00 AM', '302'),
('Physics II', 'Science', 'Prof. Arvind Kumar', 'Tue/Thu 11:00 AM', '105'),
('English Literature', 'English', 'Ms. Anjali Singh', 'Mon/Wed 02:00 PM', '201'),
('Modern History', 'History', 'Mr. Vikram Verma', 'Fri 10:00 AM', '404');

-- NOTE: You must have users in auth.users to run the following. 
-- Replace 'STUDENT_ID_1', 'PARENT_ID_1' etc with actual UUIDs from your Supabase Auth dashboard.

/*
-- Example Seed for Profiles (Uncomment and replace IDs after creating users)

INSERT INTO profiles (id, full_name, email, role) VALUES
('STUDENT_ID_1', 'Rahul Sharma', 'rahul@student.com', 'student'),
('STUDENT_ID_2', 'Priya Patel', 'priya@student.com', 'student'),
('PARENT_ID_1', 'Rajesh Sharma', 'rajesh@parent.com', 'parent');

INSERT INTO student_parents (student_id, parent_id) VALUES
('STUDENT_ID_1', 'PARENT_ID_1');

INSERT INTO student_classes (student_id, class_id) VALUES
('STUDENT_ID_1', (SELECT id FROM classes LIMIT 1)),
('STUDENT_ID_1', (SELECT id FROM classes OFFSET 1 LIMIT 1));

INSERT INTO attendance (student_id, class_id, date, status) VALUES
('STUDENT_ID_1', (SELECT id FROM classes LIMIT 1), CURRENT_DATE, 'present'),
('STUDENT_ID_1', (SELECT id FROM classes LIMIT 1), CURRENT_DATE - 1, 'present'),
('STUDENT_ID_1', (SELECT id FROM classes LIMIT 1), CURRENT_DATE - 2, 'absent'),
('STUDENT_ID_1', (SELECT id FROM classes LIMIT 1), CURRENT_DATE - 3, 'late');

INSERT INTO quizzes (class_id, title, total_marks, quiz_date) VALUES
((SELECT id FROM classes LIMIT 1), 'Algebra Midterm', 50, CURRENT_DATE - 10),
((SELECT id FROM classes LIMIT 1), 'Geometry Quiz', 20, CURRENT_DATE - 2);

INSERT INTO quiz_results (quiz_id, student_id, score) VALUES
((SELECT id FROM quizzes LIMIT 1), 'STUDENT_ID_1', 42),
((SELECT id FROM quizzes OFFSET 1 LIMIT 1), 'STUDENT_ID_1', 18);

INSERT INTO fees (student_id, title, amount, due_date, status) VALUES
('STUDENT_ID_1', 'Tuition Fee - Q2', 15000, CURRENT_DATE + 30, 'pending'),
('STUDENT_ID_1', 'Library Fee', 500, CURRENT_DATE - 5, 'overdue'),
('STUDENT_ID_1', 'Sports Fee', 1200, CURRENT_DATE - 60, 'paid');
*/
