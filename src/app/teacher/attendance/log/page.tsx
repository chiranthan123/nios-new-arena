"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { ClassSession, Student, AttendanceStatus } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  AlertCircle,
  UserCheck,
  Sparkles,
  Check,
} from "lucide-react";

interface StudentAttendanceRow {
  student: Student;
  status: AttendanceStatus;
  lateDuration: number;
  customLate: boolean;
}

function LogAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");
  const { teacherData, demoMode } = useAuth();

  const [session, setSession] = useState<ClassSession | null>(null);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const cls = await DataService.getClassSessionById(sessionId);
      if (cls) {
        setSession(cls);
        // Automatic Student Selection:
        // Automatically fetch students who:
        // - Are enrolled in the selected subject
        // - Match the class's education level
        // - Were eligible to attend on the class date
        const eligibleStudents = await DataService.getEligibleStudentsForClass(cls.id);

        // Check if attendance already recorded
        const existingAttendance = await DataService.getAttendanceForSession(cls.id);

        const initialRows: StudentAttendanceRow[] = eligibleStudents.map((stu) => {
          const recorded = existingAttendance.find((a) => a.student_id === stu.id);
          return {
            student: stu,
            status: (recorded?.status as AttendanceStatus) || "present", // default to present for quick marking
            lateDuration: recorded?.late_duration_minutes || 10,
            customLate:
              recorded?.late_duration_minutes
                ? ![5, 10, 15, 20, 30].includes(recorded.late_duration_minutes)
                : false,
          };
        });

        setRows(initialRows);
      }
      setLoading(false);
    }
    init();
  }, [sessionId]);

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, status } : r))
    );
  };

  const updateLateDuration = (studentId: string, duration: number, isCustom = false) => {
    setRows((prev) =>
      prev.map((r) =>
        r.student.id === studentId ? { ...r, lateDuration: duration, customLate: isCustom } : r
      )
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setError(null);
    setSubmitting(true);

    try {
      const payload = rows.map((r) => ({
        studentId: r.student.id,
        status: r.status,
        lateDurationMinutes: r.status === "late" ? r.lateDuration : 0,
      }));

      await DataService.submitAttendance(
        session.id,
        payload,
        teacherData?.id || "tch-1",
        teacherData?.full_name || "Educator"
      );

      setSuccess(true);
      setTimeout(() => {
        router.push("/teacher/classes");
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Failed to submit attendance records.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Loading class and auto-selecting eligible students...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">No session selected.</p>
        <Link
          href="/teacher/classes"
          className="text-xs text-blue-600 font-semibold mt-2 inline-block"
        >
          Choose a class from My Classes
        </Link>
      </div>
    );
  }

  const presentCount = rows.filter((r) => r.status === "present").length;
  const lateCount = rows.filter((r) => r.status === "late").length;
  const absentCount = rows.filter((r) => r.status === "absent").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Classes</span>
          </Link>
          <span className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold">
            {session.session_code}
          </span>
        </div>

        {/* Class Overview Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Attendance Logging Mode
              </span>
              <span className="text-xs text-slate-500">{session.education_level}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">
              {session.title || session.topics_covered}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">{session.subject?.name}</span>
              <span>•</span>
              <span>Date: {formatDate(session.class_date)}</span>
              <span>•</span>
              <span>
                {formatTime(session.start_time)} - {formatTime(session.end_time)} (
                {session.duration_minutes}m)
              </span>
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              Present: {presentCount}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
              Late: {lateCount}
            </span>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              Absent: {absentCount}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Attendance submitted successfully! Redirecting to classes...</span>
          </div>
        )}

        {/* Automatic Roster Notification */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Automatic Student Selection:</strong> Displaying {rows.length} learners
              enrolled in {session.subject?.name} ({session.education_level}) admitted on or before{" "}
              {formatDate(session.class_date)}.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-indigo-700">Quick Mark:</span>
            <button
              type="button"
              onClick={() => markAll("present")}
              className="px-2 py-0.5 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300 rounded font-bold text-[11px]"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll("absent")}
              className="px-2 py-0.5 bg-white text-rose-700 hover:bg-rose-50 border border-rose-300 rounded font-bold text-[11px]"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Attendance Form Roster */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Learner Info</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Arrival Delay (When Late)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">
                        No eligible students enrolled for this subject and level.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.student.id} className="hover:bg-slate-50/80 transition">
                        {/* Student Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {row.student.full_name}
                          </div>
                          <div className="text-[11px] font-mono text-purple-700">
                            {row.student.student_id}
                          </div>
                          <div className="text-[11px] text-slate-400">{row.student.email}</div>
                        </td>

                        {/* Status Radio Buttons */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => updateStudentStatus(row.student.id, "present")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                                row.status === "present"
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Late */}
                            <button
                              type="button"
                              onClick={() => updateStudentStatus(row.student.id, "late")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                                row.status === "late"
                                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => updateStudentStatus(row.student.id, "absent")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                                row.status === "absent"
                                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>

                        {/* Delay Field for Late Status */}
                        <td className="py-3.5 px-4">
                          {row.status === "late" ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={row.customLate ? "custom" : row.lateDuration}
                                onChange={(e) => {
                                  if (e.target.value === "custom") {
                                    updateLateDuration(row.student.id, 25, true);
                                  } else {
                                    updateLateDuration(
                                      row.student.id,
                                      parseInt(e.target.value, 10),
                                      false
                                    );
                                  }
                                }}
                                className="text-xs px-2.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg font-bold"
                              >
                                <option value="5">5 minutes</option>
                                <option value="10">10 minutes</option>
                                <option value="15">15 minutes</option>
                                <option value="20">20 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="custom">Custom delay...</option>
                              </select>

                              {row.customLate && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={row.lateDuration}
                                    onChange={(e) =>
                                      updateLateDuration(
                                        row.student.id,
                                        parseInt(e.target.value, 10) || 0,
                                        true
                                      )
                                    }
                                    className="w-16 text-xs px-2 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-bold"
                                  />
                                  <span className="text-[11px] text-slate-500">mins</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              {row.status === "present" ? "Attended On Time" : "Not Attended"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-slate-500">
              * Present and Late count towards student attendance percentages.
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/teacher/classes"
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || rows.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? "Submitting..." : "Submit Official Attendance"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
  );
}

export default function LogAttendancePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading attendance...</div>}>
        <LogAttendanceContent />
      </Suspense>
    </AppShell>
  );
}
