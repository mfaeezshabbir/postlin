"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardContainer from "../components/DashboardContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  XCircle,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
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
        alert("Scheduled post cancelled successfully");
      } else {
        const data = await response.json();
        alert(`Failed to cancel: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      alert("Failed to cancel scheduled post");
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
      alert("Please select both date and time");
      return;
    }

    const newScheduledDateTime = new Date(
      `${newScheduledDate}T${newScheduledTime}`
    );
    const now = new Date();

    if (newScheduledDateTime <= now) {
      alert("Scheduled time must be in the future");
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
      alert(data.message || "Post rescheduled successfully!");
      setShowRescheduleDialog(false);
      await fetchScheduledPosts(); // Refresh list
    } catch (error) {
      console.error("Error rescheduling post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to reschedule post.\n\nError: ${errorMessage}`);
    } finally {
      setRescheduling(false);
    }
  };

  // Calculate stats
  const now = new Date();
  const thisWeek = scheduledPosts.filter((post) => {
    const scheduledDate = new Date(post.scheduledAt);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return scheduledDate <= weekFromNow;
  }).length;

  const thisMonth = scheduledPosts.filter((post) => {
    const scheduledDate = new Date(post.scheduledAt);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return scheduledDate <= monthFromNow;
  }).length;

  return (
    <DashboardContainer
      title="Scheduled Posts"
      description="Posts scheduled for automatic publishing"
      stats={[
        {
          title: "Total Scheduled",
          value: scheduledPosts.length,
          subtitle: "Queued for publishing",
        },
        { title: "This Week", value: thisWeek, subtitle: "In the next 7 days" },
        {
          title: "This Month",
          value: thisMonth,
          subtitle: "In the next 30 days",
        },
      ]}
    >
      <Card className="h-full flex flex-col w-full">
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
          <CardDescription>
            Posts that will be automatically published to LinkedIn at the
            scheduled time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading scheduled posts...</p>
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No scheduled posts
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                No posts are scheduled for publishing yet. Create a draft and
                schedule it to automate your LinkedIn presence.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
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
                      onEdit={() => {}}
                      onDelete={() => confirmCancel(post.id)}
                      loading={{ deleting: cancellingId }}
                    />
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Reschedule dialog (reusable) */}
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
    </DashboardContainer>
  );
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  onCancel: (postId: string) => void;
  isCancelling: boolean;
}

function ScheduledPostCard({
  post,
  onCancel,
  isCancelling,
}: ScheduledPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    let timeUntil = "";
    if (diffDays > 0) {
      timeUntil = `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      timeUntil = `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    } else if (diffMinutes > 0) {
      timeUntil = `in ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    } else {
      timeUntil = "soon";
    }

    return {
      formatted: date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timeUntil,
    };
  };

  const { formatted, timeUntil } = formatDate(post.scheduledAt);
  const preview =
    post.draftText.substring(0, 150) +
    (post.draftText.length > 150 ? "..." : "");

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-300"
            >
              <Clock className="h-3 w-3 mr-1" />
              Scheduled
            </Badge>
            {post.isAIGenerated && (
              <Badge
                variant="outline"
                className="text-purple-600 border-purple-300"
              >
                AI Generated
              </Badge>
            )}
            {post.imageUrl && (
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-300"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Has Image
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
            {preview}
          </p>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.slice(0, 5).map((tag, idx) => (
                <span key={idx} className="text-xs text-blue-600">
                  #{tag}
                </span>
              ))}
              {post.hashtags.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{post.hashtags.length - 5} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-medium text-orange-600">
              <Calendar className="h-3 w-3" />
              {formatted}
            </span>
            <span className="text-gray-600">({timeUntil})</span>
          </div>
        </div>

        <div>
          <PostActions
            id={post.id}
            status="scheduled"
            onDelete={() => onCancel(post.id)}
            loading={{ deleting: isCancelling ? post.id : null }}
          />
        </div>
      </div>
    </div>
  );
}
