"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { ClassSession } from "@/lib/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  CalendarDays,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function TeacherClassesListPage() {
  const { teacherData, demoMode } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await DataService.getClassSessions(demoMode);
      const currentTeacherId = teacherData?.id || "tch-1";
      const filtered = all.filter(
        (c) => c.teacher_id === currentTeacherId || (demoMode && !c.teacher_id)
      );
      setClasses(filtered);
      setLoading(false);
    }
    load();
  }, [teacherData, demoMode]);

  const filtered = classes.filter((c) => {
    return (
      c.session_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.topics_covered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subject?.name && c.subject.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                My Class Schedule
              </span>
              <span className="text-xs text-slate-500 font-medium">{classes.length} Total</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Classes</h1>
            <p className="text-xs text-slate-500">
              Manage your instructional sessions and submit attendance records.
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

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes by code, title, topic or subject..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
          </div>
        </div>

        {/* Classes Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              Loading your classes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No matching classes found. Click &quot;Create Class&quot; to schedule a session.
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
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

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {c.title || c.topics_covered}
                  </h3>
                  <div className="text-xs font-semibold text-blue-700 mt-1">
                    {c.subject?.name || "Assigned Subject"}
                  </div>
                  <div className="text-[11px] text-slate-400">{c.education_level}</div>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block text-[10px] uppercase mb-0.5">
                      Topics Covered:
                    </span>
                    <p className="line-clamp-2 leading-relaxed">{c.topics_covered}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <div className="font-semibold text-slate-700">{formatDate(c.class_date)}</div>
                    <div className="font-mono text-[11px]">
                      {formatTime(c.start_time)} ({c.duration_minutes}m)
                    </div>
                  </div>

                  {c.attendance_status === "pending" ? (
                    <Link
                      href={`/teacher/attendance/log?session=${c.id}`}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1"
                    >
                      <span>Log Attendance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/teacher/attendance?session=${c.id}&view=class`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
                    >
                      View Attendance
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
