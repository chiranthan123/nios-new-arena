"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  Database,
  Sliders,
  BookOpen,
  PlusCircle,
  FileText,
  User,
  LogOut,
  X,
  History,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentRole, profile, signOut, demoMode } = useAuth();

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "All Students", href: "/admin/students", icon: Users },
    { label: "Add Student", href: "/admin/students/new", icon: PlusCircle },
    { label: "All Teachers", href: "/admin/teachers", icon: GraduationCap },
    { label: "Add Teacher", href: "/admin/teachers/new", icon: PlusCircle },
    { label: "All Classes", href: "/admin/classes", icon: CalendarDays },
    { label: "Attendance Records", href: "/admin/attendance", icon: CheckCircle2 },
    { label: "Demo Data Mode", href: "/admin/demo-data", icon: Sliders },
    { label: "Database Setup", href: "/admin/database", icon: Database },
  ];

  const teacherNav = [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Create Class", href: "/teacher/classes/new", icon: PlusCircle },
    { label: "My Classes", href: "/teacher/classes", icon: CalendarDays },
    { label: "Log Attendance", href: "/teacher/attendance/log", icon: CheckCircle2 },
    { label: "Attendance Hub", href: "/teacher/attendance", icon: FileText },
    { label: "Assigned Students", href: "/teacher/students", icon: Users },
  ];

  const studentNav = [
    { label: "My Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Classes", href: "/student/classes", icon: CalendarDays },
    { label: "My Attendance", href: "/student/attendance", icon: CheckCircle2 },
    { label: "My Profile", href: "/student/profile", icon: User },
  ];

  let navItems = adminNav;
  let roleTitle = "Administrator";
  let roleColor = "bg-purple-100 text-purple-700 border-purple-200";

  if (currentRole === "teacher") {
    navItems = teacherNav;
    roleTitle = "Teacher";
    roleColor = "bg-blue-100 text-blue-700 border-blue-200";
  } else if (currentRole === "student") {
    navItems = studentNav;
    roleTitle = "Student (NIOS)";
    roleColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/30 font-black text-lg">
              LT
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                LiteraTrack
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded border border-purple-400/30">
                  NIOS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Learning Centre Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user badge */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${roleColor}`}
            >
              {roleTitle}
            </span>
            {demoMode && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Demo
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-200 truncate">
            {profile?.full_name || "Signed In"}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{profile?.email}</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/teacher" &&
                item.href !== "/student" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-rose-900/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
