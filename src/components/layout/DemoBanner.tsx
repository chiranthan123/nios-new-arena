"use client";

import React from "react";
import { useAuth, DEMO_USERS } from "@/context/AuthContext";
import { AlertCircle, RefreshCw, ToggleLeft, ToggleRight, UserCheck } from "lucide-react";

export function DemoBanner() {
  const { demoMode, setDemoMode, currentRole, switchDemoRole } = useAuth();

  return (
    <div className="bg-amber-500 text-amber-950 border-b border-amber-600/30 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-900 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-950"></span>
        </span>
        <span className="font-bold tracking-wide uppercase">
          {demoMode ? "DEMO MODE ACTIVE" : "PRODUCTION DATA MODE"}
        </span>
        <span className="hidden sm:inline text-amber-900">
          {demoMode
            ? "— Showing realistic NIOS learner & session records."
            : "— Demo records hidden. Only real Supabase data is shown."}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-amber-600/20 px-2 py-0.5 rounded border border-amber-600/40">
          <UserCheck className="w-3.5 h-3.5 text-amber-950" />
          <span className="font-medium text-amber-950">Test Role:</span>
          <select
            value={currentRole || "admin"}
            onChange={(e) => {
              const selected = DEMO_USERS.find((u) => u.role === e.target.value);
              if (selected) switchDemoRole(selected);
            }}
            aria-label="Select Demo Role"
            className="bg-white/80 text-amber-950 font-semibold rounded px-1.5 py-0.5 text-xs outline-none cursor-pointer border border-amber-600/30 hover:bg-white"
          >
            <option value="admin">Administrator</option>
            <option value="teacher">Teacher (Dr. Rajesh)</option>
            <option value="student">Student (Aarav Patel)</option>
          </select>
        </div>

        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-xs transition ${
            demoMode
              ? "bg-amber-950 text-amber-100 hover:bg-black"
              : "bg-emerald-700 text-white hover:bg-emerald-800"
          }`}
          title="Toggle Demo Mode ON/OFF"
        >
          {demoMode ? (
            <>
              <ToggleRight className="w-3.5 h-3.5" />
              <span>Demo: ON</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-3.5 h-3.5" />
              <span>Demo: OFF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
