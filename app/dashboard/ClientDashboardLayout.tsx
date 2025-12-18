"use client";

import { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import { cn } from "@/lib/utils";

export default function ClientDashboardLayout({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  // Mobile drawer state could be managed here or inside sidebar
  // For now, we rely on sidebar's internal management for mobile

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-screen">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
