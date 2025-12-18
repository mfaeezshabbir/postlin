"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Loader2,
  Sparkles,
  LayoutGrid,
  Bell,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DraftModal } from "../components/DraftModal";
import ScheduleDialog from "../components/ScheduleDialog";
import PostCard from "../components/PostCard";
import PostActions from "../components/PostActions";

interface Post {
  id: string;
  draftText: string;
  status: string;
  createdAt: string;
  scheduledAt?: string;
  publishedAt?: string;
}

interface PostsData {
  posts: Post[];
}

export default function AllPostsPage() {
  const { push } = require("@/components/ToastProvider").useToasts?.() || {
    push: (t: any) => "",
  };
  const [posts, setPosts] = useState<Post[]>([]);
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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "SCHEDULED" | "PUBLISHED"
  >(() => {
    const status = searchParams.get("status");
    if (status && ["DRAFT", "SCHEDULED", "PUBLISHED"].includes(status)) {
      return status as "DRAFT" | "SCHEDULED" | "PUBLISHED";
    }
    return "ALL";
  });

  // Sync state with URL when it changes
  useEffect(() => {
    const status = searchParams.get("status");
    if (status && ["DRAFT", "SCHEDULED", "PUBLISHED"].includes(status)) {
      setStatusFilter(status as any);
    } else {
      setStatusFilter("ALL");
    }
  }, [searchParams]);

  const handleFilterChange = (
    value: "ALL" | "DRAFT" | "SCHEDULED" | "PUBLISHED"
  ) => {
    setStatusFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`/dashboard/posts?${params.toString()}`);
  };

  const [stats, setStats] = useState({ drafts: 0, scheduled: 0, published: 0 });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "ALL"
          ? "/api/posts"
          : `/api/posts?status=${statusFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [statusFilter]);

  const handleCreatePost = () => {
    setDraftModalMode("create");
    setEditingDraftId(null);
    setShowDraftModal(true);
  };

  const handleEdit = (postId: string) => {
    setDraftModalMode("edit");
    setEditingDraftId(postId);
    setShowDraftModal(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingId(postId);
    try {
      // Assuming generic delete endpoint works for all posts or defaulting to drafts logic
      // Ideally we should have /api/posts/[id] but /api/drafts/[id] usually handles deletion of the post record
      const response = await fetch(`/api/drafts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      push({
        title: "Failed",
        description: "Failed to delete post.",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (postId: string) => {
    if (!confirm("Are you sure you want to publish this post to LinkedIn?"))
      return;
    setPublishingId(postId);
    try {
      const response = await fetch("/api/publish/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: postId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.details || data.error || "Failed to publish");
      push({
        title: "Published",
        description: "Successfully published!",
        variant: "success",
      });
      fetchPosts();
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

  const handleOpenScheduleDialog = (postId: string) => {
    setSchedulingDraftId(postId);
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
      fetchPosts();
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

  const filteredPosts = posts.filter((p) =>
    (p.draftText || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
        <div className="flex-1 w-full flex gap-3">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
            </div>
            <Input
              placeholder="Search posts..."
              className="pl-10 bg-card border-white/10 text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl h-12 transition-all"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              {
                label: "#All Posts",
                value: "ALL",
                count: stats.drafts + stats.scheduled + stats.published,
              },
              {
                label: "#Drafts",
                value: "DRAFT",
                count: stats.drafts,
              },
              {
                label: "#Scheduled",
                value: "SCHEDULED",
                count: stats.scheduled,
              },
              {
                label: "#Published",
                value: "PUBLISHED",
                count: stats.published,
              },
            ].map((filter) => (
              <Button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value as any)}
                variant="ghost"
                className={`h-10 rounded-lg px-4 border ${
                  statusFilter === filter.value
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-[#1A1F37] text-gray-400 border-white/5 hover:bg-white/5 hover:text-gray-300"
                }`}
              >
                {statusFilter === filter.value && (
                  <Check className="mr-2 h-3 w-3" />
                )}
                {filter.label}
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    statusFilter === filter.value
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  {filter.count}
                </span>
              </Button>
            ))}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-white hover:bg-white/5 bg-[#1A1F37] border border-white/5 h-10 w-10 rounded-lg"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-[#1e2542] border-white/10 text-gray-300"
            >
              <DropdownMenuLabel className="font-normal text-xs text-gray-400 uppercase tracking-wider">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <div className="py-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <Bell className="h-8 w-8 opacity-20" />
                <p>No new notifications</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create a new post to get started or try a different filter.
            </p>
            <Button
              onClick={handleCreatePost}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.draftText || ""}
                status={post.status}
                createdAt={
                  post.scheduledAt || post.publishedAt || post.createdAt
                }
                meta={
                  <span>
                    {(post.draftText || "").split(/\s+/).filter(Boolean).length}{" "}
                    words
                  </span>
                }
                actions={
                  <PostActions
                    id={post.id}
                    status={post.status.toLowerCase() as any}
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
        onDraftSaved={fetchPosts}
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
