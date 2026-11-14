"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import { Subject, ClassSession } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Save,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function CreateClassPage() {
  const router = useRouter();
  const { teacherData, demoMode } = useAuth();

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [existingClasses, setExistingClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [educationLevel, setEducationLevel] = useState("Secondary (Class 10)");
  const [topicsCovered, setTopicsCovered] = useState("");
  const [classDate, setClassDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:30");
  const [durationMinutes, setDurationMinutes] = useState(90);

  useEffect(() => {
    setClassDate(new Date().toISOString().split("T")[0]);
    async function init() {
      setLoading(true);
      const [subs, allCls] = await Promise.all([
        DataService.getSubjects(),
        DataService.getClassSessions(demoMode),
      ]);

      // If teacher has assigned subjects, pre-select or limit to teacher's authorized subjects
      const teacherSubs = teacherData?.subjects || [];
      const authorizedList = teacherSubs.length > 0 ? teacherSubs : subs;

      setAvailableSubjects(authorizedList);
      if (authorizedList.length > 0) {
        setSelectedSubjectId(authorizedList[0].id);
        setEducationLevel(authorizedList[0].education_level);
      }
      setExistingClasses(allCls);
      setLoading(false);
    }
    init();
  }, [teacherData, demoMode]);

  // Calculate duration automatically and check for session overlap
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
      setDurationMinutes(diffMinutes > 0 ? diffMinutes : 0);

      // Overlap warning check
      if (diffMinutes > 0 && classDate) {
        const conflict = existingClasses.find((cls) => {
          if (cls.class_date !== classDate) return false;
          // check if times overlap
          return (
            (startTime >= cls.start_time && startTime < cls.end_time) ||
            (endTime > cls.start_time && endTime <= cls.end_time) ||
            (startTime <= cls.start_time && endTime >= cls.end_time)
          );
        });

        if (conflict) {
          setOverlapWarning(
            `Warning: This time slot overlaps with session ${conflict.session_code} (${conflict.start_time} - ${conflict.end_time}). Please verify.`
          );
        } else {
          setOverlapWarning(null);
        }
      }
    }
  }, [startTime, endTime, classDate, existingClasses]);

  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = availableSubjects.find((s) => s.id === subId);
    if (sub) {
      setEducationLevel(sub.education_level);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSubjectId || !topicsCovered || !classDate || !startTime || !endTime) {
      setError("Please fill in all required fields (*).");
      return;
    }

    if (durationMinutes <= 0) {
      setError("End time must be later than start time.");
      return;
    }

    setSubmitting(true);
    try {
      const subject = availableSubjects.find((s) => s.id === selectedSubjectId);
      const generatedSessionCode = `CLS-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      await DataService.createClassSession({
        session_code: generatedSessionCode,
        teacher_id: teacherData?.id || "tch-1",
        subject_id: selectedSubjectId,
        title: title || `${subject?.name || "Subject"} Lecture`,
        education_level: educationLevel,
        topics_covered: topicsCovered,
        class_date: classDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        attendance_status: "pending",
        is_demo: demoMode,
        subject,
        teacher: teacherData || undefined,
      });

      router.push("/teacher/classes");
    } catch (err: any) {
      setError(err.message || "Failed to schedule class session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Classes</span>
          </Link>
          {demoMode && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo Data Active
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Create New Class Session</h1>
              <p className="text-xs text-slate-500">
                Schedule curriculum session. Eligible enrolled students will be mapped automatically.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {overlapWarning && (
            <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{overlapWarning}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quadratic Equations: Problem Solving & Solutions"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Competency *
                </label>
                <select
                  required
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.education_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grade / Education Level *
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="Secondary (Class 10)">Secondary (Class 10)</option>
                  <option value="Senior Secondary (Class 12)">Senior Secondary (Class 12)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topics Covered & Learning Objectives *
              </label>
              <textarea
                rows={3}
                required
                value={topicsCovered}
                onChange={(e) => setTopicsCovered(e.target.value)}
                placeholder="Specific concepts, syllabus unit, textbook exercises, laboratory experiments..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Date *
                </label>
                <input
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <div
                  className={`text-xs px-3 py-2 rounded-lg font-bold border ${
                    durationMinutes > 0
                      ? "bg-slate-100 text-slate-800 border-slate-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {durationMinutes > 0 ? `${durationMinutes} minutes` : "Invalid times"}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/teacher/classes"
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || durationMinutes <= 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? "Scheduling Class..." : "Schedule Class Session"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
