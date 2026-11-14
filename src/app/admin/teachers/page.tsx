"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Teacher } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  PlusCircle,
  Edit2,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";

export default function AdminTeachersListPage() {
  const { demoMode } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeachers = async () => {
    setLoading(true);
    const data = await DataService.getTeachers(demoMode);
    setTeachers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTeachers();
  }, [demoMode]);

  const handleToggleStatus = async (teacher: Teacher) => {
    const nextStatus = teacher.status === "active" ? "inactive" : "active";
    if (
      confirm(
        `Are you sure you want to change ${teacher.full_name}'s status to ${nextStatus.toUpperCase()}?`
      )
    ) {
      await DataService.updateTeacher(teacher.id, { status: nextStatus as any });
      await loadTeachers();
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    return (
      t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacher_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.phone && t.phone.includes(searchQuery))
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Faculty Records
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {teachers.length} Active Educators
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Management</h1>
            <p className="text-xs text-slate-500">
              Manage teacher profiles, subject competencies, and assigned NIOS streams.
            </p>
          </div>

          <Link
            href="/admin/teachers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Teacher</span>
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
              placeholder="Search faculty by name, ID, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
            />
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Faculty ID & Name</th>
                  <th className="py-3 px-4">Subjects Taught</th>
                  <th className="py-3 px-4">Assigned Levels</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading teachers...
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {t.full_name}
                          {t.is_demo && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-normal">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-purple-700 mt-0.5">
                          {t.teacher_id}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.subjects && t.subjects.length > 0 ? (
                            t.subjects.map((sub) => (
                              <span
                                key={sub.id}
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200"
                              >
                                {sub.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">No subjects assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          {t.assigned_education_levels.map((lvl, idx) => (
                            <span key={idx} className="text-[11px] text-slate-700">
                              • {lvl}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{t.phone || "-"}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {t.address || "Address not recorded"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {formatDate(t.date_of_joining)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                            t.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {t.status === "active" ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/teachers/${t.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                            title="Edit Faculty Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title={t.status === "active" ? "Deactivate" : "Activate"}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
