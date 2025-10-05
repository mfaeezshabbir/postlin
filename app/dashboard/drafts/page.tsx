'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Loader2, MoreVertical, Pencil, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewDraftModal } from '../components/NewDraftModal';
import { EditDraftModal } from '../components/EditDraftModal';

interface Draft {
  id: string;
  draftText: string;
  createdAt: string;
  status: string;
}

interface DraftsData {
  drafts: Draft[];
  stats: {
    total: number;
    aiGenerated: number;
    manual: number;
  };
}

export default function DraftsPage() {
  const [draftsData, setDraftsData] = useState<DraftsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewDraftModal, setShowNewDraftModal] = useState(false);
  const [showEditDraftModal, setShowEditDraftModal] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts');
      if (!response.ok) throw new Error('Failed to fetch drafts');
      
      const data = await response.json();
      setDraftsData(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleEdit = (draftId: string) => {
    setEditingDraftId(draftId);
    setShowEditDraftModal(true);
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    setDeletingId(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete draft');

      await fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (draftId: string) => {
    if (!confirm('Are you sure you want to publish this post to LinkedIn?')) return;

    setPublishingId(draftId);
    try {
      const response = await fetch('/api/publish/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to publish');
      }

      alert('✅ Successfully published to LinkedIn!');
      await fetchDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error publishing to LinkedIn:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish. Please try again.';
      alert(`❌ Publishing Error: ${errorMessage}\n\nPlease make sure you have granted posting permissions to the app.`);
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const drafts = draftsData?.drafts || [];
  const stats = draftsData?.stats || { total: 0, aiGenerated: 0, manual: 0 };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drafts</h1>
          <p className="text-gray-600 mt-1">Manage your LinkedIn post drafts</p>
        </div>
        <Button onClick={() => setShowNewDraftModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Saved drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiGenerated}</div>
            <p className="text-xs text-gray-500 mt-1">Created by AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.manual}</div>
            <p className="text-xs text-gray-500 mt-1">Created manually</p>
          </CardContent>
        </Card>
      </div>

      {/* Drafts List */}
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
              <Button onClick={() => setShowNewDraftModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Draft
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div 
                  key={draft.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span className="text-xs text-gray-500">
                          Created {new Date(draft.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3 mb-3">
                        {draft.draftText}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{draft.draftText.split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        size="sm"
                        onClick={() => handlePublish(draft.id)}
                        disabled={publishingId === draft.id || deletingId === draft.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {publishingId === draft.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deletingId === draft.id || publishingId === draft.id}>
                            {deletingId === draft.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(draft.id)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(draft.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Draft Modal */}
      <NewDraftModal
        open={showNewDraftModal}
        onOpenChange={setShowNewDraftModal}
        onDraftCreated={fetchDrafts}
      />

      {/* Edit Draft Modal */}
      <EditDraftModal
        open={showEditDraftModal}
        onOpenChange={setShowEditDraftModal}
        onDraftUpdated={fetchDrafts}
        draftId={editingDraftId}
      />
    </div>
  );
}
