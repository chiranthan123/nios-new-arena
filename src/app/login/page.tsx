"use client";

import React, { useState } from "react";
import { useAuth, DEMO_USERS, DemoUserOption } from "@/context/AuthContext";
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  KeyRound,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const { signIn, requestPasswordReset, switchDemoRole } = useAuth();

  const [mode, setMode] = useState<"login" | "activate">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid email or password. Please verify credentials.");
      }
    } catch {
      setErrorMessage("Network error connecting to Supabase Auth service.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!email) {
      setErrorMessage("Please enter your registered institution email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setSuccessMessage(
          "Activation / Recovery link sent! Please check your registered email inbox to verify ownership and set your password."
        );
      } else {
        setErrorMessage(res.error || "Failed to send activation email.");
      }
    } catch {
      setErrorMessage("Error requesting password recovery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xl shadow-purple-900/40 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">LiteraTrack</h2>
        <p className="mt-1 text-sm text-indigo-200">
          Academic Progress & Attendance Portal for NIOS Learning Centres
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Tab Selector: Login vs Activate */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition ${
                mode === "login"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("activate");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition ${
                mode === "activate"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Activate / Reset Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@literatrack.demo"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">First time logging in?</span>
                <button
                  type="button"
                  onClick={() => setMode("activate")}
                  className="font-semibold text-purple-600 hover:text-purple-700"
                >
                  Activate Account
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition"
              >
                {loading ? "Authenticating with Supabase..." : "Sign In to Portal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAccountActivation} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  First-Time Account Activation
                </p>
                <p className="text-indigo-700 leading-relaxed">
                  Students and teachers are enrolled by the administrator. Enter your registered email to receive an official Supabase recovery/verification link to set your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@student.literatrack.demo"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
              >
                {loading ? "Sending link..." : "Send Verification & Activation Link"}
                <Mail className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Evaluation Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Evaluation Access
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Instant Demo
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Click any role below to instantly explore the dashboard with pre-populated NIOS records:
            </p>
            <div className="space-y-2">
              {DEMO_USERS.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchDemoRole(u)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition group flex items-center justify-between"
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>{u.name}</span>
                      <span className="capitalize text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{u.detail}</div>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security / RBAC footnote */}
        <div className="mt-4 text-center">
          <p className="text-xs text-indigo-200 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secured by Supabase Row Level Security & RBAC Policies
          </p>
        </div>
      </div>
    </div>
  );
}
