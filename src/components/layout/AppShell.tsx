"use client";

import React, { useState, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DemoBanner } from "./DemoBanner";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <DemoBanner />
      <div className="flex flex-1">
        <Suspense fallback={<aside className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 hidden lg:block" />}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Suspense fallback={<header className="h-14 bg-white border-b border-slate-200" />}>
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </Suspense>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
