import { createClient } from "./supabase/client";
import {
  Student,
  Teacher,
  Subject,
  ClassSession,
  Attendance,
  AttendanceAuditLog,
  SystemActivityLog,
  DashboardStats,
  AttendanceStatus,
} from "./types/database";
import {
  DEMO_STUDENTS,
  DEMO_TEACHERS,
  DEMO_SUBJECTS,
  DEMO_CLASSES,
  DEMO_ATTENDANCE,
  DEMO_AUDIT_LOGS,
  DEMO_ACTIVITY_LOGS,
} from "./demo/demo-data";

const STORAGE_KEYS = {
  DEMO_MODE: "literatrack_demo_mode_enabled",
  CUSTOM_STUDENTS: "literatrack_custom_students",
  CUSTOM_TEACHERS: "literatrack_custom_teachers",
  CUSTOM_CLASSES: "literatrack_custom_classes",
  CUSTOM_ATTENDANCE: "literatrack_custom_attendance",
  CUSTOM_AUDIT_LOGS: "literatrack_custom_audit_logs",
  CUSTOM_ACTIVITIES: "literatrack_custom_activities",
};

export class DataService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- DEMO MODE TOGGLE ---
  static getDemoMode(): boolean {
    if (!this.isBrowser()) return true; // Default to demo in SSR for initial render if needed
    const stored = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
    if (stored === null) {
      // default to true so first-time visitors can explore realistic data immediately!
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, "true");
      return true;
    }
    return stored === "true";
  }

  static setDemoMode(enabled: boolean): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? "true" : "false");
      window.dispatchEvent(new Event("literatrack_demo_mode_changed"));
    }
  }

  static resetDemoData(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_TEACHERS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CLASSES);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_ATTENDANCE);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_AUDIT_LOGS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_ACTIVITIES);
      window.dispatchEvent(new Event("literatrack_demo_mode_changed"));
    }
  }

  // --- SUBJECTS ---
  static async getSubjects(): Promise<Subject[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("subjects").select("*").order("name");
      if (!error && data && data.length > 0) {
        return data as Subject[];
      }
    } catch {
      // Fallback
    }
    return DEMO_SUBJECTS;
  }

  // --- STUDENTS ---
  static async getStudents(includeDemo?: boolean): Promise<Student[]> {
    const isDemo = includeDemo ?? this.getDemoMode();
    const supabase = createClient();

    try {
      let query = supabase.from("students").select(`
        *,
        student_subjects (
          subject:subjects (*)
        )
      `);
      if (!isDemo) {
        query = query.eq("is_demo", false);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          ...s,
          subjects: s.student_subjects?.map((ss: any) => ss.subject).filter(Boolean) || [],
        }));
      }
    } catch {
      // Supabase table not created yet or query error
    }

    // Local / Demo Store fallback
    let customList: Student[] = [];
    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_STUDENTS);
      if (stored) {
        try {
          customList = JSON.parse(stored);
        } catch {}
      }
    }

    const demoRecords = isDemo ? DEMO_STUDENTS : [];
    // Filter custom records by demo status
    const filteredCustom = customList.filter((s) => (isDemo ? true : !s.is_demo));
    return [...filteredCustom, ...demoRecords];
  }

  static async getStudentById(id: string): Promise<Student | null> {
    const students = await this.getStudents(true);
    return students.find((s) => s.id === id || s.student_id === id) || null;
  }

  static async createStudent(
    studentData: Omit<Student, "id" | "created_at" | "updated_at">
  ): Promise<Student> {
    const isDemo = studentData.is_demo ?? this.getDemoMode();
    const newStudent: Student = {
      ...studentData,
      id: `stu-${Date.now()}`,
      is_demo: isDemo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try Supabase insert
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("students")
        .insert({
          student_id: newStudent.student_id,
          full_name: newStudent.full_name,
          dob: newStudent.dob,
          age: newStudent.age,
          gender: newStudent.gender,
          email: newStudent.email,
          phone: newStudent.phone,
          address: newStudent.address,
          guardian_name: newStudent.guardian_name,
          guardian_contact: newStudent.guardian_contact,
          previous_education: newStudent.previous_education,
          last_completed_class: newStudent.last_completed_class,
          previous_school: newStudent.previous_school,
          education_level: newStudent.education_level,
          admission_date: newStudent.admission_date,
          admission_status: newStudent.admission_status,
          is_demo: newStudent.is_demo,
        })
        .select()
        .single();

      if (!error && data) {
        newStudent.id = data.id;
        // insert student subjects
        if (newStudent.subjects && newStudent.subjects.length > 0) {
          await supabase.from("student_subjects").insert(
            newStudent.subjects.map((sub) => ({
              student_id: data.id,
              subject_id: sub.id,
              is_demo: newStudent.is_demo,
            }))
          );
        }
      }
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_STUDENTS);
      const list: Student[] = stored ? JSON.parse(stored) : [];
      list.unshift(newStudent);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_STUDENTS, JSON.stringify(list));
      this.logActivity("LiteraTrack Admin", "STUDENT_REGISTERED", "Student", newStudent.student_id, {
        studentName: newStudent.full_name,
        level: newStudent.education_level,
      });
    }

    return newStudent;
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const supabase = createClient();
    try {
      await supabase
        .from("students")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_STUDENTS);
      let list: Student[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex((s) => s.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.CUSTOM_STUDENTS, JSON.stringify(list));
        return list[index];
      }
    }
    const demo = DEMO_STUDENTS.find((s) => s.id === id);
    if (demo) {
      return { ...demo, ...updates, updated_at: new Date().toISOString() };
    }
    return null;
  }

  // --- TEACHERS ---
  static async getTeachers(includeDemo?: boolean): Promise<Teacher[]> {
    const isDemo = includeDemo ?? this.getDemoMode();
    const supabase = createClient();

    try {
      let query = supabase.from("teachers").select(`
        *,
        teacher_subjects (
          subject:subjects (*)
        )
      `);
      if (!isDemo) {
        query = query.eq("is_demo", false);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({
          ...t,
          subjects: t.teacher_subjects?.map((ts: any) => ts.subject).filter(Boolean) || [],
        }));
      }
    } catch {
      // Fallback
    }

    let customList: Teacher[] = [];
    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEACHERS);
      if (stored) {
        try {
          customList = JSON.parse(stored);
        } catch {}
      }
    }

    const demoRecords = isDemo ? DEMO_TEACHERS : [];
    const filteredCustom = customList.filter((t) => (isDemo ? true : !t.is_demo));
    return [...filteredCustom, ...demoRecords];
  }

  static async getTeacherById(id: string): Promise<Teacher | null> {
    const teachers = await this.getTeachers(true);
    return teachers.find((t) => t.id === id || t.teacher_id === id) || null;
  }

  static async createTeacher(
    teacherData: Omit<Teacher, "id" | "created_at" | "updated_at">
  ): Promise<Teacher> {
    const isDemo = teacherData.is_demo ?? this.getDemoMode();
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch-${Date.now()}`,
      is_demo: isDemo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("teachers")
        .insert({
          teacher_id: newTeacher.teacher_id,
          full_name: newTeacher.full_name,
          email: newTeacher.email,
          phone: newTeacher.phone,
          address: newTeacher.address,
          date_of_joining: newTeacher.date_of_joining,
          assigned_education_levels: newTeacher.assigned_education_levels,
          status: newTeacher.status,
          is_demo: newTeacher.is_demo,
        })
        .select()
        .single();

      if (!error && data) {
        newTeacher.id = data.id;
        if (newTeacher.subjects && newTeacher.subjects.length > 0) {
          await supabase.from("teacher_subjects").insert(
            newTeacher.subjects.map((sub) => ({
              teacher_id: data.id,
              subject_id: sub.id,
              is_demo: newTeacher.is_demo,
            }))
          );
        }
      }
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEACHERS);
      const list: Teacher[] = stored ? JSON.parse(stored) : [];
      list.unshift(newTeacher);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TEACHERS, JSON.stringify(list));
      this.logActivity("LiteraTrack Admin", "TEACHER_REGISTERED", "Teacher", newTeacher.teacher_id, {
        teacherName: newTeacher.full_name,
      });
    }

    return newTeacher;
  }

  static async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
    const supabase = createClient();
    try {
      await supabase
        .from("teachers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEACHERS);
      let list: Teacher[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex((t) => t.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TEACHERS, JSON.stringify(list));
        return list[index];
      }
    }
    const demo = DEMO_TEACHERS.find((t) => t.id === id);
    if (demo) {
      return { ...demo, ...updates, updated_at: new Date().toISOString() };
    }
    return null;
  }

  // --- CLASSES ---
  static async getClassSessions(includeDemo?: boolean): Promise<ClassSession[]> {
    const isDemo = includeDemo ?? this.getDemoMode();
    const supabase = createClient();

    try {
      let query = supabase.from("class_sessions").select(`
        *,
        teacher:teachers (*),
        subject:subjects (*)
      `).order("class_date", { ascending: false });

      if (!isDemo) {
        query = query.eq("is_demo", false);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as ClassSession[];
      }
    } catch {
      // Fallback
    }

    let customList: ClassSession[] = [];
    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLASSES);
      if (stored) {
        try {
          customList = JSON.parse(stored);
        } catch {}
      }
    }

    const demoRecords = isDemo ? DEMO_CLASSES : [];
    const filteredCustom = customList.filter((c) => (isDemo ? true : !c.is_demo));
    return [...filteredCustom, ...demoRecords];
  }

  static async getClassSessionById(id: string): Promise<ClassSession | null> {
    const classes = await this.getClassSessions(true);
    return classes.find((c) => c.id === id || c.session_code === id) || null;
  }

  static async createClassSession(
    classData: Omit<ClassSession, "id" | "created_at" | "updated_at">
  ): Promise<ClassSession> {
    const isDemo = classData.is_demo ?? this.getDemoMode();
    const newClass: ClassSession = {
      ...classData,
      id: `cls-${Date.now()}`,
      is_demo: isDemo,
      attendance_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("class_sessions")
        .insert({
          session_code: newClass.session_code,
          teacher_id: newClass.teacher_id,
          subject_id: newClass.subject_id,
          title: newClass.title,
          education_level: newClass.education_level,
          topics_covered: newClass.topics_covered,
          class_date: newClass.class_date,
          start_time: newClass.start_time,
          end_time: newClass.end_time,
          duration_minutes: newClass.duration_minutes,
          attendance_status: "pending",
          is_demo: newClass.is_demo,
        })
        .select()
        .single();

      if (!error && data) {
        newClass.id = data.id;
      }
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLASSES);
      const list: ClassSession[] = stored ? JSON.parse(stored) : [];
      list.unshift(newClass);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CLASSES, JSON.stringify(list));
      this.logActivity(
        newClass.teacher?.full_name || "Teacher",
        "CLASS_CREATED",
        "ClassSession",
        newClass.session_code,
        {
          title: newClass.title,
          subject: newClass.subject?.name,
          date: newClass.class_date,
        }
      );
    }

    return newClass;
  }

  // --- AUTOMATIC STUDENT SELECTION FOR ATTENDANCE ---
  static async getEligibleStudentsForClass(classSessionId: string): Promise<Student[]> {
    const session = await this.getClassSessionById(classSessionId);
    if (!session) return [];

    const allStudents = await this.getStudents(session.is_demo);
    // Filter students:
    // 1. Must match education level (or compatible)
    // 2. Must be enrolled in session.subject_id
    // 3. Admission date <= class_date
    // 4. Admission status == 'active'
    return allStudents.filter((stu) => {
      const matchesLevel = stu.education_level === session.education_level;
      const isEnrolled = stu.subjects?.some(
        (sub) => sub.id === session.subject_id || sub.code === session.subject?.code
      );
      const admittedOnOrBefore = !stu.admission_date || stu.admission_date <= session.class_date;
      const isActive = stu.admission_status === "active";
      return matchesLevel && isEnrolled && admittedOnOrBefore && isActive;
    });
  }

  // --- ATTENDANCE ---
  static async getAttendanceRecords(includeDemo?: boolean): Promise<Attendance[]> {
    const isDemo = includeDemo ?? this.getDemoMode();
    const supabase = createClient();

    try {
      let query = supabase.from("attendance").select(`
        *,
        student:students (*),
        class_session:class_sessions (*),
        subject:subjects (*)
      `);
      if (!isDemo) {
        query = query.eq("is_demo", false);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Attendance[];
      }
    } catch {
      // Fallback
    }

    let customList: Attendance[] = [];
    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ATTENDANCE);
      if (stored) {
        try {
          customList = JSON.parse(stored);
        } catch {}
      }
    }

    const demoRecords = isDemo ? DEMO_ATTENDANCE : [];
    const filteredCustom = customList.filter((a) => (isDemo ? true : !a.is_demo));
    return [...filteredCustom, ...demoRecords];
  }

  static async getAttendanceForSession(classSessionId: string): Promise<Attendance[]> {
    const all = await this.getAttendanceRecords(true);
    return all.filter((a) => a.class_session_id === classSessionId);
  }

  static async submitAttendance(
    classSessionId: string,
    records: Array<{
      studentId: string;
      status: AttendanceStatus;
      lateDurationMinutes: number;
    }>,
    teacherId: string,
    teacherName: string
  ): Promise<boolean> {
    const session = await this.getClassSessionById(classSessionId);
    if (!session) return false;

    const newAttendanceList: Attendance[] = records.map((r, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      class_session_id: classSessionId,
      student_id: r.studentId,
      subject_id: session.subject_id,
      status: r.status,
      late_duration_minutes: r.status === "late" ? r.lateDurationMinutes : 0,
      marked_by_teacher_id: teacherId,
      submitted_at: new Date().toISOString(),
      is_demo: session.is_demo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Update class session status to completed
    const supabase = createClient();
    try {
      await supabase
        .from("class_sessions")
        .update({
          attendance_status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", classSessionId);

      await supabase.from("attendance").upsert(
        newAttendanceList.map((a) => ({
          class_session_id: a.class_session_id,
          student_id: a.student_id,
          subject_id: a.subject_id,
          status: a.status,
          late_duration_minutes: a.late_duration_minutes,
          marked_by_teacher_id: a.marked_by_teacher_id,
          submitted_at: a.submitted_at,
          is_demo: a.is_demo,
        }))
      );
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      // Update custom classes status
      const storedClasses = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLASSES);
      if (storedClasses) {
        const clsList: ClassSession[] = JSON.parse(storedClasses);
        const idx = clsList.findIndex((c) => c.id === classSessionId);
        if (idx !== -1) {
          clsList[idx].attendance_status = "completed";
          clsList[idx].attendance_count = records.length;
          clsList[idx].present_count = records.filter(
            (r) => r.status === "present" || r.status === "late"
          ).length;
          localStorage.setItem(STORAGE_KEYS.CUSTOM_CLASSES, JSON.stringify(clsList));
        }
      }

      // Append to custom attendance
      const storedAtt = localStorage.getItem(STORAGE_KEYS.CUSTOM_ATTENDANCE);
      const attList: Attendance[] = storedAtt ? JSON.parse(storedAtt) : [];
      // Remove any prior records for this session
      const filtered = attList.filter((a) => a.class_session_id !== classSessionId);
      filtered.push(...newAttendanceList);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ATTENDANCE, JSON.stringify(filtered));

      this.logActivity(teacherName, "ATTENDANCE_LOGGED", "Attendance", session.session_code, {
        sessionCode: session.session_code,
        totalLogged: records.length,
        present: records.filter((r) => r.status === "present").length,
        late: records.filter((r) => r.status === "late").length,
        absent: records.filter((r) => r.status === "absent").length,
      });
    }

    return true;
  }

  // --- ATTENDANCE EDITING WITH AUDIT LOG ---
  static async updateAttendanceRecord(
    attendanceId: string,
    updatedStatus: AttendanceStatus,
    updatedLateMinutes: number,
    changedByName: string,
    reason?: string
  ): Promise<boolean> {
    const all = await this.getAttendanceRecords(true);
    const existing = all.find((a) => a.id === attendanceId);
    if (!existing) return false;

    const previousStatus = existing.status;
    const previousLateDuration = existing.late_duration_minutes;

    const auditLog: AttendanceAuditLog = {
      id: `audit-${Date.now()}`,
      attendance_id: attendanceId,
      class_session_id: existing.class_session_id,
      student_id: existing.student_id,
      previous_status: previousStatus,
      updated_status: updatedStatus,
      previous_late_duration: previousLateDuration,
      updated_late_duration: updatedStatus === "late" ? updatedLateMinutes : 0,
      changed_by_name: changedByName,
      reason: reason || "Manual correction by authorized educator",
      changed_at: new Date().toISOString(),
      is_demo: existing.is_demo,
    };

    const supabase = createClient();
    try {
      await supabase
        .from("attendance")
        .update({
          status: updatedStatus,
          late_duration_minutes: updatedStatus === "late" ? updatedLateMinutes : 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", attendanceId);

      await supabase.from("attendance_audit_logs").insert({
        attendance_id: auditLog.attendance_id,
        class_session_id: auditLog.class_session_id,
        student_id: auditLog.student_id,
        previous_status: auditLog.previous_status,
        updated_status: auditLog.updated_status,
        previous_late_duration: auditLog.previous_late_duration,
        updated_late_duration: auditLog.updated_late_duration,
        changed_by_name: auditLog.changed_by_name,
        reason: auditLog.reason,
        is_demo: auditLog.is_demo,
      });
    } catch {
      // Fallback
    }

    if (this.isBrowser()) {
      // Update local storage
      const storedAtt = localStorage.getItem(STORAGE_KEYS.CUSTOM_ATTENDANCE);
      let attList: Attendance[] = storedAtt ? JSON.parse(storedAtt) : [];
      const idx = attList.findIndex((a) => a.id === attendanceId);
      if (idx !== -1) {
        attList[idx].status = updatedStatus;
        attList[idx].late_duration_minutes = updatedStatus === "late" ? updatedLateMinutes : 0;
        attList[idx].updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ATTENDANCE, JSON.stringify(attList));
      }

      // Add to custom audit logs
      const storedLogs = localStorage.getItem(STORAGE_KEYS.CUSTOM_AUDIT_LOGS);
      const logList: AttendanceAuditLog[] = storedLogs ? JSON.parse(storedLogs) : [];
      logList.unshift(auditLog);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_AUDIT_LOGS, JSON.stringify(logList));

      this.logActivity(changedByName, "ATTENDANCE_CORRECTED", "Attendance", attendanceId, {
        from: previousStatus,
        to: updatedStatus,
        reason,
      });
    }

    return true;
  }

  static async getAuditLogs(includeDemo?: boolean): Promise<AttendanceAuditLog[]> {
    const isDemo = includeDemo ?? this.getDemoMode();
    const supabase = createClient();

    try {
      let query = supabase.from("attendance_audit_logs").select("*").order("changed_at", { ascending: false });
      if (!isDemo) {
        query = query.eq("is_demo", false);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as AttendanceAuditLog[];
      }
    } catch {
      // Fallback
    }

    let customLogs: AttendanceAuditLog[] = [];
    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_AUDIT_LOGS);
      if (stored) {
        try {
          customLogs = JSON.parse(stored);
        } catch {}
      }
    }

    const demoRecords = isDemo ? DEMO_AUDIT_LOGS : [];
    const filteredCustom = customLogs.filter((l) => (isDemo ? true : !l.is_demo));
    return [...filteredCustom, ...demoRecords];
  }

  // --- STATS & CALCULATIONS (Formula: (Present + Late) / Total Conducted Classes * 100) ---
  static async calculateStudentStats(studentId: string, includeDemo?: boolean) {
    const isDemo = includeDemo ?? this.getDemoMode();
    const allAttendance = await this.getAttendanceRecords(isDemo);
    const allClasses = await this.getClassSessions(isDemo);

    const studentAttendance = allAttendance.filter((a) => a.student_id === studentId);

    // Conducted classes where attendance was completed
    const completedClassIds = new Set(
      allClasses.filter((c) => c.attendance_status === "completed").map((c) => c.id)
    );

    const relevantAttendance = studentAttendance.filter((a) =>
      completedClassIds.has(a.class_session_id)
    );

    const totalConducted = relevantAttendance.length;
    const presentCount = relevantAttendance.filter((a) => a.status === "present").length;
    const lateCount = relevantAttendance.filter((a) => a.status === "late").length;
    const absentCount = relevantAttendance.filter((a) => a.status === "absent").length;

    const attendedCount = presentCount + lateCount;
    const percentage = totalConducted > 0 ? Math.round((attendedCount / totalConducted) * 100) : 0;

    return {
      totalConducted,
      presentCount,
      lateCount,
      absentCount,
      attendedCount,
      percentage,
      records: relevantAttendance,
    };
  }

  static async getAdminDashboardStats(includeDemo?: boolean): Promise<DashboardStats> {
    const isDemo = includeDemo ?? this.getDemoMode();
    const students = await this.getStudents(isDemo);
    const teachers = await this.getTeachers(isDemo);
    const classes = await this.getClassSessions(isDemo);
    const attendance = await this.getAttendanceRecords(isDemo);
    const activities = await this.getActivityLogs(isDemo);

    const activeStudents = students.filter((s) => s.admission_status === "active").length;
    const completedClasses = classes.filter((c) => c.attendance_status === "completed");

    // Total attended vs total attendance marked
    const totalMarked = attendance.length;
    const totalAttended = attendance.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    const overallPercentage = totalMarked > 0 ? Math.round((totalAttended / totalMarked) * 100) : 0;

    return {
      totalStudents: students.length,
      activeStudents,
      totalTeachers: teachers.length,
      totalClasses: completedClasses.length,
      overallAttendancePercentage: overallPercentage,
      recentStudents: students.slice(0, 5),
      recentClasses: classes.slice(0, 5),
      recentActivities: activities.slice(0, 6),
    };
  }

  // --- ACTIVITY LOGS ---
  static async getActivityLogs(includeDemo?: boolean): Promise<SystemActivityLog[]> {
    const isDemo = includeDemo ?? this.getDemoMode();
    let customList: SystemActivityLog[] = [];
    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACTIVITIES);
      if (stored) {
        try {
          customList = JSON.parse(stored);
        } catch {}
      }
    }
    const demo = isDemo ? DEMO_ACTIVITY_LOGS : [];
    const filtered = customList.filter((a) => (isDemo ? true : !a.is_demo));
    return [...filtered, ...demo].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  private static logActivity(
    actorName: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
  ): void {
    if (!this.isBrowser()) return;
    const newLog: SystemActivityLog = {
      id: `act-${Date.now()}`,
      actor_name: actorName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      is_demo: this.getDemoMode(),
      created_at: new Date().toISOString(),
    };
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACTIVITIES);
    const list: SystemActivityLog[] = stored ? JSON.parse(stored) : [];
    list.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ACTIVITIES, JSON.stringify(list.slice(0, 50)));
  }
}
