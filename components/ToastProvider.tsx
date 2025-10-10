"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "@/components/ui/toast";

type ToastType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
};

type ToastContextType = {
  push: (t: Omit<ToastType, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const push = useCallback((t: Omit<ToastType, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: ToastType = { id, ...t };
    setToasts((s) => [toast, ...s]);

    // Auto dismiss after 5s
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 5000);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}

      <div className="fixed right-4 bottom-6 z-[60] flex flex-col gap-3">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
            onClose={() => dismiss(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
