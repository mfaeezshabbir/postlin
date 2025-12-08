"use client";

import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export default function SidebarNav({
  items,
  isCollapsed,
  onClose,
}: {
  items: NavItem[];
  isCollapsed: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={() => {
              if (!isActive) {
                router.push(item.href);
                onClose?.();
              }
            }}
            aria-current={isActive ? "page" : undefined}
            title={isCollapsed ? item.name : undefined}
            className={cn(
              "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer",
              isActive
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-400"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-md flex-shrink-0",
                isCollapsed ? "w-8 h-8" : "w-10 h-10"
              )}
              aria-hidden
            >
              <Icon
                className={cn(
                  isActive ? "text-blue-600" : "text-gray-600",
                  "h-5 w-5"
                )}
              />
            </div>
            {!isCollapsed ? (
              <span className="flex-1 truncate">{item.name}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
