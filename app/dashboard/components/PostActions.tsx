"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  // Optional scheduled time (ISO string or Date). Used to show scheduled time when clicking the Scheduled button.
  scheduledAt?: string | Date | null;
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
  scheduledAt,
}: Props) {
  const publishing = loading?.publishing === id;
  const deleting = loading?.deleting === id;

  // Format scheduled time for display. Returns null if no valid time.
  const formatScheduled = (t?: string | Date | null) => {
    if (!t) return null;
    const d = new Date(t as any);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Define which actions should be visible per status
  const DraftActions = () => (
    <>
      <div className="flex flex-wrap flex-row sm:flex-col items-center gap-2">
        <Button
          size="sm"
          onClick={() => onPublish?.(id)}
          disabled={publishing || deleting}
          className="bg-blue-600 hover:bg-blue-700 sm:w-full w-auto flex items-center justify-center"
        >
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 sm:mr-1 animate-spin" />
              <span className="hidden sm:inline">Publishing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Publish</span>
            </>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSchedule?.(id)}
          disabled={publishing || deleting}
          className="sm:w-full w-auto flex items-center justify-center"
        >
          <Calendar className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(id)}
          disabled={publishing || deleting}
          className="sm:w-full bg-green-500 text-white w-auto flex items-center justify-center"
        >
          <Pencil className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete?.(id)}
          disabled={publishing || deleting}
          className="sm:w-full w-auto flex items-center justify-center"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 sm:mr-1 animate-spin" />
              <span className="hidden sm:inline">Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  const ScheduledActions = () => (
    <>
      <div className="flex flex-wrap flex-row sm:flex-col items-center gap-2">
        {/* Show scheduled time inline as a chip/badge. Use formatted time if available, otherwise fall back to 'Scheduled'. */}
        <Badge
          variant="outline"
          title={formatScheduled(scheduledAt) ?? "Scheduled"}
          className="sm:w-full w-auto flex items-center justify-center text-xs"
        >
          <Calendar className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">
            {formatScheduled(scheduledAt) ?? "Scheduled"}
          </span>
          {/* On very small screens show a compact time if available */}
          <span className="sm:hidden">
            {formatScheduled(scheduledAt) ?? "Scheduled"}
          </span>
        </Badge>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSchedule?.(id)}
          disabled={publishing || deleting}
          className="sm:w-full w-auto flex items-center justify-center"
        >
          <Calendar className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Reschedule</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(id)}
          disabled={publishing || deleting}
          className="sm:w-full bg-green-500 text-white w-auto flex items-center justify-center"
        >
          <Pencil className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete?.(id)}
          disabled={publishing || deleting}
          className="sm:w-full w-auto flex items-center justify-center"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 sm:mr-1 animate-spin" />
              <span className="hidden sm:inline">Canceling...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Cancel</span>
            </>
          )}
        </Button>
      </div>
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
