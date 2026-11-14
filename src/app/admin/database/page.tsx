"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import {
  Database,
  CheckCircle,
  XCircle,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Server,
  RefreshCw,
} from "lucide-react";

export default function AdminDatabasePage() {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const testSupabaseConnection = async () => {
    setTesting(true);
    const supabase = createClient();
    const result: Record<string, boolean | string> = {};

    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1);
      result.profiles = !error;
      result.profilesError = error ? error.message : "Active";
    } catch (err: any) {
      result.profiles = false;
      result.profilesError = err.message;
    }

    try {
      const { data, error } = await supabase.from("subjects").select("count").limit(1);
      result.subjects = !error;
      result.subjectsError = error ? error.message : "Active";
    } catch (err: any) {
      result.subjects = false;
      result.subjectsError = err.message;
    }

    try {
      const { data, error } = await supabase.from("students").select("count").limit(1);
      result.students = !error;
      result.studentsError = error ? error.message : "Active";
    } catch (err: any) {
      result.students = false;
      result.studentsError = err.message;
    }

    try {
      const { data, error } = await supabase.from("teachers").select("count").limit(1);
      result.teachers = !error;
      result.teachersError = error ? error.message : "Active";
    } catch (err: any) {
      result.teachers = false;
      result.teachersError = err.message;
    }

    try {
      const { data, error } = await supabase.from("class_sessions").select("count").limit(1);
      result.class_sessions = !error;
      result.class_sessionsError = error ? error.message : "Active";
    } catch (err: any) {
      result.class_sessions = false;
      result.class_sessionsError = err.message;
    }

    try {
      const { data, error } = await supabase.from("attendance").select("count").limit(1);
      result.attendance = !error;
      result.attendanceError = error ? error.message : "Active";
    } catch (err: any) {
      result.attendance = false;
      result.attendanceError = err.message;
    }

    setConnectionStatus(result);
    setTesting(false);
  };

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const migrationScript = `-- LITERATRACK SUPABASE POSTGRESQL INITIALIZATION
-- Run this in Supabase Dashboard -> SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    education_level TEXT NOT NULL,
    description TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_id TEXT UNIQUE NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id TEXT UNIQUE NOT NULL,
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
    education_level TEXT NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    admission_status TEXT NOT NULL DEFAULT 'active' CHECK (admission_status IN ('active', 'inactive', 'graduated', 'withdrawn', 'suspended')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(teacher_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.student_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_code TEXT UNIQUE NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.demo_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    is_demo_mode BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.demo_settings (id, is_demo_mode)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read class_sessions" ON public.class_sessions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read demo_settings" ON public.demo_settings FOR SELECT USING (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              PostgreSQL Architecture
            </span>
            <span className="text-xs text-slate-500 font-medium">Supabase Cloud</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Database & Schema</h1>
          <p className="text-xs text-slate-500">
            Verify Supabase PostgreSQL tables, inspect schema definitions, and run migration scripts.
          </p>
        </div>

        {/* Backend Info Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Connected Supabase Project
            </div>
            <div className="font-mono text-sm font-bold text-purple-700">
              https://rlotxrtdbqtnbglbmyea.supabase.co
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Row Level Security enabled • Normalized tables with relational constraints
            </p>
          </div>

          <button
            onClick={testSupabaseConnection}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            <span>{testing ? "Testing Tables..." : "Re-test PostgreSQL Tables"}</span>
          </button>
        </div>

        {/* Table Diagnostic Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Live PostgreSQL Tables Check
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "profiles", key: "profiles" },
              { name: "subjects", key: "subjects" },
              { name: "students", key: "students" },
              { name: "teachers", key: "teachers" },
              { name: "class_sessions", key: "class_sessions" },
              { name: "attendance", key: "attendance" },
            ].map((tbl) => {
              const isReady = connectionStatus ? connectionStatus[tbl.key] : false;
              return (
                <div
                  key={tbl.name}
                  className={`p-3 rounded-xl border text-xs ${
                    isReady
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[11px]">{tbl.name}</span>
                    {isReady ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {isReady ? "Table Live in Supabase" : "Awaiting Migration"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            * Note: LiteraTrack includes an intelligent resilient data layer. When PostgreSQL tables are awaiting migration, the application operates seamlessly using isolated local demonstration data.
          </p>
        </div>

        {/* SQL Migration Script Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-600" />
                Supabase SQL Migration Script
              </h2>
              <p className="text-xs text-slate-500">
                Execute this in Supabase Dashboard &rarr; SQL Editor to initialize your production database.
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy SQL Script"}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800">
              {migrationScript}
            </pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
