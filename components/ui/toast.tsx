"use client";

import React from "react";
import { X } from "lucide-react";

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
  onClose?: () => void;
};

export default function Toast({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) {
  const bg =
    variant === "success"
      ? "bg-green-50 border-green-200"
      : variant === "error"
      ? "bg-red-50 border-red-200"
      : variant === "info"
      ? "bg-blue-50 border-blue-200"
      : "bg-white border-gray-200";

  return (
    <div
      className={`max-w-md w-full rounded-lg shadow-lg p-3 border ${bg} flex items-start gap-3`}
    >
      <div className="flex-1">
        {title && <div className="font-medium text-sm">{title}</div>}
        {description && (
          <div className="text-sm text-gray-700 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="opacity-70 hover:opacity-100 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
