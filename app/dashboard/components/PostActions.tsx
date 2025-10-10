"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  MoreVertical,
  Calendar,
  Pencil,
  Trash2,
  Send,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

type Props = {
  id: string;
  onPublish?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onView?: (id: string) => void;
  onRevert?: (id: string) => void;
  status?: "draft" | "scheduled" | "published" | string;
  loading?: { publishing?: string | null; deleting?: string | null };
};

export default function PostActions({
  id,
  onPublish,
  onEdit,
  onDelete,
  onSchedule,
  onView,
  onRevert,
  status,
  loading,
}: Props) {
  const publishing = loading?.publishing === id;
  const deleting = loading?.deleting === id;

  // Define which actions should be visible per status
  const DraftActions = () => (
    <>
      <Button
        size="sm"
        onClick={() => onPublish?.(id)}
        disabled={publishing || deleting}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {publishing ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-1" />
            Publish
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={deleting || publishing}>
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSchedule?.(id)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(id)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(id)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const ScheduledActions = () => (
    <>
      <Button size="sm" variant="outline" disabled className="text-xs">
        SCHEDULED
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={deleting || publishing}>
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSchedule?.(id)}>
            <Calendar className="w-4 h-4 mr-2" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(id)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(id)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const PublishedActions = () => (
    <>
      <div className="flex flex-wrap flex-row sm:flex-col items-center gap-2">
        {onView && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onView?.(id)}
            disabled={deleting || publishing}
            title="View published post on LinkedIn"
            aria-label="View published post on LinkedIn"
            className="w-full sm:w-auto text-gray-700"
          >
            <ExternalLink className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">View on LinkedIn</span>
          </Button>
        )}

        {onRevert && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRevert?.(id)}
            disabled={deleting || publishing}
            className="w-full sm:w-auto text-gray-100"
            title="Revert post to draft"
            aria-label="Revert post to draft"
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Revert to Draft</span>
          </Button>
        )}
      </div>
    </>
  );

  // Choose component by status
  if (status === "published") return <PublishedActions />;
  if (status === "scheduled") return <ScheduledActions />;
  return <DraftActions />;
}
