"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Teacher, Subject } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";


function TeacherProfileContent() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params?.id as string;
  const { demoMode } = useAuth();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [assignedEducationLevels, setAssignedEducationLevels] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tch, subs] = await Promise.all([
        DataService.getTeacherById(teacherId),
        DataService.getSubjects(),
      ]);

      if (tch) {
        setTeacher(tch);
        setFullName(tch.full_name);
        setEmail(tch.email);
        setPhone(tch.phone || "");
        setAddress(tch.address || "");
        setStatus(tch.status);
        setAssignedEducationLevels(tch.assigned_education_levels || []);
        setSelectedSubjectIds(tch.subjects?.map((s) => s.id) || []);
      }
      setSubjectsList(subs);
      setLoading(false);
    }
    loadData();
  }, [teacherId]);

  const toggleLevel = (lvl: string) => {
    setAssignedEducationLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const chosenSubjects = subjectsList.filter((s) => selectedSubjectIds.includes(s.id));

      await DataService.updateTeacher(teacher.id, {
        full_name: fullName,
        email,
        phone,
        address,
        status,
        assigned_education_levels: assignedEducationLevels,
        subjects: chosenSubjects,
      });

      setSuccessMessage("Teacher profile updated successfully!");
      const updatedTch = await DataService.getTeacherById(teacher.id);
      if (updatedTch) setTeacher(updatedTch);
    } catch (err: any) {
      setError(err.message || "Failed to update teacher profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading faculty details...</div>;
  }

  if (!teacher) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">Teacher not found.</p>
        <Link
          href="/admin/teachers"
          className="text-xs text-purple-600 font-semibold mt-2 inline-block"
        >
          Return to faculty list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Faculty</span>
          </Link>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
            ID: {teacher.teacher_id}
          </span>
        </div>

        {/* Top Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              {teacher.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">{teacher.full_name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                    teacher.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {teacher.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Faculty Member • Joined {formatDate(teacher.date_of_joining)}
              </p>
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

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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

            {/* Assigned Levels */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Assigned Education Levels:
              </label>
              <div className="flex flex-wrap gap-3">
                {["Secondary (Class 10)", "Senior Secondary (Class 12)"].map((lvl) => {
                  const isChecked = assignedEducationLevels.includes(lvl);
                  return (
                    <label
                      key={lvl}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        isChecked
                          ? "bg-purple-50 border-purple-400 text-purple-900"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLevel(lvl)}
                        className="rounded text-purple-600"
                      />
                      <span>{lvl}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Subjects Taught */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Subjects Competencies (Click to toggle):
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
                          ? "bg-blue-50 border-blue-400 text-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-blue-700">{sub.code}</span>
                          <span>{sub.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {sub.education_level}
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
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
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Faculty Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

export default function TeacherProfilePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading faculty profile...</div>}>
        <TeacherProfileContent />
      </Suspense>
    </AppShell>
  );
}
