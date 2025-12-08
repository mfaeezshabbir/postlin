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

export default function PostCard({
  id,
  content,
  status,
  createdAt,
  meta,
  actions,
}: PostCardProps) {
  return (
    <article
      role="article"
      aria-labelledby={id ? `post-${id}-title` : undefined}
      className="border border-gray-200 rounded-lg p-4 md:p-5 bg-white shadow-sm hover:shadow-md transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {status && (
                <Badge variant={status === "draft" ? "secondary" : "outline"}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              )}
              {createdAt && (
                <time
                  dateTime={new Date(createdAt).toISOString()}
                  className="text-xs text-gray-500"
                >
                  Created{" "}
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
              {meta}
            </div>
          </div>

          <p
            id={id ? `post-${id}-title` : undefined}
            className="text-sm md:text-base text-gray-700 whitespace-pre-wrap line-clamp-3 mb-3"
            title={typeof content === "string" ? content : undefined}
          >
            {content}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 sm:hidden">
            {meta}
          </div>
        </div>

        <div className="flex items-start justify-end gap-2 ml-0 md:ml-4">
          <div className="flex items-center gap-2" aria-label="post actions">
            {actions}
          </div>
        </div>
      </div>
    </article>
  );
}
