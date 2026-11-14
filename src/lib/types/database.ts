export type UserRole = "admin" | "teacher" | "student";

export type AttendanceStatus = "present" | "absent" | "late";
export type ClassSessionStatus = "pending" | "completed" | "cancelled";
export type AccountStatus = "active" | "inactive" | "pending";
export type AdmissionStatus = "active" | "inactive" | "graduated" | "withdrawn" | "suspended";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  status: AccountStatus;
  avatar_url?: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  education_level: string;
  description?: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface Teacher {
  id: string;
  profile_id?: string | null;
  teacher_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  date_of_joining: string;
  assigned_education_levels: string[];
  status: "active" | "inactive";
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  subjects?: Subject[];
}

export interface Student {
  id: string;
  profile_id?: string | null;
  student_id: string;
  full_name: string;
  dob: string;
  age: number;
  gender?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  guardian_name: string;
  guardian_contact: string;
  previous_education?: string | null;
  last_completed_class?: string | null;
  previous_school?: string | null;
  education_level: string;
  admission_date: string;
  admission_status: AdmissionStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  subjects?: Subject[];
}

export interface ClassSession {
  id: string;
  session_code: string;
  teacher_id: string;
  subject_id: string;
  title?: string | null;
  education_level: string;
  topics_covered: string;
  class_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  attendance_status: ClassSessionStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  teacher?: Teacher;
  subject?: Subject;
  attendance_count?: number;
  present_count?: number;
}

export interface Attendance {
  id: string;
  class_session_id: string;
  student_id: string;
  subject_id: string;
  status: AttendanceStatus;
  late_duration_minutes: number;
  marked_by_teacher_id?: string | null;
  submitted_at: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  student?: Student;
  class_session?: ClassSession;
  subject?: Subject;
  teacher?: Teacher;
}

export interface AttendanceAuditLog {
  id: string;
  attendance_id: string;
  class_session_id: string;
  student_id: string;
  previous_status: AttendanceStatus | string;
  updated_status: AttendanceStatus;
  previous_late_duration?: number;
  updated_late_duration: number;
  changed_by_profile_id?: string | null;
  changed_by_name: string;
  reason?: string | null;
  changed_at: string;
  is_demo: boolean;
}

export interface DemoSettings {
  id: number;
  is_demo_mode: boolean;
  updated_by?: string | null;
  updated_at: string;
}

export interface SystemActivityLog {
  id: string;
  actor_profile_id?: string | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  is_demo: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClasses: number;
  overallAttendancePercentage: number;
  recentStudents: Student[];
  recentClasses: ClassSession[];
  recentActivities: SystemActivityLog[];
}
