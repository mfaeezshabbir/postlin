import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MoreVertical, XCircle } from 'lucide-react';

export default function ScheduledPage() {
  // Placeholder - will fetch from database later
  const scheduledPosts: any[] = [];

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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">In the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
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
          {scheduledPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                No posts are scheduled for publishing yet. Create a draft and schedule it to automate your LinkedIn presence.
              </p>
              <Button>
                Schedule a Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <ScheduledPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduledPostCard({ post }: { post: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {post.title || 'Untitled Post'}
            </h3>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Clock className="h-3 w-3 mr-1" />
              Scheduled
            </Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {post.content}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.scheduledFor).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="sm" className="text-red-600">
            <XCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
