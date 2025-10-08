"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  Sparkles,
  User,
  Calendar,
  BarChart2,
} from "lucide-react";

type StatChipProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
};

function chooseAccent(title: string) {
  const t = title.toLowerCase();
  if (t.includes("total") || t.includes("draft")) return "green";
  if (t.includes("ai")) return "purple";
  if (t.includes("manual") || t.includes("this month")) return "blue";
  if (t.includes("week") || t.includes("month")) return "amber";
  return "slate";
}

function chooseIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("total") || t.includes("draft")) return CheckCircle;
  if (t.includes("ai")) return Sparkles;
  if (t.includes("manual")) return User;
  if (t.includes("week") || t.includes("month")) return Calendar;
  return BarChart2;
}

export default function StatChip({ title, value, subtitle }: StatChipProps) {
  const AccentIcon = chooseIcon(title);
  const accent = chooseAccent(title);

  const prevRef = useRef<number | null>(null);
  const [display, setDisplay] = useState<string | number>(
    typeof value === "number" ? value : String(value)
  );

  useEffect(() => {
    // Animate numbers with a small count-up; otherwise fade text
    const isNumber = typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value));
    if (!isNumber) {
      // simple fade: set display after small timeout to allow CSS transition
      setDisplay(String(value));
      return;
    }

    const target = Number(value);
    const start = prevRef.current ?? 0;
    const duration = 600;
    const startTime = performance.now();

    const raf = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + (target - start) * eased);
      setDisplay(current);
      if (t < 1) requestAnimationFrame(raf);
      else prevRef.current = target;
    };

    requestAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const accentClasses = {
    green: "text-green-600 bg-green-50 border-green-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-700 bg-white border-gray-200",
  } as const;

  return (
    <div
      className={`inline-flex items-center gap-3 px-3 py-2 rounded-full border shadow-sm transition-colors backdrop-blur-sm ${accentClasses[accent]}`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/60 border border-white">
        <AccentIcon className="w-4 h-4" />
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-current transition-opacity duration-200">
          {display}
        </span>
        <span className="text-xs text-current/60 -mt-0.5">{title}</span>
      </div>

      {subtitle && <span className="text-xs text-current/40 ml-2">{subtitle}</span>}
    </div>
  );
}
