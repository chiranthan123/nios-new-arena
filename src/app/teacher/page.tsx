"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { ClassSession, Student } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const { teacherData, demoMode } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
    async function load() {
      setLoading(true);
      const [allCls, allStu] = await Promise.all([
        DataService.getClassSessions(demoMode),
        DataService.getStudents(demoMode),
      ]);

      // Filter classes for current teacher
      const currentTeacherId = teacherData?.id || "tch-1";
      const teacherClasses = allCls.filter(
        (c) => c.teacher_id === currentTeacherId || (demoMode && !c.teacher_id)
      );

      // Filter assigned students: students who share at least one subject with this teacher
      const teacherSubjectIds = new Set(teacherData?.subjects?.map((s) => s.id) || []);
      const studentsInSubjects = allStu.filter((stu) =>
        stu.subjects?.some((sub) => teacherSubjectIds.has(sub.id))
      );

      setClasses(teacherClasses);
      setAssignedStudents(studentsInSubjects.length > 0 ? studentsInSubjects : allStu.slice(0, 6));
      setLoading(false);
    }
    load();
  }, [teacherData, demoMode]);

  const classesToday = todayStr ? classes.filter((c) => c.class_date === todayStr) : [];
  const pendingAttendance = classes.filter((c) => c.attendance_status === "pending");
  const conductedClasses = classes.filter((c) => c.attendance_status === "completed");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Educator Portal
              </span>
              <span className="text-xs font-mono text-slate-500">
                {teacherData?.teacher_id || "TCH-2026-0001"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back, {teacherData?.full_name || "Educator"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              NIOS Curriculum Faculty • {teacherData?.subjects?.map((s) => s.name).join(", ") || "Mathematics"}
            </p>
          </div>

          <Link
            href="/teacher/classes/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Class</span>
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Students
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : assignedStudents.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">In your subject streams</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Classes Conducted
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {loading ? "..." : conductedClasses.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Attendance finalized</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Classes Today
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : classesToday.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Scheduled for today</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Attendance Pending
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700">
              {loading ? "..." : pendingAttendance.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting educator logging</p>
          </div>
        </div>

        {/* Classes Requiring Attendance (Urgent Callout) */}
        {pendingAttendance.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-amber-900">
                Action Required: {pendingAttendance.length} Session(s) Awaiting Attendance Submission
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingAttendance.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                      {cls.session_code}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 mt-1">{cls.title || cls.topics_covered}</h3>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(cls.class_date)} • {formatTime(cls.start_time)} ({cls.duration_minutes}m)
                    </p>
                  </div>
                  <Link
                    href={`/teacher/attendance/log?session=${cls.id}`}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition shrink-0 ml-3"
                  >
                    Log Attendance
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Class Sessions Cards */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Learning Sessions</h3>
              <p className="text-xs text-slate-500">Your conducted and scheduled classes</p>
            </div>
            <Link
              href="/teacher/classes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Classes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                      {c.session_code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        c.attendance_status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {c.attendance_status === "completed" ? "Completed" : "Pending Log"}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {c.title || c.topics_covered}
                  </h4>
                  <div className="text-xs font-semibold text-blue-700 mt-1">
                    {c.subject?.name || "Subject Competency"}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Topics: {c.topics_covered}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <div className="text-slate-500">
                    <div>{formatDate(c.class_date)}</div>
                    <div className="font-mono">
                      {formatTime(c.start_time)} ({c.duration_minutes}m)
                    </div>
                  </div>

                  {c.attendance_status === "pending" ? (
                    <Link
                      href={`/teacher/attendance/log?session=${c.id}`}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition text-[11px]"
                    >
                      Log Attendance
                    </Link>
                  ) : (
                    <Link
                      href={`/teacher/attendance?session=${c.id}&view=class`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition text-[11px]"
                    >
                      View Log
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
