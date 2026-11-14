"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Attendance, Subject, ClassSession } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Percent,
  CalendarDays,
  BookOpen,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function StudentMyAttendancePage() {
  const { studentData, demoMode } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
      setClasses(allCls);
      setSubjects(studentData?.subjects || allSubs.slice(0, 4));
      setLoading(false);
    }
    load();
  }, [studentData, demoMode]);

  // Compute breakdown per subject
  const subjectBreakdown = subjects.map((sub) => {
    const records: Attendance[] = stats?.records?.filter(
      (r: Attendance) => r.subject_id === sub.id
    ) || [];

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const late = records.filter((r) => r.status === "late").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const attended = present + late;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      subject: sub,
      total,
      present,
      late,
      absent,
      attended,
      percentage,
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Personal Attendance Report
            </span>
            <span className="text-xs font-mono text-purple-700">
              {studentData?.student_id || "STU-2026-0001"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Attendance</h1>
          <p className="text-xs text-slate-500">
            Attendance percentage calculation adheres to NIOS institutional criteria.
          </p>
        </div>

        {/* Official Formula Explanatory Card */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-purple-200 font-semibold mb-1">
                Official NIOS Percentage Calculation
              </div>
              <div className="text-xl md:text-2xl font-mono font-bold tracking-tight">
                Attendance % = (Present + Late) ÷ Conducted Classes × 100
              </div>
              <p className="text-xs text-purple-200 mt-2">
                * Note: Cancelled sessions and classes with pending attendance are automatically excluded from the denominator.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center border border-white/20 shrink-0">
              <span className="text-[11px] text-purple-200 uppercase font-bold block">
                Your Overall Rate
              </span>
              <span className="text-3xl font-black text-white">{stats?.percentage ?? 0}%</span>
              <span className="text-[10px] text-purple-300 block mt-0.5">
                {stats?.percentage >= 75 ? "Eligible for Exam" : "Attention Needed (<75%)"}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Attendance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Conducted Classes
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {loading ? "..." : stats?.totalConducted ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">Total verified sessions</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">
              Present Classes
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {loading ? "..." : stats?.presentCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">On-time attendance</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">
              Late Classes
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {loading ? "..." : stats?.lateCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">Recorded with delay</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">
              Absent Classes
            </span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">
              {loading ? "..." : stats?.absentCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">Not attended</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">
              Total Attended
            </span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              {loading ? "..." : stats?.attendedCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">Present + Late count</span>
          </div>
        </div>

        {/* Subject-Wise Attendance Breakdown Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Subject-Wise Attendance Breakdown</h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of attendance metrics per enrolled curriculum subject
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Subject Code & Name</th>
                  <th className="py-3 px-4">Classes Held</th>
                  <th className="py-3 px-4">Present</th>
                  <th className="py-3 px-4">Late</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">Attended (P+L)</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {subjectBreakdown.map((row) => (
                  <tr key={row.subject.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.subject.name}</div>
                      <div className="font-mono text-purple-700 text-[10px]">
                        {row.subject.code}
                      </div>
                    </td>
                    <td className="py-3 px-4">{row.total}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{row.present}</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">{row.late}</td>
                    <td className="py-3 px-4 text-rose-700 font-semibold">{row.absent}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.attended}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          row.percentage >= 75
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Attendance Session Log */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Individual Session Log</h3>
            <p className="text-xs text-slate-500">Every recorded session marked for your account</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Session Code</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Late Delay</th>
                  <th className="py-3 px-4">Submission Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats?.records && stats.records.length > 0 ? (
                  stats.records.map((r: Attendance) => {
                    const cls = classes.find((c) => c.id === r.class_session_id);
                    const sub = subjects.find((s) => s.id === r.subject_id);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {formatDate(cls?.class_date || r.submitted_at)}
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-700 text-[11px]">
                          {cls?.session_code || r.class_session_id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {sub?.name || cls?.subject?.name || "Subject"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === "present"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "late"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {r.status === "late" ? `${r.late_duration_minutes} mins` : "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {formatDate(r.submitted_at)} {new Date(r.submitted_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
