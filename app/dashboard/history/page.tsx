import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, Eye, Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';

export default function HistoryPage() {
  // Placeholder - will fetch from database later
  const publishedPosts: any[] = [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">History</h1>
        <p className="text-gray-600 mt-1">Your published LinkedIn posts and their performance</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Published to LinkedIn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +0% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-gray-500 mt-1">Avg. engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Best Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-gray-500 mt-1">Most impressions</p>
          </CardContent>
        </Card>
      </div>

      {/* Published posts list */}
      <Card>
        <CardHeader>
          <CardTitle>Published Posts</CardTitle>
          <CardDescription>
            Track the performance of your LinkedIn posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publishedPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No published posts yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Nothing published yet. Once you publish your first post, you'll see it here with performance metrics.
              </p>
              <Button>
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedPosts.map((post) => (
                <PublishedPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PublishedPostCard({ post }: { post: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {post.title || 'Untitled Post'}
            </h3>
            <Badge variant="outline" className="text-green-600 border-green-300">
              Published
            </Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {post.content}
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500 mb-3">
            <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
          
          {/* Analytics */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Eye className="h-4 w-4" />
              <span>{post.impressions || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Heart className="h-4 w-4" />
              <span>{post.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Share2 className="h-4 w-4" />
              <span>{post.shares || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={post.linkedInUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on LinkedIn
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
