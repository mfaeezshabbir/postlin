"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Loader2,
  Sparkles,
  LayoutGrid,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraftModal } from "../components/DraftModal";
import ScheduleDialog from "../components/ScheduleDialog";
import PostCard from "../components/PostCard";
import PostActions from "../components/PostActions";

interface Draft {
  id: string;
  draftText: string;
  createdAt: string;
  status: string;
}

interface DraftsData {
  drafts: Draft[];
  stats: {
    total: number;
    aiGenerated: number;
    manual: number;
  };
}

export default function DraftsPage() {
  const { push } = require("@/components/ToastProvider").useToasts?.() || {
    push: (t: any) => "",
  };
  const [draftsData, setDraftsData] = useState<DraftsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftModalMode, setDraftModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Scheduling states
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [schedulingDraftId, setSchedulingDraftId] = useState<string | null>(
    null
  );
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
      if (!response.ok) throw new Error("Failed to fetch drafts");
      const data = await response.json();
      setDraftsData(data);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleCreateDraft = () => {
    setDraftModalMode("create");
    setEditingDraftId(null);
    setShowDraftModal(true);
  };

  const handleEdit = (draftId: string) => {
    setDraftModalMode("edit");
    setEditingDraftId(draftId);
    setShowDraftModal(true);
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    setDeletingId(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete draft");
      await fetchDrafts();
    } catch (error) {
      console.error("Error deleting draft:", error);
      push({
        title: "Failed",
        description: "Failed to delete draft.",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (draftId: string) => {
    if (!confirm("Are you sure you want to publish this post to LinkedIn?"))
      return;
    setPublishingId(draftId);
    try {
      const response = await fetch("/api/publish/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.details || data.error || "Failed to publish");
      push({
        title: "Published",
        description: "Successfully published!",
        variant: "success",
      });
      await fetchDrafts();
    } catch (error) {
      push({
        title: "Publishing Error",
        description: "Failed to publish.",
        variant: "error",
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleOpenScheduleDialog = (draftId: string) => {
    setSchedulingDraftId(draftId);
    setScheduledDate("");
    setScheduledTime("");
    setShowScheduleDialog(true);
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime || !schedulingDraftId) return;
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      push({
        title: "Schedule",
        description: "Time must be in future",
        variant: "error",
      });
      return;
    }
    setScheduling(true);
    try {
      const response = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: schedulingDraftId,
          scheduledAt: scheduledDateTime.toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to schedule");
      push({
        title: "Scheduled",
        description: "Post scheduled!",
        variant: "success",
      });
      setShowScheduleDialog(false);
      await fetchDrafts();
    } catch (error) {
      push({
        title: "Schedule Error",
        description: "Failed to schedule.",
        variant: "error",
      });
    } finally {
      setScheduling(false);
    }
  };

  const drafts = draftsData?.drafts || [];
  const filteredDrafts = drafts.filter((d) =>
    d.draftText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">My Drafts</h1>

        <div className="flex-1 max-w-xl mx-auto w-full">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
            </div>
            <Input
              placeholder="Ask AI to find drafts or generate ideas..."
              className="pl-10 bg-card border-white/10 text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary/50 rounded-xl h-12 transition-all"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-white hover:bg-white/5 bg-[#1A1F37] border border-white/5 h-10 w-10 rounded-lg"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-white hover:bg-white/5 bg-[#1A1F37] border border-white/5 h-10 w-10 rounded-lg"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading drafts...
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No drafts found
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create a new draft to see it here.
            </p>
            <Button
              onClick={handleCreateDraft}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Draft
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDrafts.map((draft) => (
              <PostCard
                key={draft.id}
                id={draft.id}
                content={draft.draftText}
                status="draft"
                createdAt={draft.createdAt}
                meta={
                  <span>
                    {draft.draftText.split(/\s+/).filter(Boolean).length} words
                  </span>
                }
                actions={
                  <PostActions
                    id={draft.id}
                    status="draft"
                    onPublish={handlePublish}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSchedule={handleOpenScheduleDialog}
                    loading={{ publishing: publishingId, deleting: deletingId }}
                  />
                }
              />
            ))}
          </div>
        )}
      </div>

      <DraftModal
        open={showDraftModal}
        onOpenChange={setShowDraftModal}
        onDraftSaved={fetchDrafts}
        mode={draftModalMode}
        draftId={editingDraftId}
      />

      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        scheduledDate={scheduledDate}
        setScheduledDate={setScheduledDate}
        scheduledTime={scheduledTime}
        setScheduledTime={setScheduledTime}
        scheduling={scheduling}
        onSchedule={handleSchedule}
      />
    </div>
  );
}
