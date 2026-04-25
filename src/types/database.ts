export type UserRole = 'student' | 'parent' | 'teacher';

export type AttendanceStatus = 'present' | 'absent' | 'late';
export type FeeStatus = 'paid' | 'pending' | 'overdue';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  teacher_name: string;
  schedule: string;
  room: string;
  created_at: string;
}

export interface StudentClass {
  student_id: string;
  class_id: string;
}

export interface StudentParent {
  student_id: string;
  parent_id: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  marked_at: string;
  // Joined fields
  class?: Class;
}

export interface Quiz {
  id: string;
  class_id: string;
  title: string;
  total_marks: number;
  quiz_date: string;
  created_at: string;
  // Joined
  class?: Class;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  submitted_at: string;
  // Joined
  quiz?: Quiz;
}

export interface Fee {
  id: string;
  student_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: FeeStatus;
  paid_at: string | null;
  created_at: string;
}

export interface AIInsight {
  summary: string;
  strengths: string[];
  improvements: string[];
  tips: string[];
  generated_at: string;
}

// Helper type for child info used in parent dashboard
export interface ChildInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
}
