"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, Profile, Student, Teacher } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { DataService } from "@/lib/data-service";
import { useRouter } from "next/navigation";

export interface DemoUserOption {
  email: string;
  role: UserRole;
  name: string;
  id: string;
  detail: string;
}

export const DEMO_USERS: DemoUserOption[] = [
  {
    email: "admin@literatrack.demo",
    role: "admin",
    name: "System Administrator",
    id: "demo-admin-1",
    detail: "Full institutional management, student/teacher admissions, demo mode toggle",
  },
  {
    email: "rajesh.sharma@literatrack.demo",
    role: "teacher",
    name: "Dr. Rajesh Sharma",
    id: "tch-1",
    detail: "Mathematics Teacher (Secondary & Sr. Secondary), Class Scheduler & Attendance",
  },
  {
    email: "sunita.verma@literatrack.demo",
    role: "teacher",
    name: "Mrs. Sunita Verma",
    id: "tch-2",
    detail: "Science & Physics Teacher, Class Sessions & Attendance Log",
  },
  {
    email: "aarav.patel@student.literatrack.demo",
    role: "student",
    name: "Aarav Patel",
    id: "stu-1",
    detail: "Class 10 NIOS Learner (STU-2026-0001), 4 Subjects, Attendance Tracking",
  },
  {
    email: "kavya.menon@student.literatrack.demo",
    role: "student",
    name: "Kavya Menon",
    id: "stu-6",
    detail: "Class 12 NIOS Learner (STU-2026-0006), Science Stream",
  },
];

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  currentRole: UserRole | null;
  studentData: Student | null;
  teacherData: Teacher | null;
  isLoading: boolean;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  switchDemoRole: (roleOption: DemoUserOption) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoMode, setDemoModeState] = useState<boolean>(true);

  const router = useRouter();
  const supabase = createClient();

  const handleDemoModeChange = (enabled: boolean) => {
    DataService.setDemoMode(enabled);
    setDemoModeState(enabled);
  };

  // Sync role and associated student/teacher entity
  const loadRoleEntities = async (role: UserRole, email: string, userId?: string) => {
    if (role === "student") {
      const students = await DataService.getStudents(true);
      const student =
        students.find((s) => s.email.toLowerCase() === email.toLowerCase() || s.id === userId) ||
        students[0];
      setStudentData(student || null);
      setTeacherData(null);
    } else if (role === "teacher") {
      const teachers = await DataService.getTeachers(true);
      const teacher =
        teachers.find((t) => t.email.toLowerCase() === email.toLowerCase() || t.id === userId) ||
        teachers[0];
      setTeacherData(teacher || null);
      setStudentData(null);
    } else {
      setStudentData(null);
      setTeacherData(null);
    }
  };

  useEffect(() => {
    const isDemo = DataService.getDemoMode();
    setDemoModeState(isDemo);

    const onDemoChange = () => {
      setDemoModeState(DataService.getDemoMode());
    };
    window.addEventListener("literatrack_demo_mode_changed", onDemoChange);

    // Check existing stored demo session or Supabase session
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const storedRole = localStorage.getItem("literatrack_active_user");
        if (storedRole) {
          const parsed = JSON.parse(storedRole);
          setCurrentRole(parsed.role);
          setProfile({
            id: parsed.id,
            email: parsed.email,
            role: parsed.role,
            full_name: parsed.name,
            status: "active",
            is_demo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setUser({ id: parsed.id, email: parsed.email });
          await loadRoleEntities(parsed.role, parsed.email, parsed.id);
          setIsLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          // Try to fetch profile from Supabase
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (prof) {
            setProfile(prof);
            setCurrentRole(prof.role);
            await loadRoleEntities(prof.role, session.user.email || "", prof.id);
          } else {
            // Default to admin or role in metadata
            const metaRole = (session.user.user_metadata?.role as UserRole) || "admin";
            setCurrentRole(metaRole);
            setProfile({
              id: session.user.id,
              email: session.user.email || "",
              role: metaRole,
              full_name: session.user.user_metadata?.full_name || session.user.email || "User",
              status: "active",
              is_demo: false,
              created_at: session.user.created_at,
              updated_at: session.user.created_at,
            });
            await loadRoleEntities(metaRole, session.user.email || "", session.user.id);
          }
        } else {
          // If no active session, start with default demo admin
          const defaultAdmin = DEMO_USERS[0];
          localStorage.setItem("literatrack_active_user", JSON.stringify(defaultAdmin));
          if (typeof document !== "undefined") {
            document.cookie = `literatrack_role=${defaultAdmin.role}; path=/; max-age=86400; SameSite=Lax`;
          }
          setCurrentRole(defaultAdmin.role);
          setProfile({
            id: defaultAdmin.id,
            email: defaultAdmin.email,
            role: defaultAdmin.role,
            full_name: defaultAdmin.name,
            status: "active",
            is_demo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setUser({ id: defaultAdmin.id, email: defaultAdmin.email });
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (prof) {
          setProfile(prof);
          setCurrentRole(prof.role);
          await loadRoleEntities(prof.role, session.user.email || "", prof.id);
        }
      } else if (event === "SIGNED_OUT") {
        const storedRole = localStorage.getItem("literatrack_active_user");
        if (!storedRole) {
          setUser(null);
          setProfile(null);
          setCurrentRole(null);
          setStudentData(null);
          setTeacherData(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("literatrack_demo_mode_changed", onDemoChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      localStorage.removeItem("literatrack_active_user");
      setUser(data.user);

      // fetch profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const userRole = prof?.role || (data.user.user_metadata?.role as UserRole) || "admin";
      if (typeof document !== "undefined") {
        document.cookie = `literatrack_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
      }

      if (prof) {
        setProfile(prof);
        setCurrentRole(prof.role);
        await loadRoleEntities(prof.role, email, prof.id);

        if (prof.role === "admin") router.push("/admin");
        else if (prof.role === "teacher") router.push("/teacher");
        else if (prof.role === "student") router.push("/student");
      } else {
        router.push("/admin");
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected login error occurred" };
    }
  };

  const switchDemoRole = async (roleOption: DemoUserOption) => {
    localStorage.setItem("literatrack_active_user", JSON.stringify(roleOption));
    if (typeof document !== "undefined") {
      document.cookie = `literatrack_role=${roleOption.role}; path=/; max-age=86400; SameSite=Lax`;
    }
    setCurrentRole(roleOption.role);
    setProfile({
      id: roleOption.id,
      email: roleOption.email,
      role: roleOption.role,
      full_name: roleOption.name,
      status: "active",
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setUser({ id: roleOption.id, email: roleOption.email });
    await loadRoleEntities(roleOption.role, roleOption.email, roleOption.id);

    if (roleOption.role === "admin") {
      router.push("/admin");
    } else if (roleOption.role === "teacher") {
      router.push("/teacher");
    } else if (roleOption.role === "student") {
      router.push("/student");
    }
  };

  const signOut = async () => {
    localStorage.removeItem("literatrack_active_user");
    if (typeof document !== "undefined") {
      document.cookie = "literatrack_role=; path=/; max-age=0; SameSite=Lax";
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentRole(null);
    setStudentData(null);
    setTeacherData(null);
    router.push("/login");
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error requesting activation email" };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update password" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentRole,
        studentData,
        teacherData,
        isLoading,
        demoMode,
        setDemoMode: handleDemoModeChange,
        signIn,
        switchDemoRole,
        signOut,
        requestPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
