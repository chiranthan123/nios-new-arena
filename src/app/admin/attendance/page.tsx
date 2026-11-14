"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Attendance, AttendanceAuditLog } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Search,
  Filter,
  History,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function AdminAttendancePage() {
  const { demoMode } = useAuth();
  const [tab, setTab] = useState<"records" | "audit">("records");
  const [records, setRecords] = useState<Attendance[]>([]);
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [att, audits] = await Promise.all([
        DataService.getAttendanceRecords(demoMode),
        DataService.getAuditLogs(demoMode),
      ]);
      setRecords(att);
      setAuditLogs(audits);
      setLoading(false);
    }
    load();
  }, [demoMode]);

  const filteredRecords = records.filter((r) => {
    return (
      r.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student?.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.class_session_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Institutional Attendance
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {records.length} Recorded Entries • {auditLogs.length} Audit Revisions
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Central</h1>
          <p className="text-xs text-slate-500">
            Audit learner attendance, custom late arrivals, and educator modification histories.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab("records")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              tab === "records"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Attendance Entries ({records.length})</span>
          </button>
          <button
            onClick={() => setTab("audit")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              tab === "audit"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail & Corrections ({auditLogs.length})</span>
          </button>
        </div>

        {tab === "records" ? (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, ID, or session..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class Session</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Late Duration</th>
                      <th className="py-3 px-4">Marked By</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Loading attendance entries...
                        </td>
                      </tr>
                    ) : filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No attendance records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {r.student?.full_name || r.student_id}
                            </div>
                            <div className="text-[11px] font-mono text-purple-700">
                              {r.student?.student_id || r.student_id}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {r.class_session_id}
                            </span>
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

                          <td className="py-3 px-4 text-slate-700">
                            {r.marked_by_teacher_id || "Faculty Member"}
                          </td>

                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                            {formatDate(r.submitted_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Immutable audit trail: Every attendance correction recorded by teachers or administrators is preserved with previous value, updated status, author, and timestamp.
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Modified By</th>
                      <th className="py-3 px-4">Session Code</th>
                      <th className="py-3 px-4">Previous Status</th>
                      <th className="py-3 px-4">Updated Status</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Loading audit records...
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No audit entries recorded.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900">{log.changed_by_name}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-purple-700 text-[11px]">
                              {log.class_session_id}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="line-through text-slate-400 font-mono text-[11px] uppercase">
                              {log.previous_status}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-purple-700 uppercase">
                              {log.updated_status}
                            </span>
                            {log.updated_status === "late" && (
                              <span className="text-[10px] text-amber-700 ml-1">
                                ({log.updated_late_duration} mins)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-700 max-w-xs">{log.reason || "-"}</td>

                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
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
    </AppShell>
  );
}
