"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Subject } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AddTeacherPage() {
  const router = useRouter();
  const { demoMode } = useAuth();
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [assignedEducationLevels, setAssignedEducationLevels] = useState<string[]>([
    "Secondary (Class 10)",
  ]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    setDateOfJoining(new Date().toISOString().split("T")[0]);
    async function loadSubs() {
      const all = await DataService.getSubjects();
      setSubjectsList(all);
    }
    loadSubs();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!fullName || !email) {
      setError("Please complete all required fields (*).");
      setSubmitting(false);
      return;
    }

    if (assignedEducationLevels.length === 0) {
      setError("Please assign at least one education level.");
      setSubmitting(false);
      return;
    }

    try {
      const generatedId = `TCH-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const chosenSubjects = subjectsList.filter((s) => selectedSubjectIds.includes(s.id));

      await DataService.createTeacher({
        teacher_id: generatedId,
        full_name: fullName,
        email,
        phone,
        address,
        date_of_joining: dateOfJoining,
        assigned_education_levels: assignedEducationLevels,
        status: "active",
        is_demo: demoMode,
        subjects: chosenSubjects,
      });

      router.push("/admin/teachers");
    } catch (err: any) {
      setError(err.message || "Failed to register teacher record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Faculty</span>
          </Link>
          {demoMode && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo Record Active
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Register Teaching Faculty</h1>
              <p className="text-xs text-slate-500">
                Enroll educator profile and assign authorized subject streams.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh.sharma@literatrack.demo"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address (Optional)</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Office or residential address..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Assigned Education Levels */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Assigned Education Levels *
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
                Subjects Taught (Click to assign):
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
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/admin/teachers"
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? "Registering Faculty..." : "Register Faculty Member"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
