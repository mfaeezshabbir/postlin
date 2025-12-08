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

  const items = [
    { label: "Docs", path: "/docs", handler: "account" as const },
    { label: "Support", path: "/support", handler: "newDraft" as const },
    { label: "Terms", path: "/terms" },
    { label: "Policy", path: "/privacy" },
  ];

  return (
    <div
      className="mt-auto p-3 border-t border-gray-100"
      data-collapsed={isCollapsed}
    >
      <div className="flex items-center justify-end gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            className="text-sm text-gray-700"
            onClick={() => {
              onClose && onClose();

              if (item.handler === "account") {
                if (onAccount) onAccount();
                else router.push(item.path);
              } else if (item.handler === "newDraft") {
                if (onNewDraft) onNewDraft();
                else router.push(item.path);
              } else {
                router.push(item.path);
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
