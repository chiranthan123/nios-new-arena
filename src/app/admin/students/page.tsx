"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Student } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";

export default function AdminStudentsListPage() {
  const { demoMode } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const loadStudents = async () => {
    setLoading(true);
    const data = await DataService.getStudents(demoMode);
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [demoMode]);

  const handleToggleStatus = async (student: Student) => {
    const nextStatus = student.admission_status === "active" ? "inactive" : "active";
    if (
      confirm(
        `Are you sure you want to change ${student.full_name}'s status to ${nextStatus.toUpperCase()}?`
      )
    ) {
      await DataService.updateStudent(student.id, { admission_status: nextStatus as any });
      await loadStudents();
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));

    const matchesLevel =
      selectedLevel === "ALL" || s.education_level.toLowerCase().includes(selectedLevel.toLowerCase());

    const matchesStatus = selectedStatus === "ALL" || s.admission_status === selectedStatus;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Learner Records
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {students.length} Total Enrolled
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Management</h1>
            <p className="text-xs text-slate-500">
              Manage admissions, academic levels, subject allocations and profile data.
            </p>
          </div>

          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Admit New Student</span>
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="ALL">All Levels</option>
                <option value="Secondary">Secondary (Class 10)</option>
                <option value="Senior">Senior Secondary (Class 12)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student ID & Name</th>
                  <th className="py-3 px-4">Level & Age</th>
                  <th className="py-3 px-4">Enrolled Subjects</th>
                  <th className="py-3 px-4">Parent / Contact</th>
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading student records...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {s.full_name}
                          {s.is_demo && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-normal">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-purple-700 mt-0.5">
                          {s.student_id}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{s.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-semibold">{s.education_level}</div>
                        <div className="text-[11px] text-slate-400">
                          Age: {s.age} yrs • {s.gender || "Not specified"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.subjects && s.subjects.length > 0 ? (
                            s.subjects.map((sub) => (
                              <span
                                key={sub.id}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200"
                                title={sub.name}
                              >
                                {sub.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">No subjects mapped</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{s.guardian_name}</div>
                        <div className="text-[11px] text-slate-400">{s.guardian_contact}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {formatDate(s.admission_date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                            s.admission_status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {s.admission_status === "active" ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {s.admission_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                            title="View / Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title={s.admission_status === "active" ? "Deactivate" : "Activate"}
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
