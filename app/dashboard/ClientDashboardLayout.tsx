"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";

export default function ClientDashboardLayout({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLarge, setIsLarge] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLarge(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // compute left padding for large screens only
  const leftPadding = isLarge ? (isCollapsed ? "5rem" : "16rem") : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-white to-blue-200">
      <DashboardSidebar
        user={user}
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
      />

      <div
        style={{
          paddingLeft: leftPadding,
          transition: "padding-left 220ms cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <main className="pt-18 md:py-6 transition-all">
          <div className="app-container">
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow duration-200 lg:flex">
              {/* left accent like LinkedIn cards */}
              <div className="hidden lg:block w-1 bg-blue-400" />

              <div className="flex-1 rounded-xl bg-white/50 border border-gray-100 p-6 shadow-sm max-w-7xl mx-auto min-h-[95vh]  max-h-[95vh] overflow-scroll flex flex-col w-full">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
