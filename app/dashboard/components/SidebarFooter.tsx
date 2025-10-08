"use client";

import { useRouter } from "next/navigation";

export default function SidebarFooter({
  isCollapsed,
  onClose,
  onAccount,
  onNewDraft,
}: {
  isCollapsed?: boolean;
  onClose?: () => void;
  onAccount?: () => void;
  onNewDraft?: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="mt-auto p-3 border-t border-gray-100"
      data-collapsed={isCollapsed}
    >
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
  );
}
