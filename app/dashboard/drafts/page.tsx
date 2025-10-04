import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DraftsPage() {
  // Placeholder - will fetch from database later
  const drafts: any[] = [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drafts</h1>
          <p className="text-gray-600 mt-1">Manage your draft posts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Draft
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Saved drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Created by AI</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Created manually</p>
          </CardContent>
        </Card>
      </div>

      {/* Drafts list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Drafts</CardTitle>
          <CardDescription>
            All your saved draft posts that are ready to be scheduled or published
          </CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                You don't have any drafts yet. Create your first draft to get started with AI-powered LinkedIn content.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Draft
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <DraftCard key={draft.id} draft={draft} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DraftCard({ draft }: { draft: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {draft.title || 'Untitled Draft'}
            </h3>
            <Badge variant="secondary">Draft</Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {draft.content}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Created {new Date(draft.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{draft.words || 0} words</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
