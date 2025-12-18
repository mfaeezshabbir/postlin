"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
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
}: Props) {
  const publishing = loading?.publishing === id;
  const deleting = loading?.deleting === id;

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    loading: isLoading,
    variant = "ghost",
    className = "",
  }: any) => (
    <Button
      size="icon"
      variant={variant}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(id);
      }}
      disabled={isLoading || publishing || deleting}
      className={`h-8 w-8 rounded-full ${className}`}
      title={label}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </Button>
  );

  if (status === "published") {
    return (
      <div className="flex items-center gap-1">
        {onView && (
          <ActionButton
            onClick={onView}
            icon={ExternalLink}
            label="View on LinkedIn"
          />
        )}
        {onRevert && (
          <ActionButton
            onClick={onRevert}
            icon={RotateCcw}
            label="Revert to Draft"
            className="text-gray-400 hover:text-white"
          />
        )}
        {onDelete && (
          <ActionButton
            onClick={onDelete}
            icon={Trash2}
            label="Delete"
            loading={deleting}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          />
        )}
      </div>
    );
  }

  if (status === "scheduled") {
    return (
      <div className="flex items-center gap-1">
        <ActionButton
          onClick={onSchedule}
          icon={Calendar}
          label="Reschedule"
          className="text-gray-400 hover:text-white"
        />
        <ActionButton
          onClick={onEdit}
          icon={Pencil}
          label="Edit"
          className="text-gray-400 hover:text-white"
        />
        <ActionButton
          onClick={onDelete}
          icon={Trash2}
          label="Cancel Schedule"
          loading={deleting}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        />
      </div>
    );
  }

  // Default: Draft
  return (
    <div className="flex items-center gap-1">
      <ActionButton
        onClick={onEdit}
        icon={Pencil}
        label="Edit"
        className="text-gray-400 hover:text-white"
      />
      <ActionButton
        onClick={onPublish}
        icon={Send}
        label="Publish Now"
        loading={publishing}
        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
      />
      <ActionButton
        onClick={onDelete}
        icon={Trash2}
        label="Delete"
        loading={deleting}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
      />
    </div>
  );
}
