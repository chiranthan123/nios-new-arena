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
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  ChevronRight,
} from "lucide-react";

export default function AdminClassesPage() {
  const { demoMode } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await DataService.getClassSessions(demoMode);
      setClasses(data);
      setLoading(false);
    }
    load();
  }, [demoMode]);

  const filtered = classes.filter((c) => {
    const matchesSearch =
      c.session_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.topics_covered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subject?.name && c.subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.teacher?.full_name && c.teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = levelFilter === "ALL" || c.education_level.includes(levelFilter);
    const matchesStatus = statusFilter === "ALL" || c.attendance_status === statusFilter;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Institutional Schedule
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {classes.length} Sessions Conducted & Scheduled
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class Sessions</h1>
          <p className="text-xs text-slate-500">
            Audit learning sessions across all NIOS faculty and curriculum subjects.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, code, teacher, or topic..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="ALL">All Levels</option>
                <option value="Secondary">Class 10</option>
                <option value="Senior">Class 12</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="ALL">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Session Code & Title</th>
                  <th className="py-3 px-4">Subject & Level</th>
                  <th className="py-3 px-4">Educator</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading class sessions...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching classes found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {c.title || "Class Session"}
                          {c.is_demo && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-normal">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-purple-700 text-[11px] mt-0.5">
                          {c.session_code}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-sm">
                          {c.topics_covered}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {c.subject?.name || "Assigned Subject"}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.education_level}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {c.teacher?.full_name || "Faculty"}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.teacher?.email}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {formatDate(c.class_date)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {formatTime(c.start_time)} - {formatTime(c.end_time)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {c.duration_minutes} mins
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                            c.attendance_status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {c.attendance_status === "completed" ? "Logged" : "Pending Log"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
