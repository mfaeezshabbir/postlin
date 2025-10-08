"use client";

import { cn } from "@/lib/utils";

export default function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="mt-auto p-3 border-t border-gray-100">
      <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-600", isCollapsed ? "justify-center" : "") }>
        <a href="/docs" className="hover:text-gray-900" title="Docs">Docs</a>
        {!isCollapsed && <span className="text-xs text-gray-400">•</span>}
        {!isCollapsed && <a href="/support" className="hover:text-gray-900">Support</a>}
      </div>
    </div>
  );
}
