"use client";

import React from "react";
import StatChip from "./StatChip";

type Stat = { title: string; value: React.ReactNode; subtitle?: string };

export default function DashboardContainer({
  title,
  description,
  stats,
  headerRight,
  children,
}: {
  title: string;
  description?: string;
  stats?: Stat[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        {headerRight}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {stats.map((s, idx) => (
            <StatChip key={idx} title={s.title} value={s.value} subtitle={s.subtitle} />
          ))}
        </div>
      )}

      <div className="flex-1">{children}</div>
    </div>
  );
}
