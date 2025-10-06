'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, XCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts/scheduled');
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      } else {
        console.error('Failed to fetch scheduled posts');
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!postToCancel) return;

    setCancellingId(postToCancel);
    try {
      const response = await fetch(`/api/posts/schedule?postId=${postToCancel}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from list
        setScheduledPosts(prev => prev.filter(p => p.id !== postToCancel));
        alert('Scheduled post cancelled successfully');
      } else {
        const data = await response.json();
        alert(`Failed to cancel: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      alert('Failed to cancel scheduled post');
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

  // Calculate stats
  const now = new Date();
  const thisWeek = scheduledPosts.filter(post => {
    const scheduledDate = new Date(post.scheduledAt);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return scheduledDate <= weekFromNow;
  }).length;

  const thisMonth = scheduledPosts.filter(post => {
    const scheduledDate = new Date(post.scheduledAt);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return scheduledDate <= monthFromNow;
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scheduled Posts</h1>
        <p className="text-gray-600 mt-1">Posts scheduled for automatic publishing</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPosts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Queued for publishing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeek}</div>
            <p className="text-xs text-gray-500 mt-1">In the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">In the next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled posts list */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
          <CardDescription>
            Posts that will be automatically published to LinkedIn at the scheduled time
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                No posts are scheduled for publishing yet. Create a draft and schedule it to automate your LinkedIn presence.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <ScheduledPostCard 
                  key={post.id} 
                  post={post} 
                  onCancel={confirmCancel}
                  isCancelling={cancellingId === post.id}
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
                'Cancel Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  onCancel: (postId: string) => void;
  isCancelling: boolean;
}

function ScheduledPostCard({ post, onCancel, isCancelling }: ScheduledPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    let timeUntil = '';
    if (diffDays > 0) {
      timeUntil = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeUntil = `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      timeUntil = `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      timeUntil = 'soon';
    }

    return {
      formatted: date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timeUntil,
    };
  };

  const { formatted, timeUntil } = formatDate(post.scheduledAt);
  const preview = post.draftText.substring(0, 150) + (post.draftText.length > 150 ? '...' : '');

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Clock className="h-3 w-3 mr-1" />
              Scheduled
            </Badge>
            {post.isAIGenerated && (
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                AI Generated
              </Badge>
            )}
            {post.imageUrl && (
              <Badge variant="outline" className="text-blue-600 border-blue-300">
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
            <span className="text-gray-600">
              ({timeUntil})
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onCancel(post.id)}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
