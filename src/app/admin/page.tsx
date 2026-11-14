"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { DashboardStats } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  CalendarDays,
  Percent,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { demoMode } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await DataService.getAdminDashboardStats(demoMode);
      setStats(data);
      setLoading(false);
    }
    load();
  }, [demoMode]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top welcome banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Administration Central
              </span>
              {demoMode && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Sample Records Active
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Institutional Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitoring NIOS Secondary (Class 10) & Senior Secondary (Class 12) academic delivery and attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/students/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll Student</span>
            </Link>
            <Link
              href="/admin/teachers/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Teacher</span>
            </Link>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Students */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Students
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : stats?.totalStudents ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Enrolled NIOS candidates</p>
          </div>

          {/* Active Students */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Learners
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {loading ? "..." : stats?.activeStudents ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Regularly attending</p>
          </div>

          {/* Total Teachers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Teaching Faculty
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : stats?.totalTeachers ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Active subject educators</p>
          </div>

          {/* Total Classes Conducted */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Classes Held
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : stats?.totalClasses ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Conducted sessions</p>
          </div>

          {/* Overall Attendance Percentage */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Attendance
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700">
              {loading ? "..." : `${stats?.overallAttendancePercentage ?? 0}%`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">(Present + Late) / Total</p>
          </div>
        </div>

        {/* 2-Column Section: Recent Students & Recent Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Registered Students */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recently Registered Students</h3>
                <p className="text-xs text-slate-500">Newly admitted NIOS learners</p>
              </div>
              <Link
                href="/admin/students"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.recentStudents && stats.recentStudents.length > 0 ? (
                stats.recentStudents.map((student) => (
                  <div key={student.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{student.full_name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {student.student_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{student.education_level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        {student.admission_status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDate(student.admission_date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No student records available.
                </div>
              )}
            </div>
          </div>

          {/* Recently Created Classes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recently Created Classes</h3>
                <p className="text-xs text-slate-500">Live & completed learning sessions</p>
              </div>
              <Link
                href="/admin/classes"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.recentClasses && stats.recentClasses.length > 0 ? (
                stats.recentClasses.map((cls) => (
                  <div key={cls.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{cls.subject?.name || "Subject Session"}</span>
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-mono border border-purple-200">
                          {cls.session_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {cls.title || cls.topics_covered}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Date: {formatDate(cls.class_date)}</span>
                        <span>•</span>
                        <span>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          cls.attendance_status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {cls.attendance_status === "completed" ? "Attendance Logged" : "Pending Log"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cls.duration_minutes} mins</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No classes recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Application Activity Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Recent Application Activity & Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Live operational events across LiteraTrack</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      {act.actor_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{act.actor_name}</span>{" "}
                      <span className="text-slate-600">performed</span>{" "}
                      <span className="font-mono font-bold text-purple-700">{act.action}</span>{" "}
                      <span className="text-slate-600">on {act.entity_type}</span>{" "}
                      {act.entity_id && (
                        <span className="font-mono text-slate-500">({act.entity_id})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                    {formatDate(act.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">No activity logged.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
