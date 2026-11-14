"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Users,
  CalendarDays,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function Home() {
  const { currentRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentRole) {
      if (currentRole === "admin") router.push("/admin");
      else if (currentRole === "teacher") router.push("/teacher");
      else if (currentRole === "student") router.push("/student");
    }
  }, [currentRole, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-900/30">
            LT
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              LiteraTrack
              <span className="text-[11px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-400/30">
                NIOS Centre Suite
              </span>
            </h1>
            <p className="text-xs text-slate-400">Educational Progress & Attendance Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-1.5"
          >
            <span>Access Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Designed specifically for NIOS Secondary & Senior Secondary Learning Centres
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Comprehensive Management & Real-time Academic Tracking
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            LiteraTrack unites Administrators, Teachers, and Students into a cohesive platform featuring automated eligible-student attendance selection, role-based security with Supabase PostgreSQL, and isolated demonstration mode.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/40 transition flex items-center gap-2"
            >
              <span>Administrator Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/teacher"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-950/40 transition flex items-center gap-2"
            >
              <span>Teacher Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/student"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
            >
              <span>Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Administrator Control</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Register students with automated ID generation, manage teaching staff, assign NIOS subjects, audit attendance corrections, and toggle demo mode.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/40 transition">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Teacher Workflows</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Schedule classes with duration calculation, auto-populate enrolled students by grade & subject, record Present/Absent/Late with custom delays, and view audit history.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Student Transparency</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students track overall attendance percentages with mathematical precision: (Present + Late) / Total Conducted × 100, broken down by subject.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        LiteraTrack Educational Management System • Integrated with Supabase PostgreSQL & Next.js
      </footer>
    </div>
  );
}
