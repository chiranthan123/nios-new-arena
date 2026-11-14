"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import {
  Student,
  Subject,
  ClassSession,
  Attendance,
  AttendanceAuditLog,
  AttendanceStatus,
} from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  FileText,
  User,
  BookOpen,
  CalendarDays,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  AlertCircle,
  History,
  Sparkles,
} from "lucide-react";

function TeacherAttendanceContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") || "individual";
  const initialSession = searchParams.get("session") || "";

  const { teacherData, demoMode } = useAuth();

  const [activeTab, setActiveTab] = useState<"individual" | "subject" | "class" | "edit">(
    initialView === "class" ? "class" : "individual"
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // View A: Individual Student State
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // View B: Subject-wise Individual State
  const [subjectViewStudentId, setSubjectViewStudentId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // View C: Class-wise State
  const [selectedClassId, setSelectedClassId] = useState(initialSession);

  // View D: Edit State
  const [editRecordId, setEditRecordId] = useState("");
  const [newStatus, setNewStatus] = useState<AttendanceStatus>("present");
  const [newLateMinutes, setNewLateMinutes] = useState(10);
  const [editReason, setEditReason] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [allStu, allSubs, allCls, allAtt, audits] = await Promise.all([
      DataService.getStudents(demoMode),
      DataService.getSubjects(),
      DataService.getClassSessions(demoMode),
      DataService.getAttendanceRecords(demoMode),
      DataService.getAuditLogs(demoMode),
    ]);

    setStudents(allStu);
    setSubjects(allSubs);
    setClasses(allCls);
    setAttendanceRecords(allAtt);
    setAuditLogs(audits);

    if (allStu.length > 0 && !selectedStudentId) {
      setSelectedStudentId(allStu[0].id);
      setSubjectViewStudentId(allStu[0].id);
    }
    if (allSubs.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(allSubs[0].id);
    }
    if (allCls.length > 0 && !selectedClassId) {
      setSelectedClassId(allCls[0].id);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [demoMode]);

  // Handle Edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecordId) return;

    setSavingEdit(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      await DataService.updateAttendanceRecord(
        editRecordId,
        newStatus,
        newStatus === "late" ? newLateMinutes : 0,
        teacherData?.full_name || "Faculty Member",
        editReason || "Educator revised status"
      );

      setEditSuccess("Attendance record corrected and audit log created.");
      await loadAll();
    } catch (err: any) {
      setEditError(err.message || "Failed to update record.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Attendance Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Educator Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Attendance Management
          </h1>
          <p className="text-xs text-slate-500">
            Multi-view tracking: Individual student history, subject attendance, class rosters, and audit-logged corrections.
          </p>
        </div>

        {/* 4 View Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("individual")}
            className={`p-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 border ${
              activeTab === "individual"
                ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="leading-tight">A. Individual Student</div>
              <div className="text-[10px] text-slate-400 font-normal">Across all subjects</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("subject")}
            className={`p-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 border ${
              activeTab === "subject"
                ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="leading-tight">B. Subject-Wise</div>
              <div className="text-[10px] text-slate-400 font-normal">Student & subject focus</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("class")}
            className={`p-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 border ${
              activeTab === "class"
                ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="leading-tight">C. Class-Wise Roster</div>
              <div className="text-[10px] text-slate-400 font-normal">All students in session</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`p-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 border ${
              activeTab === "edit"
                ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="leading-tight">D. Edit & Audit History</div>
              <div className="text-[10px] text-slate-400 font-normal">Correct with audit trail</div>
            </div>
          </button>
        </div>

        {/* VIEW A: INDIVIDUAL STUDENT ATTENDANCE ACROSS ALL SUBJECTS */}
        {activeTab === "individual" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Select Learner:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_id}) - {s.education_level}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentId && (
                <div className="text-xs text-slate-500 font-medium">
                  Showing comprehensive attendance across all enrolled subjects
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Class Session</th>
                      <th className="py-3 px-4">Teacher</th>
                      <th className="py-3 px-4">Attendance Status</th>
                      <th className="py-3 px-4">Late Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceRecords.filter((a) => a.student_id === selectedStudentId).length ===
                    0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No attendance records found for this student.
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords
                        .filter((a) => a.student_id === selectedStudentId)
                        .map((rec) => {
                          const cls = classes.find((c) => c.id === rec.class_session_id);
                          const sub = subjects.find((s) => s.id === rec.subject_id);
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-4 whitespace-nowrap">
                                {formatDate(cls?.class_date || rec.submitted_at)}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-800">
                                {sub?.name || cls?.subject?.name || "Subject"}
                              </td>
                              <td className="py-3 px-4 font-mono text-purple-700 text-[11px]">
                                {cls?.session_code || rec.class_session_id}
                              </td>
                              <td className="py-3 px-4 text-slate-700">
                                {cls?.teacher?.full_name || "Faculty"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    rec.status === "present"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : rec.status === "late"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {rec.status === "late" ? `${rec.late_duration_minutes} mins` : "-"}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: SUBJECT-WISE INDIVIDUAL ATTENDANCE */}
        {activeTab === "subject" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Student:</span>
                <select
                  value={subjectViewStudentId}
                  onChange={(e) => setSubjectViewStudentId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Class Date</th>
                      <th className="py-3 px-4">Class Session & Topics</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Student Status</th>
                      <th className="py-3 px-4">Late Minutes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {classes
                      .filter((c) => c.subject_id === selectedSubjectId)
                      .map((cls) => {
                        const rec = attendanceRecords.find(
                          (a) =>
                            a.class_session_id === cls.id && a.student_id === subjectViewStudentId
                        );
                        return (
                          <tr key={cls.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 whitespace-nowrap">
                              {formatDate(cls.class_date)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">
                                {cls.title || cls.topics_covered}
                              </div>
                              <div className="text-[11px] font-mono text-purple-700">
                                {cls.session_code}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {cls.duration_minutes} mins
                            </td>
                            <td className="py-3 px-4">
                              {rec ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    rec.status === "present"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : rec.status === "late"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  Pending Attendance
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {rec && rec.status === "late"
                                ? `${rec.late_duration_minutes} mins`
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: CLASS-WISE ATTENDANCE */}
        {activeTab === "class" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Select Class Session:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.session_code} - {c.subject?.name} ({formatDate(c.class_date)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedClassId && (
                <div className="text-xs text-slate-500">
                  {classes.find((c) => c.id === selectedClassId)?.topics_covered}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Learner Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Late Duration</th>
                      <th className="py-3 px-4">Marked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceRecords.filter((a) => a.class_session_id === selectedClassId)
                      .length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Attendance for this class has not been logged yet.
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords
                        .filter((a) => a.class_session_id === selectedClassId)
                        .map((rec) => {
                          const stu = students.find((s) => s.id === rec.student_id);
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-4 font-bold text-slate-900">
                                {stu?.full_name || rec.student_id}
                              </td>
                              <td className="py-3 px-4 font-mono text-purple-700 text-[11px]">
                                {stu?.student_id || rec.student_id}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    rec.status === "present"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : rec.status === "late"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {rec.status === "late" ? `${rec.late_duration_minutes} mins` : "-"}
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {formatDate(rec.submitted_at)}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW D: EDIT ATTENDANCE WITH AUDIT HISTORY */}
        {activeTab === "edit" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Correct Student Attendance Record
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Authorized educators can correct attendance mistakes. All updates generate an immutable audit log.
              </p>

              {editSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Attendance Record to Modify:
                    </label>
                    <select
                      required
                      value={editRecordId}
                      onChange={(e) => {
                        setEditRecordId(e.target.value);
                        const rec = attendanceRecords.find((a) => a.id === e.target.value);
                        if (rec) {
                          setNewStatus(rec.status);
                          setNewLateMinutes(rec.late_duration_minutes || 10);
                        }
                      }}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Choose record --</option>
                      {attendanceRecords.map((a) => {
                        const stu = students.find((s) => s.id === a.student_id);
                        const cls = classes.find((c) => c.id === a.class_session_id);
                        return (
                          <option key={a.id} value={a.id}>
                            {stu?.full_name} | {cls?.session_code} | Current: {a.status.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Updated Status:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                    >
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>

                  {newStatus === "late" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Late Minutes:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={newLateMinutes}
                        onChange={(e) => setNewLateMinutes(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Correction (Optional):
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g. Student transit delay confirmed via guardian notice"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingEdit || !editRecordId}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingEdit ? "Saving..." : "Save Correction & Log Audit"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Audit History Log */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                Attendance Correction Audit History
              </h3>
              <p className="text-xs text-slate-500 mb-4">Historical record of revisions made</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Educator</th>
                      <th className="py-2.5 px-3">Session</th>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3">To</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No audit entries.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {log.changed_by_name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-purple-700">
                            {log.class_session_id}
                          </td>
                          <td className="py-2.5 px-3 line-through text-slate-400 uppercase">
                            {log.previous_status}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-purple-700 uppercase">
                            {log.updated_status}
                            {log.updated_status === "late" && ` (${log.updated_late_duration}m)`}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{log.reason || "-"}</td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {formatDate(log.changed_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default function TeacherAttendanceManagementPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading attendance...</div>}>
        <TeacherAttendanceContent />
      </Suspense>
    </AppShell>
  );
}
