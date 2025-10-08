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
      <SidebarNav items={items} isCollapsed={false} />
      <SidebarProfile user={user} />
      <SidebarFooter
        isCollapsed={false}
        onClose={onClose}
        onAccount={onAccount}
        onNewDraft={onNewDraft}
      />
    </div>
  );
}
