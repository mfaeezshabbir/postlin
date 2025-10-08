"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraftModal } from "../components/DraftModal";
import DashboardContainer from "../components/DashboardContainer";
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

      await fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Failed to delete draft. Please try again.");
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

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to publish");
      }

      alert("✅ Successfully published to LinkedIn!");
      await fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error("Error publishing to LinkedIn:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to publish. Please try again.";
      alert(
        `❌ Publishing Error: ${errorMessage}\n\nPlease make sure you have granted posting permissions to the app.`
      );
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
    if (!scheduledDate || !scheduledTime) {
      alert("Please select both date and time");
      return;
    }

    if (!schedulingDraftId) {
      alert("No draft selected");
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      alert("Scheduled time must be in the future");
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to schedule post"
        );
      }

      const data = await response.json();
      alert(data.message || "Post scheduled successfully!");
      setShowScheduleDialog(false);
      await fetchDrafts(); // Refresh to remove scheduled post from drafts
    } catch (error) {
      console.error("Error scheduling post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to schedule post.\n\nError: ${errorMessage}`);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const drafts = draftsData?.drafts || [];
  const stats = draftsData?.stats || { total: 0, aiGenerated: 0, manual: 0 };

  return (
    <>
      <DashboardContainer
        title="Drafts"
        description="Manage your LinkedIn post drafts"
        headerRight={
          <Button onClick={handleCreateDraft}>
            <Plus className="w-4 h-4 mr-2" />
            New Draft
          </Button>
        }
        stats={[
          {
            title: "Total Drafts",
            value: stats.total,
            subtitle: "Saved drafts",
          },
          {
            title: "AI Generated",
            value: stats.aiGenerated,
            subtitle: "Created by AI",
          },
          {
            title: "Manual",
            value: stats.manual,
            subtitle: "Created manually",
          },
        ]}
      >
        <Card className="h-full flex flex-col w-full">
          <CardHeader>
            <CardTitle>Your Drafts</CardTitle>
            <CardDescription>
              All your saved draft posts that are ready to be scheduled or
              published
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {drafts.length === 0 ? (
              <div className="text-center flex flex-col items-center justify-center mx-auto h-full">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No drafts yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  You don't have any drafts yet. Create your first draft to get
                  started with AI-powered LinkedIn content.
                </p>
                <Button onClick={handleCreateDraft}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Draft
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <PostCard
                    key={draft.id}
                    id={draft.id}
                    content={draft.draftText}
                    status="draft"
                    createdAt={draft.createdAt}
                    meta={
                      <span>
                        {draft.draftText.split(/\s+/).filter(Boolean).length}{" "}
                        words
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
                        loading={{
                          publishing: publishingId,
                          deleting: deletingId,
                        }}
                      />
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unified Draft Modal */}
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
      </DashboardContainer>
    </>
  );
}
