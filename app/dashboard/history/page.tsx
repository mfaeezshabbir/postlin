'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, Eye, Heart, MessageCircle, Share2, ExternalLink, Loader2, RotateCcw } from 'lucide-react';

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
  const [postsData, setPostsData] = useState<PublishedPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revertingPostId, setRevertingPostId] = useState<string | null>(null);

  const fetchPublishedPosts = async () => {
    try {
      const response = await fetch('/api/posts/published');
      if (!response.ok) throw new Error('Failed to fetch published posts');
      
      const data = await response.json();
      setPostsData(data);
    } catch (error) {
      console.error('Error fetching published posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToDraft = async (postId: string) => {
    if (!confirm('Are you sure you want to revert this post to draft? This will clear the LinkedIn post link.')) {
      return;
    }

    setRevertingPostId(postId);

    try {
      const response = await fetch('/api/posts/revert-to-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to revert post to draft');
      }

      const data = await response.json();

      // Show success message
      alert(data.message || 'Post reverted to draft successfully!');

      // Refresh the published posts list
      await fetchPublishedPosts();
    } catch (error) {
      console.error('Error reverting post:', error);
      alert('Failed to revert post to draft. Please try again.');
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">History</h1>
          <p className="text-gray-600 mt-1">View your published LinkedIn posts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">Published this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-gray-500 mt-1">Engagement metrics</p>
          </CardContent>
        </Card>
      </div>

      {/* Published Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Published Posts</CardTitle>
          <CardDescription>
            All your posts that have been published to LinkedIn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No published posts yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Once you publish drafts to LinkedIn, they'll appear here with engagement metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Published
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3 mb-3">
                        {post.finalText}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{post.finalText.split(/\s+/).filter(Boolean).length} words</span>
                        {/* Placeholder for analytics - will be fetched from LinkedIn API later */}
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          -
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          -
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          -
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {post.linkedInPostId && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // LinkedIn post URL format
                            const postUrl = `https://www.linkedin.com/feed/update/${post.linkedInPostId}`;
                            window.open(postUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View on LinkedIn
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevertToDraft(post.id)}
                        disabled={revertingPostId === post.id}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        {revertingPostId === post.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Reverting...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Revert to Draft
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
