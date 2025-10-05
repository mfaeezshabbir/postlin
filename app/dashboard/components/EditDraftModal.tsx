'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftUpdated: () => void;
  draftId: string | null;
}

export function EditDraftModal({ open, onOpenChange, onDraftUpdated, draftId }: EditDraftModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(false);
  const [content, setContent] = useState('');

  // Fetch draft when modal opens
  useEffect(() => {
    if (open && draftId) {
      fetchDraft();
    }
  }, [open, draftId]);

  const fetchDraft = async () => {
    if (!draftId) return;

    setFetchingDraft(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`);
      if (!response.ok) throw new Error('Failed to fetch draft');
      
      const data = await response.json();
      setContent(data.draft.draftText);
    } catch (error) {
      console.error('Error fetching draft:', error);
      alert('Failed to load draft. Please try again.');
      onOpenChange(false);
    } finally {
      setFetchingDraft(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    if (!draftId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to update draft');

      onDraftUpdated();
      onOpenChange(false);
      setContent('');
    } catch (error) {
      console.error('Error updating draft:', error);
      alert('Failed to update draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setContent('');
    onOpenChange(false);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Draft</DialogTitle>
          <DialogDescription>
            Make changes to your draft post. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fetchingDraft ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <div>
                <Textarea
                  placeholder="Edit your LinkedIn post content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{wordCount} words • {charCount} characters</span>
                <span className={charCount > 3000 ? 'text-red-600 font-medium' : ''}>
                  {charCount > 3000 && 'LinkedIn limit: 3000 characters'}
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading || fetchingDraft}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || fetchingDraft || !content.trim()}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
