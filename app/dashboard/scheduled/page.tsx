"use client";

import { useState, useEffect } from "react";
import { Clock, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostCard from "../components/PostCard";
import PostActions from "../components/PostActions";
import ScheduleDialog from "../components/ScheduleDialog";
import PageHeader from "../components/PageHeader";

interface ScheduledPost {
  id: string;
  draftText: string;
  scheduledAt: string;
  imageUrl?: string;
  hashtags: string[];
  isAIGenerated: boolean;
  createdAt: string;
}

export default function ScheduledPage() {
  const { push } = require("@/components/ToastProvider").useToasts?.() || {
    push: (t: any) => "",
  };
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [postToCancel, setPostToCancel] = useState<string | null>(null);

  // Reschedule states
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [postToReschedule, setPostToReschedule] = useState<string | null>(null);
  const [newScheduledDate, setNewScheduledDate] = useState("");
  const [newScheduledTime, setNewScheduledTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/posts/scheduled");
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      } else {
        console.error("Failed to fetch scheduled posts");
      }
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!postToCancel) return;

    setCancellingId(postToCancel);
    try {
      const response = await fetch(
        `/api/posts/schedule?postId=${postToCancel}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove from list
        setScheduledPosts((prev) => prev.filter((p) => p.id !== postToCancel));
        push({
          title: "Cancelled",
          description: "Scheduled post cancelled successfully",
          variant: "success",
        });
      } else {
        const data = await response.json();
        push({
          title: "Cancel Failed",
          description: `Failed to cancel: ${data.error || "Unknown error"}`,
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      push({
        title: "Cancel Failed",
        description: "Failed to cancel scheduled post",
        variant: "error",
      });
    } finally {
      setCancellingId(null);
      setShowCancelDialog(false);
      setPostToCancel(null);
    }
  };

  const confirmCancel = (postId: string) => {
    setPostToCancel(postId);
    setShowCancelDialog(true);
  };

  const handleOpenReschedule = (postId: string) => {
    const post = scheduledPosts.find((p) => p.id === postId);
    if (post) {
      // Pre-fill with current scheduled time
      const currentDate = new Date(post.scheduledAt);
      const dateStr = currentDate.toISOString().split("T")[0];
      const timeStr = currentDate.toTimeString().slice(0, 5);
      setNewScheduledDate(dateStr);
      setNewScheduledTime(timeStr);
      setPostToReschedule(postId);
      setShowRescheduleDialog(true);
    }
  };

  const handleReschedule = async () => {
    if (!postToReschedule || !newScheduledDate || !newScheduledTime) {
      push({
        title: "Reschedule",
        description: "Please select both date and time",
        variant: "info",
      });
      return;
    }

    const newScheduledDateTime = new Date(
      `${newScheduledDate}T${newScheduledTime}`
    );
    const now = new Date();

    if (newScheduledDateTime <= now) {
      push({
        title: "Reschedule",
        description: "Scheduled time must be in the future",
        variant: "error",
      });
      return;
    }

    setRescheduling(true);
    try {
      const response = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postToReschedule,
          scheduledAt: newScheduledDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to reschedule post"
        );
      }

      const data = await response.json();
      push({
        title: "Rescheduled",
        description: data.message || "Post rescheduled successfully!",
        variant: "success",
      });
      setShowRescheduleDialog(false);
      await fetchScheduledPosts(); // Refresh list
    } catch (error) {
      console.error("Error rescheduling post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      push({
        title: "Reschedule Error",
        description: `Failed to reschedule post. Error: ${errorMessage}`,
        variant: "error",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const filteredPosts = scheduledPosts.filter((p) =>
    p.draftText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-8">
      <PageHeader
        title="Scheduled"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No scheduled posts
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Posts scheduled for future publication will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.draftText}
                status="scheduled"
                createdAt={post.createdAt}
                meta={<span>{post.hashtags?.length || 0} hashtags</span>}
                actions={
                  <PostActions
                    id={post.id}
                    status="scheduled"
                    onSchedule={() => handleOpenReschedule(post.id)}
                    scheduledAt={post.scheduledAt}
                    onEdit={() => {}}
                    onDelete={() => confirmCancel(post.id)}
                    loading={{ deleting: cancellingId }}
                  />
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Scheduled Post?</DialogTitle>
            <DialogDescription>
              This will cancel the scheduled post and move it back to drafts.
              You can reschedule it later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={!!cancellingId}
            >
              Keep Schedule
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSchedule}
              disabled={!!cancellingId}
            >
              {cancellingId ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <ScheduleDialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        scheduledDate={newScheduledDate}
        setScheduledDate={setNewScheduledDate}
        scheduledTime={newScheduledTime}
        setScheduledTime={setNewScheduledTime}
        scheduling={rescheduling}
        onSchedule={handleReschedule}
      />
    </div>
  );
}
