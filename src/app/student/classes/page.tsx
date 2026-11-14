"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { ClassSession, Attendance, Subject } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CalendarDays,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function StudentMyClassesPage() {
  const { studentData, demoMode } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const stuId = studentData?.id || "stu-1";
      const [allCls, allAtt, allSubs] = await Promise.all([
        DataService.getClassSessions(demoMode),
        DataService.getAttendanceRecords(demoMode),
        DataService.getSubjects(),
      ]);

      const enrolledIds = new Set(
        studentData?.subjects?.map((s) => s.id) || [
          "sub-101",
          "sub-102",
          "sub-103",
          "sub-104",
        ]
      );

      const relevant = allCls.filter((c) => enrolledIds.has(c.subject_id));
      const stuAttendance = allAtt.filter((a) => a.student_id === stuId);

      setClasses(relevant);
      setAttendanceRecords(stuAttendance);
      setSubjects(studentData?.subjects || allSubs.slice(0, 4));
      setLoading(false);
    }
    load();
  }, [studentData, demoMode]);

  const filtered = classes.filter((c) => {
    const matchesSearch =
      c.topics_covered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.subject?.name && c.subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.teacher?.full_name && c.teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === "ALL" || c.subject_id === selectedSubject;
    const matchesStart = !startDate || c.class_date >= startDate;
    const matchesEnd = !endDate || c.class_date <= endDate;

    return matchesSearch && matchesSubject && matchesStart && matchesEnd;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Curriculum Schedule
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {classes.length} Classes for Your Enrolled Subjects
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Classes</h1>
          <p className="text-xs text-slate-500">
            View conducted and upcoming lectures with your personalized attendance records.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or faculty..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Subject filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range filters */}
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2 py-1"
              />
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2 py-1"
              />
            </div>
          </div>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Subject & Session</th>
                  <th className="py-3 px-4">Topics Covered</th>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Timing & Duration</th>
                  <th className="py-3 px-4">My Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading your classes...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching classes found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cls) => {
                    const rec = attendanceRecords.find(
                      (a) => a.class_session_id === cls.id
                    );
                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {cls.subject?.name || "Enrolled Subject"}
                          </div>
                          <span className="font-mono text-purple-700 text-[10px] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 font-bold">
                            {cls.session_code}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 line-clamp-1">
                            {cls.title || cls.topics_covered}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {cls.topics_covered}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 font-semibold">
                          {cls.teacher?.full_name || "Faculty Member"}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {formatDate(cls.class_date)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-slate-900 text-xs">
                            {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cls.duration_minutes} minutes
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {rec ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                rec.status === "present"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rec.status === "late"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {rec.status === "present" && <CheckCircle2 className="w-3 h-3" />}
                              {rec.status === "late" && <Clock className="w-3 h-3" />}
                              {rec.status === "absent" && <XCircle className="w-3 h-3" />}
                              <span>{rec.status}</span>
                              {rec.status === "late" && ` (${rec.late_duration_minutes}m)`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              Attendance Pending
                            </span>
                          )}
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
    </AppShell>
  );
}
