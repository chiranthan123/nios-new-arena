"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import {
  User,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
} from "lucide-react";

export default function StudentProfilePage() {
  const { studentData } = useAuth();

  const student = studentData || {
    student_id: "STU-2026-0001",
    full_name: "Aarav Patel",
    dob: "2010-04-12",
    age: 16,
    gender: "Male",
    email: "aarav.patel@student.literatrack.demo",
    phone: "+91 91234 56780",
    address: "Plot 14, Sector 15, Rohini, Delhi",
    guardian_name: "Manish Patel",
    guardian_contact: "+91 91234 56789",
    education_level: "Secondary (Class 10)",
    admission_date: "2026-01-05",
    admission_status: "active",
    subjects: [
      { id: "sub-101", code: "NIOS-211", name: "Mathematics (Class 10)" },
      { id: "sub-102", code: "NIOS-212", name: "Science and Technology" },
      { id: "sub-103", code: "NIOS-213", name: "Social Science" },
      { id: "sub-104", code: "NIOS-202", name: "English (Class 10)" },
    ],
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Student Record
            </span>
            <span className="text-xs font-mono text-purple-700">{student.student_id}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-xs text-slate-500">
            Official student registration details recorded with the NIOS learning centre.
          </p>
        </div>

        {/* Read-Only Notice as specified in Section 2 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-700 shrink-0" />
          <span>
            <strong>Official Record Security:</strong> Per institution policy, students cannot modify their official attendance or registration records directly. Contact the administrator for updates.
          </span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-900/20">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{student.full_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {student.admission_status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.education_level} • Admitted {formatDate(student.admission_date)}
            </p>
          </div>
        </div>

        {/* Demographics & Contact */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Personal & Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Student Identification (ID)</span>
                <span className="font-mono font-bold text-purple-700 text-sm">
                  {student.student_id}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth & Age</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(student.dob)} ({student.age} years)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Gender</span>
                <span className="font-semibold text-slate-900">{student.gender || "Not specified"}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Registered Email</span>
                <span className="font-semibold text-slate-900">{student.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Phone Number</span>
                <span className="font-semibold text-slate-900">{student.phone || "-"}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Residential Address</span>
                <span className="font-semibold text-slate-900">{student.address || "-"}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Parent / Guardian Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Guardian Name</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {student.guardian_name}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Emergency Contact</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {student.guardian_contact}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Enrolled NIOS Curriculum Subjects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.subjects?.map((sub: any) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{sub.name}</span>
                    <span className="font-mono text-purple-700 text-[11px]">{sub.code}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
