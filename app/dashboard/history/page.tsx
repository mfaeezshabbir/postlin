"use client";

import { useState, useEffect } from "react";
import { History, Eye, Loader2 } from "lucide-react";
import PostCard from "../components/PostCard";
import PostActions from "../components/PostActions";
import PageHeader from "../components/PageHeader";

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
  const [searchQuery, setSearchQuery] = useState("");

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

      push({
        title: "Reverted",
        description: data.message || "Post reverted to draft successfully!",
        variant: "success",
      });

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

  const posts = postsData?.posts || [];
  const filteredPosts = posts.filter((p) =>
    p.finalText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-8">
      <PageHeader
        title="Published History"
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
              <History className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No published posts
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Your published history will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.finalText}
                status="published"
                createdAt={post.publishedAt}
                meta={
                  <>
                    <span>
                      {post.finalText.split(/\s+/).filter(Boolean).length} words
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
      </div>
    </div>
  );
}
