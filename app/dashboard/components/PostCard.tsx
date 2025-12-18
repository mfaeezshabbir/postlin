"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, MoreHorizontal } from "lucide-react";

type PostCardProps = {
  id?: string;
  content: string;
  status?: string;
  createdAt?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string; // Optional title if we start supporting it
};

export default function PostCard({
  id,
  content,
  status,
  createdAt,
  meta,
  actions,
  title,
}: PostCardProps) {
  // Infer title from content if not provided
  const displayTitle =
    title ||
    content.split("\n")[0].slice(0, 50) + (content.length > 50 ? "..." : "");
  const displayContent =
    content.length > displayTitle.length
      ? content.slice(displayTitle.length).trim()
      : content;

  // Status config
  const statusConfig: Record<
    string,
    { color: string; label: string; bg: string }
  > = {
    draft: { color: "text-blue-400", label: "Draft", bg: "bg-blue-500/10" },
    scheduled: {
      color: "text-orange-400",
      label: "Scheduled",
      bg: "bg-orange-500/10",
    },
    published: {
      color: "text-green-400",
      label: "Published",
      bg: "bg-green-500/10",
    },
  };

  const normalizedStatus = status?.toLowerCase() || "draft";
  const config = statusConfig[normalizedStatus] || statusConfig.draft;

  return (
    <article className="group relative flex flex-col bg-card hover:bg-card/90 border border-white/5 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-black/20 hover:border-white/10">
      {/* Header: Status & Options */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2",
            config.bg,
            config.color
          )}
        >
          <div className={cn("w-1.5 h-1.5 rounded-full bg-current")} />
          {status === "scheduled" && createdAt ? (
            <span>
              {new Date(createdAt).toLocaleString("en-US", {
                weekday: "short",
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
          ) : (
            <span>{config.label}</span>
          )}
        </div>

        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mb-6 space-y-3">
        <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">
          {displayTitle}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
          {displayContent || "No additional text..."}
        </p>
      </div>

      {/* Footer: Meta & Actions */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="text-xs text-gray-500 font-medium">
          {status === "published" ? "Posted 2h ago" : "Edited recently"}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* We inject the actions here. They need to be styled as icons. 
               The parent passes buttons, so we might need to style them globally or expect them to be icon buttons.
           */}
          {actions}
        </div>
      </div>
    </article>
  );
}
