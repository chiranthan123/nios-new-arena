"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Student, Subject, Attendance } from "@/lib/types/database";
import { formatDate, calculateAge } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  Percent,
} from "lucide-react";


function StudentProfileContent() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;
  const { demoMode } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState<any>("active");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [stu, subs, calc] = await Promise.all([
        DataService.getStudentById(studentId),
        DataService.getSubjects(),
        DataService.calculateStudentStats(studentId, demoMode),
      ]);

      if (stu) {
        setStudent(stu);
        setFullName(stu.full_name);
        setDob(stu.dob);
        setGender(stu.gender || "Not specified");
        setEmail(stu.email);
        setPhone(stu.phone || "");
        setAddress(stu.address || "");
        setGuardianName(stu.guardian_name);
        setGuardianContact(stu.guardian_contact);
        setAdmissionStatus(stu.admission_status);
        setSelectedSubjectIds(stu.subjects?.map((s) => s.id) || []);
      }
      setSubjectsList(subs);
      setStats(calc);
      setLoading(false);
    }
    loadData();
  }, [studentId, demoMode]);

  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const chosenSubjects = subjectsList.filter((s) => selectedSubjectIds.includes(s.id));
      const age = dob ? calculateAge(dob) : student.age;

      await DataService.updateStudent(student.id, {
        full_name: fullName,
        dob,
        age,
        gender,
        email,
        phone,
        address,
        guardian_name: guardianName,
        guardian_contact: guardianContact,
        admission_status: admissionStatus,
        subjects: chosenSubjects,
      });

      setSuccessMessage("Student profile and subject allocations updated successfully!");
      const updatedStu = await DataService.getStudentById(student.id);
      if (updatedStu) setStudent(updatedStu);
    } catch (err: any) {
      setError(err.message || "Failed to update student profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading student details...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">Student not found.</p>
        <Link
          href="/admin/students"
          className="text-xs text-purple-600 font-semibold mt-2 inline-block"
        >
          Return to student list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Students</span>
          </Link>
          <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
            ID: {student.student_id}
          </span>
        </div>

        {/* Top Summary Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-900/20">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{student.full_name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                    student.admission_status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {student.admission_status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {student.education_level} • Admitted {formatDate(student.admission_date)}
              </p>
            </div>
          </div>

          {/* Quick Attendance Pill */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Attendance %
              </span>
              <span className="text-lg font-black text-purple-700">
                {stats?.percentage ?? 0}%
              </span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Classes Attended
              </span>
              <span className="text-xs font-bold text-slate-800">
                {stats?.attendedCount ?? 0} / {stats?.totalConducted ?? 0}
              </span>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Edit Student Information</h2>
              <p className="text-xs text-slate-500">Update personal, contact, and enrollment data</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="Not specified">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admission Status
                </label>
                <select
                  value={admissionStatus}
                  onChange={(e) => setAdmissionStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guardian Contact
                </label>
                <input
                  type="tel"
                  required
                  value={guardianContact}
                  onChange={(e) => setGuardianContact(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Subject Allocation */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Enrolled NIOS Subjects:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {subjectsList.map((sub) => {
                  const isSelected = selectedSubjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? "bg-purple-50 border-purple-400 text-purple-900"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-purple-700">{sub.code}</span>
                          <span>{sub.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {sub.education_level}
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Student Attendance Record History */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Attendance History for this Learner</h3>
            <p className="text-xs text-slate-500">
              Conducted classes and registered attendance status
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Session Code</th>
                  <th className="py-2.5 px-3">Attendance Status</th>
                  <th className="py-2.5 px-3">Late Delay</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats?.records && stats.records.length > 0 ? (
                  stats.records.map((r: Attendance) => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3">{formatDate(r.submitted_at)}</td>
                      <td className="py-2.5 px-3 font-mono text-purple-700">
                        {r.class_session_id}
                      </td>
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3">
                        {r.status === "late" ? `${r.late_duration_minutes} mins` : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                        {new Date(r.submitted_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No attendance records found for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

export default function StudentProfilePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading profile...</div>}>
        <StudentProfileContent />
      </Suspense>
    </AppShell>
  );
}
