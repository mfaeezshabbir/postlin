"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import { DraftModal } from "./components/DraftModal";

export default function DashboardShell({
  user,
  children,
}: {
  user: any;
  children?: React.ReactNode;
}) {
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftMode, setDraftMode] = useState<"create" | "edit">("create");
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenCreateDraft = () => {
    setDraftMode("create");
    setEditingDraftId(null);
    setShowDraftModal(true);
  };

  const handleAccount = () => {
    // default: navigate to settings
    router.push("/dashboard/settings");
  };

  return (
    <div className="min-h-screen lg:pl-64 bg-red-500">
      <DashboardSidebar
        user={user}
        onAccount={handleAccount}
        onNewDraft={handleOpenCreateDraft}
      />

      <main className="lg:ml-0 p-6 max-w-7xl mx-auto">{children}</main>

      <DraftModal
        open={showDraftModal}
        onOpenChange={setShowDraftModal}
        onDraftSaved={() => {}}
        mode={draftMode}
        draftId={editingDraftId}
      />
    </div>
  );
}
