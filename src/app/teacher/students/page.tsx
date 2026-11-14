"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Student } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, Search, BookOpen, UserCheck } from "lucide-react";

export default function AssignedStudentsPage() {
  const { teacherData, demoMode } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allStu = await DataService.getStudents(demoMode);

      const teacherSubjectIds = new Set(teacherData?.subjects?.map((s) => s.id) || []);
      const assigned = allStu.filter((stu) =>
        stu.subjects?.some((sub) => teacherSubjectIds.has(sub.id))
      );

      setStudents(assigned.length > 0 ? assigned : allStu);
      setLoading(false);
    }
    load();
  }, [teacherData, demoMode]);

  const filtered = students.filter((s) => {
    return (
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Roster
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {students.length} Learners in Your Subject Tracks
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Students</h1>
          <p className="text-xs text-slate-500">
            Learners enrolled in subjects matching your teaching assignments.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student ID & Name</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Enrolled Subjects</th>
                  <th className="py-3 px-4">Parent Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading assigned student roster...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{s.full_name}</div>
                        <div className="text-[11px] font-mono text-purple-700">{s.student_id}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{s.education_level}</div>
                        <div className="text-[11px] text-slate-400">Age: {s.age} yrs</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.subjects?.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200"
                            >
                              {sub.code}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{s.guardian_name}</div>
                        <div className="text-[11px] text-slate-400">{s.guardian_contact}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {s.admission_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/teacher/attendance?view=individual&student=${s.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-semibold transition inline-block"
                        >
                          View Attendance
                        </Link>
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
