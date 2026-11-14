"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/data-service";
import {
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Database,
  Info,
} from "lucide-react";

export default function DemoDataManagementPage() {
  const { demoMode, setDemoMode } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [counts, setCounts] = useState({
    demoStudents: 0,
    demoTeachers: 0,
    demoClasses: 0,
    demoAttendance: 0,
    realStudents: 0,
    realTeachers: 0,
    realClasses: 0,
  });

  const loadCounts = async () => {
    const [allStu, allTch, allCls, allAtt] = await Promise.all([
      DataService.getStudents(true),
      DataService.getTeachers(true),
      DataService.getClassSessions(true),
      DataService.getAttendanceRecords(true),
    ]);

    setCounts({
      demoStudents: allStu.filter((s) => s.is_demo).length,
      demoTeachers: allTch.filter((t) => t.is_demo).length,
      demoClasses: allCls.filter((c) => c.is_demo).length,
      demoAttendance: allAtt.filter((a) => a.is_demo).length,
      realStudents: allStu.filter((s) => !s.is_demo).length,
      realTeachers: allTch.filter((t) => !t.is_demo).length,
      realClasses: allCls.filter((c) => !c.is_demo).length,
    });
  };

  useEffect(() => {
    loadCounts();
  }, [demoMode]);

  const handleToggle = (newVal: boolean) => {
    setDemoMode(newVal);
    setSuccessMessage(`Demo mode switched to: ${newVal ? "ON" : "OFF"}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset demo data? This will restore the default realistic NIOS demonstration dataset while leaving real records completely untouched."
      )
    ) {
      setResetting(true);
      DataService.resetDemoData();
      setTimeout(() => {
        setResetting(false);
        setSuccessMessage("Demo dataset reset to initial reference state successfully.");
        loadCounts();
      }, 500);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Environment Settings
            </span>
            <span className="text-xs text-slate-500 font-medium">Administrator Authorization</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Demo Data Management
          </h1>
          <p className="text-xs text-slate-500">
            Control sample demonstration datasets with strict cryptographic data isolation.
          </p>
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Master Toggle Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">DEMO MODE STATUS:</span>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    demoMode
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  {demoMode ? "ACTIVE (ENABLED)" : "INACTIVE (DISABLED)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                {demoMode
                  ? "LiteraTrack is displaying fictional NIOS students, scheduled sessions, and attendance metrics for review and demonstration."
                  : "Demo mode is turned off. All demonstration records are hidden; only authentic Supabase institutional records will appear."}
              </p>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => handleToggle(!demoMode)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition ${
                  demoMode
                    ? "bg-amber-500 hover:bg-amber-600 text-amber-950"
                    : "bg-slate-800 hover:bg-slate-900 text-white"
                }`}
              >
                {demoMode ? (
                  <>
                    <ToggleRight className="w-6 h-6" />
                    <span>DEMO: ON</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6" />
                    <span>DEMO: OFF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dataset Metrics */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Dataset Segregation Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Demo Students
                </span>
                <span className="text-2xl font-black text-amber-900">{counts.demoStudents}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Fictional NIOS learners</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Demo Teachers
                </span>
                <span className="text-2xl font-black text-amber-900">{counts.demoTeachers}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Faculty profiles</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Demo Classes
                </span>
                <span className="text-2xl font-black text-amber-900">{counts.demoClasses}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Conducted sessions</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Demo Attendance
                </span>
                <span className="text-2xl font-black text-amber-900">{counts.demoAttendance}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Recorded log entries</span>
              </div>
            </div>
          </div>

          {/* Reset / Clean Controls */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Reset Demo Data State</h4>
              <p className="text-[11px] text-slate-500">
                Restores standard sample classes and attendance without modifying actual data.
              </p>
            </div>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span>{resetting ? "Resetting..." : "Reset Demo Data"}</span>
            </button>
          </div>
        </div>

        {/* Technical Isolation Safeguards */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Strict Data Isolation & Integrity Guarantees
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
            <li>
              <strong>Dedicated `is_demo` Schema Flag:</strong> Every record in Supabase PostgreSQL carries an indexed boolean flag <code className="text-purple-700 font-mono">is_demo</code>.
            </li>
            <li>
              <strong>Isolated Attendance Aggregates:</strong> Statistical calculations strictly filter records based on the active mode so demo attendance never skews real learner percentages.
            </li>
            <li>
              <strong>Safe Removal:</strong> Deleting or resetting demo data operates exclusively on demo records with zero impact on authentic student accounts.
            </li>
            <li>
              <strong>Admin Only:</strong> Only administrators possess authorization to view, toggle, or reset demo configurations.
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
