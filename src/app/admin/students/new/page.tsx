"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Subject, AdmissionStatus } from "@/lib/types/database";
import { calculateAge } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const { demoMode } = useAuth();
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number>(0);
  const [gender, setGender] = useState("Not specified");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [previousEducation, setPreviousEducation] = useState("");
  const [lastCompletedClass, setLastCompletedClass] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [educationLevel, setEducationLevel] = useState("Secondary (Class 10)");
  const [admissionDate, setAdmissionDate] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState<AdmissionStatus>("active");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    setAdmissionDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Automatically update age when DOB changes
  useEffect(() => {
    if (dob) {
      setAge(calculateAge(dob));
    }
  }, [dob]);

  // Load available subjects
  useEffect(() => {
    async function loadSubs() {
      const all = await DataService.getSubjects();
      setSubjectsList(all);
    }
    loadSubs();
  }, []);

  // Filter subjects matching current education level
  const relevantSubjects = subjectsList.filter((s) =>
    s.education_level.toLowerCase().includes(
      educationLevel.includes("10") ? "secondary" : "senior"
    )
  );

  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!fullName || !dob || !email || !guardianName || !guardianContact) {
      setError("Please complete all required fields (*).");
      setSubmitting(false);
      return;
    }

    try {
      const generatedId = `STU-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const chosenSubjects = subjectsList.filter((s) => selectedSubjectIds.includes(s.id));

      await DataService.createStudent({
        student_id: generatedId,
        full_name: fullName,
        dob,
        age,
        gender,
        email,
        phone,
        address,
        guardian_name: guardianName,
        guardian_contact: guardianContact,
        previous_education: previousEducation,
        last_completed_class: lastCompletedClass,
        previous_school: previousSchool,
        education_level: educationLevel,
        admission_date: admissionDate,
        admission_status: admissionStatus,
        is_demo: demoMode,
        subjects: chosenSubjects,
      });

      router.push("/admin/students");
    } catch (err: any) {
      setError(err.message || "Failed to admit student record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Students</span>
          </Link>
          {demoMode && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo Record Flag Active
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Student Admission & Enrollment</h1>
              <p className="text-xs text-slate-500">
                Register a new NIOS candidate. A unique Student ID will be generated automatically.
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
            {/* Section 1: Basic Demographics */}
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                1. Basic Demographics & Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calculated Age
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${age} years`}
                    className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold"
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
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@student.literatrack.demo"
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
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Residential address..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Section 2: Guardian Details */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                2. Parent / Guardian Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Manish Sharma"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Previous Academic History */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                3. Prior Academic History
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Previous Education Board
                  </label>
                  <input
                    type="text"
                    value={previousEducation}
                    onChange={(e) => setPreviousEducation(e.target.value)}
                    placeholder="e.g. CBSE / State Board"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Completed Class
                  </label>
                  <input
                    type="text"
                    value={lastCompletedClass}
                    onChange={(e) => setLastCompletedClass(e.target.value)}
                    placeholder="e.g. Class 9 or Class 10"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Previous School
                  </label>
                  <input
                    type="text"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: NIOS Admission & Subject Allocation */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                4. NIOS Stream & Course Allocation
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education Level *
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => {
                      setEducationLevel(e.target.value);
                      setSelectedSubjectIds([]);
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                  >
                    <option value="Secondary (Class 10)">Secondary (Class 10)</option>
                    <option value="Senior Secondary (Class 12)">Senior Secondary (Class 12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Status
                  </label>
                  <select
                    value={admissionStatus}
                    onChange={(e) => setAdmissionStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Enrolled NIOS Subjects (Click to select/deselect):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {relevantSubjects.map((sub) => {
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
                            <span className="font-mono text-[11px] text-purple-700">
                              {sub.code}
                            </span>
                            <span>{sub.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {sub.description}
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/admin/students"
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? "Admitting Student..." : "Complete Admission"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
