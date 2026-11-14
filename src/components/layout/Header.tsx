"use client";

import React from "react";
import { useAuth, DEMO_USERS } from "@/context/AuthContext";
import { Menu, Bell, Shield, GraduationCap, User, ChevronDown } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentRole, profile, switchDemoRole, signOut, demoMode } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>LiteraTrack Academic Portal</span>
            <span className="hidden sm:inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              National Institute of Open Schooling
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Empowering NIOS Secondary & Senior Secondary Learners
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for seamless evaluation */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-600">Switch View:</span>
          <div className="flex gap-1">
            <button
              onClick={() => switchDemoRole(DEMO_USERS[0])}
              className={`text-xs px-2 py-0.5 rounded font-medium transition ${
                currentRole === "admin"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => switchDemoRole(DEMO_USERS[1])}
              className={`text-xs px-2 py-0.5 rounded font-medium transition ${
                currentRole === "teacher"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => switchDemoRole(DEMO_USERS[3])}
              className={`text-xs px-2 py-0.5 rounded font-medium transition ${
                currentRole === "student"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Student
            </button>
          </div>
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {profile?.full_name || "User"}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">{currentRole || "Logged in"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
