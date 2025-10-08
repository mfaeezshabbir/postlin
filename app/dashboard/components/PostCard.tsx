"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

type PostCardProps = {
  id?: string;
  content: string;
  status?: string;
  createdAt?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

export default function PostCard({ id, content, status, createdAt, meta, actions }: PostCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {status && (
              <Badge variant={status === "draft" ? "secondary" : "outline"}>
                {status[0].toUpperCase() + status.slice(1)}
              </Badge>
            )}
            {createdAt && (
              <span className="text-xs text-gray-500">
                Created {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3 mb-3">
            {content}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">{meta}</div>
        </div>

        <div className="flex items-center gap-2 ml-4">{actions}</div>
      </div>
    </div>
  );
}
