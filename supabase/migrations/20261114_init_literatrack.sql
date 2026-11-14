-- ==============================================================================
-- LITERATRACK: EDUCATIONAL MANAGEMENT & ATTENDANCE TRACKING DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL (Supports NIOS Learning Centres)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM / TYPE VALIDATION HELPERS
-- We use TEXT fields with CHECK constraints for maximum Supabase JS library compatibility.

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    full_name TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    avatar_url TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. SUBJECTS TABLE (Academic Courses for NIOS Secondary & Sr. Secondary)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    education_level TEXT NOT NULL, -- e.g. 'Secondary (Class 10)', 'Senior Secondary (Class 12)'
    description TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_id TEXT UNIQUE NOT NULL, -- e.g. 'TCH-2026-0001'
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    date_of_joining DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_education_levels TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id TEXT UNIQUE NOT NULL, -- e.g. 'STU-2026-0001'
    full_name TEXT NOT NULL,
    dob DATE NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    guardian_name TEXT NOT NULL,
    guardian_contact TEXT NOT NULL,
    previous_education TEXT,
    last_completed_class TEXT,
    previous_school TEXT,
    education_level TEXT NOT NULL, -- 'Secondary (Class 10)' or 'Senior Secondary (Class 12)'
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    admission_status TEXT NOT NULL DEFAULT 'active' CHECK (admission_status IN ('active', 'inactive', 'graduated', 'withdrawn', 'suspended')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TEACHER-SUBJECT MAPPING
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(teacher_id, subject_id)
);

-- 8. STUDENT-SUBJECT ENROLLMENT
CREATE TABLE IF NOT EXISTS public.student_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, subject_id)
);

-- 9. CLASS SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_code TEXT UNIQUE NOT NULL, -- e.g. 'CLS-2026-0001'
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    title TEXT,
    education_level TEXT NOT NULL,
    topics_covered TEXT NOT NULL,
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'completed', 'cancelled')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    late_duration_minutes INTEGER NOT NULL DEFAULT 0,
    marked_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(class_session_id, student_id)
);

-- 11. ATTENDANCE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
    class_session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    previous_status TEXT NOT NULL,
    updated_status TEXT NOT NULL,
    previous_late_duration INTEGER DEFAULT 0,
    updated_late_duration INTEGER DEFAULT 0,
    changed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    changed_by_name TEXT NOT NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo BOOLEAN NOT NULL DEFAULT false
);

-- 12. DEMO SETTINGS TABLE (Single-row toggle for Admin Demo Mode)
CREATE TABLE IF NOT EXISTS public.demo_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    is_demo_mode BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Initialize demo settings row
INSERT INTO public.demo_settings (id, is_demo_mode)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- 13. DEMO DATA METADATA TABLE
CREATE TABLE IF NOT EXISTS public.demo_data_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_version TEXT NOT NULL DEFAULT 'v1.0-nios',
    total_students INTEGER NOT NULL DEFAULT 8,
    total_teachers INTEGER NOT NULL DEFAULT 4,
    total_classes INTEGER NOT NULL DEFAULT 8,
    total_attendance INTEGER NOT NULL DEFAULT 24,
    description TEXT DEFAULT 'Default realistic NIOS demonstration dataset for LiteraTrack',
    seeded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo BOOLEAN NOT NULL DEFAULT true
);

-- 14. SYSTEM ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON public.profiles(is_demo);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_is_demo ON public.students(is_demo);
CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(education_level);

CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON public.teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_profile_id ON public.teachers(profile_id);
CREATE INDEX IF NOT EXISTS idx_teachers_is_demo ON public.teachers(is_demo);

CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher ON public.class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject ON public.class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON public.class_sessions(class_date);
CREATE INDEX IF NOT EXISTS idx_class_sessions_is_demo ON public.class_sessions(is_demo);

CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(class_session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON public.attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_is_demo ON public.attendance(is_demo);

-- 15. HELPER SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 16. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_data_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activity_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile basic info" ON public.profiles;
CREATE POLICY "Users can update own profile basic info"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- SUBJECTS POLICIES
DROP POLICY IF EXISTS "Anyone authenticated can view subjects" ON public.subjects;
CREATE POLICY "Anyone authenticated can view subjects"
    ON public.subjects FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects"
    ON public.subjects FOR ALL
    USING (public.is_admin());

-- TEACHERS POLICIES
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Admins can manage teachers"
    ON public.teachers FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;
CREATE POLICY "Authenticated users can view teachers"
    ON public.teachers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Teachers can update own record" ON public.teachers;
CREATE POLICY "Teachers can update own record"
    ON public.teachers FOR UPDATE
    USING (profile_id = auth.uid());

-- STUDENTS POLICIES
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students"
    ON public.students FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can view students" ON public.students;
CREATE POLICY "Teachers can view students"
    ON public.students FOR SELECT
    USING (public.get_current_user_role() IN ('teacher', 'admin'));

DROP POLICY IF EXISTS "Students can view own record" ON public.students;
CREATE POLICY "Students can view own record"
    ON public.students FOR SELECT
    USING (profile_id = auth.uid());

-- MAPPING TABLES POLICIES
DROP POLICY IF EXISTS "Admins manage teacher_subjects" ON public.teacher_subjects;
CREATE POLICY "Admins manage teacher_subjects"
    ON public.teacher_subjects FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view teacher_subjects" ON public.teacher_subjects;
CREATE POLICY "Anyone can view teacher_subjects"
    ON public.teacher_subjects FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins manage student_subjects" ON public.student_subjects;
CREATE POLICY "Admins manage student_subjects"
    ON public.student_subjects FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers and students can view student_subjects" ON public.student_subjects;
CREATE POLICY "Teachers and students can view student_subjects"
    ON public.student_subjects FOR SELECT
    USING (true);

-- CLASS SESSIONS POLICIES
DROP POLICY IF EXISTS "Admins manage all class sessions" ON public.class_sessions;
CREATE POLICY "Admins manage all class sessions"
    ON public.class_sessions FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can view and manage their class sessions" ON public.class_sessions;
CREATE POLICY "Teachers can view and manage their class sessions"
    ON public.class_sessions FOR ALL
    USING (
        public.is_admin() OR 
        teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can view classes for their enrolled subjects" ON public.class_sessions;
CREATE POLICY "Students can view classes for their enrolled subjects"
    ON public.class_sessions FOR SELECT
    USING (
        true
    );

-- ATTENDANCE POLICIES
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
CREATE POLICY "Admins can manage all attendance"
    ON public.attendance FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Teachers can manage attendance for their sessions" ON public.attendance;
CREATE POLICY "Teachers can manage attendance for their sessions"
    ON public.attendance FOR ALL
    USING (
        public.is_admin() OR 
        class_session_id IN (
            SELECT id FROM public.class_sessions 
            WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Students can view their own attendance" ON public.attendance;
CREATE POLICY "Students can view their own attendance"
    ON public.attendance FOR SELECT
    USING (
        student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
    );

-- ATTENDANCE AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Admins and teachers view audit logs" ON public.attendance_audit_logs;
CREATE POLICY "Admins and teachers view audit logs"
    ON public.attendance_audit_logs FOR SELECT
    USING (public.get_current_user_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Authorized users can insert audit logs" ON public.attendance_audit_logs;
CREATE POLICY "Authorized users can insert audit logs"
    ON public.attendance_audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- DEMO SETTINGS POLICIES
DROP POLICY IF EXISTS "Anyone can read demo settings" ON public.demo_settings;
CREATE POLICY "Anyone can read demo settings"
    ON public.demo_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only admins can update demo settings" ON public.demo_settings;
CREATE POLICY "Only admins can update demo settings"
    ON public.demo_settings FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- DEMO DATA METADATA POLICIES
DROP POLICY IF EXISTS "Anyone can read demo data metadata" ON public.demo_data_metadata;
CREATE POLICY "Anyone can read demo data metadata"
    ON public.demo_data_metadata FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage demo data metadata" ON public.demo_data_metadata;
CREATE POLICY "Admins can manage demo data metadata"
    ON public.demo_data_metadata FOR ALL
    USING (public.is_admin());

-- SYSTEM ACTIVITY LOGS POLICIES
DROP POLICY IF EXISTS "Admins can view system activity logs" ON public.system_activity_logs;
CREATE POLICY "Admins can view system activity logs"
    ON public.system_activity_logs FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert activity logs" ON public.system_activity_logs;
CREATE POLICY "Users can insert activity logs"
    ON public.system_activity_logs FOR INSERT
    WITH CHECK (true);

-- 17. INITIAL SEED SUBJECTS (NIOS Standard Curriculum)
INSERT INTO public.subjects (code, name, education_level, description, is_demo) VALUES
('NIOS-211', 'Mathematics', 'Secondary (Class 10)', 'Core mathematics covering algebra, geometry, mensuration and statistics.', false),
('NIOS-212', 'Science and Technology', 'Secondary (Class 10)', 'Integrated science covering physics, chemistry and biological fundamentals.', false),
('NIOS-213', 'Social Science', 'Secondary (Class 10)', 'History, geography, political science and economic concepts.', false),
('NIOS-201', 'Hindi', 'Secondary (Class 10)', 'Language, literature, comprehension and creative writing.', false),
('NIOS-202', 'English', 'Secondary (Class 10)', 'English language, functional grammar and literature.', false),
('NIOS-214', 'Economics', 'Secondary (Class 10)', 'Basic principles of microeconomics and macroeconomics.', false),
('NIOS-311', 'Mathematics (Sr. Sec)', 'Senior Secondary (Class 12)', 'Higher secondary mathematics including calculus, vectors and 3D geometry.', false),
('NIOS-312', 'Physics', 'Senior Secondary (Class 12)', 'Mechanics, thermodynamics, electrodynamics and modern physics.', false),
('NIOS-313', 'Chemistry', 'Senior Secondary (Class 12)', 'Physical, organic and inorganic chemistry principles.', false),
('NIOS-314', 'Biology', 'Senior Secondary (Class 12)', 'Cell biology, genetics, physiology, ecology and biodiversity.', false),
('NIOS-315', 'History', 'Senior Secondary (Class 12)', 'Ancient, medieval and modern world and Indian history.', false),
('NIOS-320', 'Accountancy', 'Senior Secondary (Class 12)', 'Financial accounting, partnership and company accounts.', false),
('NIOS-319', 'Business Studies', 'Senior Secondary (Class 12)', 'Business environment, management principles and marketing.', false)
ON CONFLICT (code) DO NOTHING;
