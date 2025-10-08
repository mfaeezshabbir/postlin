"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SidebarProfile from "./SidebarProfile";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";

export default function SidebarMobile({
  items,
  user,
  onClose,
  onAccount,
  onNewDraft,
}: {
  items: any[];
  user: any;
  onClose?: () => void;
  onAccount?: () => void;
  onNewDraft?: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full">
      <SidebarProfile user={user} />
      <SidebarNav items={items} isCollapsed={false} />

      <div className="mt-auto p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            className="text-sm text-gray-700 w-full text-left"
            onClick={() => {
              onClose && onClose();
              if (onAccount) onAccount();
              else router.push("/docs");
            }}
          >
            Docs
          </button>
          <button
            className="text-sm text-gray-700"
            onClick={() => {
              onClose && onClose();
              if (onNewDraft) onNewDraft();
              else router.push("/support");
            }}
          >
            Support
          </button>
        </div>
      </div>
    </div>
  );
}
