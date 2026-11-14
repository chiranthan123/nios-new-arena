"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { ClassSession, Attendance, Subject } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  Clock,
  BookOpen,
  Percent,
  Sparkles,
  ArrowRight,
  ClipboardList,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { studentData, demoMode } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentClasses, setRecentClasses] = useState<ClassSession[]>([]);
  const [subjectStats, setSubjectStats] = useState<
    Array<{ subject: Subject; total: number; attended: number; percentage: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const stuId = studentData?.id || "stu-1";
      const [stuStats, allCls, allSubs] = await Promise.all([
        DataService.calculateStudentStats(stuId, demoMode),
        DataService.getClassSessions(demoMode),
        DataService.getSubjects(),
      ]);

      setStats(stuStats);

      // Student enrolled subjects
      const enrolledSubjectIds = new Set(
        studentData?.subjects?.map((s) => s.id) || [
          "sub-101",
          "sub-102",
          "sub-103",
          "sub-104",
        ]
      );

      // Classes relevant to student
      const relevantClasses = allCls.filter((c) => enrolledSubjectIds.has(c.subject_id));
      setRecentClasses(relevantClasses.slice(0, 5));

      // Calculate subject-wise attendance percentages: (Present + Late) / Total × 100
      const activeSubs = studentData?.subjects || allSubs.slice(0, 4);
      const computedSubjectStats = activeSubs.map((sub) => {
        const subRecords = stuStats.records.filter(
          (r: Attendance) => r.subject_id === sub.id
        );
        const total = subRecords.length;
        const attended = subRecords.filter(
          (r: Attendance) => r.status === "present" || r.status === "late"
        ).length;
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
        return {
          subject: sub,
          total,
          attended,
          percentage,
        };
      });

      setSubjectStats(computedSubjectStats);
      setLoading(false);
    }
    load();
  }, [studentData, demoMode]);

  const percentage = stats?.percentage ?? 0;
  let statusBadge = "Good Standing";
  let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (percentage < 75) {
    statusBadge = "Attendance Below 75% Requirement";
    statusColor = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-900/20">
              {studentData?.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  NIOS Learner
                </span>
                <span className="font-mono text-xs font-bold text-purple-700">
                  {studentData?.student_id || "STU-2026-0001"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {studentData?.full_name || "Aarav Patel"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {studentData?.education_level || "Secondary (Class 10)"} Stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${statusColor}`}>
              {statusBadge}
            </div>
          </div>
        </div>

        {/* 4 Core Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Enrolled Subjects */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Enrolled Subjects
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {studentData?.subjects?.length || 4}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Active curriculum courses</p>
          </div>

          {/* Conducted Classes */}
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
              {loading ? "..." : stats?.totalConducted ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Conducted sessions</p>
          </div>

          {/* Classes Attended */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Classes Attended
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {loading ? "..." : stats?.attendedCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats?.presentCount ?? 0} Present + {stats?.lateCount ?? 0} Late
            </p>
          </div>

          {/* Overall Attendance Percentage */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Attendance
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`text-2xl font-black ${
                percentage >= 75 ? "text-purple-700" : "text-rose-600"
              }`}
            >
              {loading ? "..." : `${percentage}%`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">(Attended / Total) × 100</p>
          </div>
        </div>

        {/* 2-Column: Subject-wise Attendance & Recent Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject-Wise Attendance Progress */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Subject-Wise Attendance</h3>
                <p className="text-xs text-slate-500">Track eligibility per subject</p>
              </div>
              <Link
                href="/student/attendance"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Full Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {subjectStats.map((item) => (
                <div key={item.subject.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {item.subject.name}
                      <span className="text-slate-400 font-mono font-normal ml-1">
                        ({item.subject.code})
                      </span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.percentage}%{" "}
                      <span className="text-slate-400 font-normal">
                        ({item.attended}/{item.total})
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, item.percentage || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Classes Attended / Scheduled */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Learning Sessions</h3>
                <p className="text-xs text-slate-500">Classes for your enrolled subjects</p>
              </div>
              <Link
                href="/student/classes"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentClasses.map((cls) => {
                const rec = stats?.records?.find(
                  (r: Attendance) => r.class_session_id === cls.id
                );
                return (
                  <div key={cls.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span>{cls.subject?.name || "Course Session"}</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1 rounded">
                          {cls.session_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{cls.topics_covered}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDate(cls.class_date)} • {formatTime(cls.start_time)}
                      </p>
                    </div>

                    <div className="shrink-0 ml-3 text-right">
                      {rec ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.status === "present"
                              ? "bg-emerald-100 text-emerald-800"
                              : rec.status === "late"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {rec.status}
                          {rec.status === "late" && ` (${rec.late_duration_minutes}m)`}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          Upcoming / Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Academic Progress & Assignments Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Tutor Marked Assignments (TMA) & Study Plan
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Upcoming NIOS self-study milestones and examination preparations.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Mathematics TMA Submission</span>
                  <span className="text-[11px] text-slate-500">Chapters 1 to 5 Exercises</span>
                </div>
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Due 30 Nov
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Science Lab Record File</span>
                  <span className="text-[11px] text-slate-500">Acid-Base Titration Experiments</span>
                </div>
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Due 05 Dec
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Attendance Policy Guidelines</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              According to NIOS learning centre standards, candidates must maintain a minimum of 75% attendance across contact sessions to ensure examination clearance.
            </p>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 font-mono text-[11px]">
              Formula: (Present + Late) ÷ Total Conducted Classes × 100
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
