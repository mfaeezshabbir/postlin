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
import { History, Eye, Loader2 } from "lucide-react";
import PostCard from "../components/PostCard";
import PostActions from "../components/PostActions";

interface PublishedPost {
  id: string;
  finalText: string;
  publishedAt: string;
  linkedInPostId: string | null;
}

interface PublishedPostsData {
  posts: PublishedPost[];
  stats: {
    total: number;
    thisMonth: number;
  };
}

export default function HistoryPage() {
  const { push } = require("@/components/ToastProvider").useToasts?.() || {
    push: (t: any) => "",
  };
  const [postsData, setPostsData] = useState<PublishedPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revertingPostId, setRevertingPostId] = useState<string | null>(null);

  const fetchPublishedPosts = async () => {
    try {
      const response = await fetch("/api/posts/published");
      if (!response.ok) throw new Error("Failed to fetch published posts");

      const data = await response.json();
      setPostsData(data);
    } catch (error) {
      console.error("Error fetching published posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToDraft = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to revert this post to draft? This will clear the LinkedIn post link."
      )
    ) {
      return;
    }

    setRevertingPostId(postId);

    try {
      const response = await fetch("/api/posts/revert-to-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Failed to revert post to draft");
      }

      const data = await response.json();

      // Show success message
      push({
        title: "Reverted",
        description: data.message || "Post reverted to draft successfully!",
        variant: "success",
      });

      // Refresh the published posts list
      await fetchPublishedPosts();
    } catch (error) {
      console.error("Error reverting post:", error);
      push({
        title: "Failed",
        description: "Failed to revert post to draft. Please try again.",
        variant: "error",
      });
    } finally {
      setRevertingPostId(null);
    }
  };

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const posts = postsData?.posts || [];
  const stats = postsData?.stats || { total: 0, thisMonth: 0 };

  return (
    <DashboardContainer
      title="History"
      description="View your published LinkedIn posts"
      stats={[
        { title: "Total Posts", value: stats.total },
        {
          title: "This Month",
          value: stats.thisMonth,
        },
        {
          title: "Analytics",
          value: "Coming Soon",
        },
      ]}
    >
      <Card className="h-full flex flex-col w-full">
        <CardHeader>
          <CardTitle>Published Posts</CardTitle>
          <CardDescription>
            All your posts that have been published to LinkedIn
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-300px)]">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No published posts yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Once you publish drafts to LinkedIn, they'll appear here with
                engagement metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  content={post.finalText}
                  status="published"
                  createdAt={post.publishedAt}
                  meta={
                    <>
                      <span>
                        {post.finalText.split(/\s+/).filter(Boolean).length}{" "}
                        words
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> -
                      </span>
                    </>
                  }
                  actions={
                    <PostActions
                      id={post.id}
                      status="published"
                      onView={() => {
                        const linkedId = post.linkedInPostId;
                        if (!linkedId) {
                          alert("No LinkedIn link available for this post.");
                          return;
                        }
                        const url = linkedId.startsWith("http")
                          ? linkedId
                          : `https://www.linkedin.com/feed/update/${post.linkedInPostId}`;
                        window.open(url, "_blank");
                      }}
                      onRevert={() => handleRevertToDraft(post.id)}
                      loading={{ deleting: revertingPostId }}
                    />
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardContainer>
  );
}
