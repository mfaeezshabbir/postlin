"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DraftModal } from "../components/DraftModal";

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drafts</h1>
          <p className="text-gray-600 mt-1">Manage your LinkedIn post drafts</p>
        </div>
        <Button onClick={handleCreateDraft}>
          <Plus className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Saved drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiGenerated}</div>
            <p className="text-xs text-gray-500 mt-1">Created by AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.manual}</div>
            <p className="text-xs text-gray-500 mt-1">Created manually</p>
          </CardContent>
        </Card>
      </div>

      {/* Drafts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Drafts</CardTitle>
          <CardDescription>
            All your saved draft posts that are ready to be scheduled or
            published
          </CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <div className="text-center py-12">
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
                <div
                  key={draft.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(draft.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3 mb-3">
                        {draft.draftText}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {draft.draftText.split(/\s+/).filter(Boolean).length}{" "}
                          words
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handlePublish(draft.id)}
                        disabled={
                          publishingId === draft.id || deletingId === draft.id
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {publishingId === draft.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              deletingId === draft.id ||
                              publishingId === draft.id
                            }
                          >
                            {deletingId === draft.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenScheduleDialog(draft.id)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(draft.id)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(draft.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
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

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Choose when you want this post to be published to LinkedIn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border rounded-md"
                disabled={scheduling}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={scheduling}
              />
            </div>

            {scheduledDate && scheduledTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Post will be published on:</strong>
                  <br />
                  {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
              disabled={scheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={scheduling || !scheduledDate || !scheduledTime}
            >
              {scheduling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
