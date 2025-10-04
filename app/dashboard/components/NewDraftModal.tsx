'use client';

import { useState } from 'react';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface NewDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftCreated: () => void;
}

export function NewDraftModal({ open, onOpenChange, onDraftCreated }: NewDraftModalProps) {
  const [mode, setMode] = useState<'choose' | 'manual' | 'ai'>('choose');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const resetModal = () => {
    setMode('choose');
    setContent('');
    setAiPrompt('');
    setGeneratedContent('');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          tone,
          length,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setContent(data.content);
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content. Please try again.';
      alert(`AI Generation Error: ${errorMessage}\n\nPlease check that your GEMINI_API_KEY is valid.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create draft');
      }

      onDraftCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating draft:', error);
      alert('Failed to create draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {mode === 'choose' && (
          <>
            <DialogHeader>
              <DialogTitle>Create New Draft</DialogTitle>
              <DialogDescription>
                Choose how you want to create your LinkedIn post
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
              {/* AI Generation Option */}
              <button
                onClick={() => setMode('ai')}
                className="flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">AI Generated</h3>
                  <p className="text-sm text-gray-600">
                    Let AI create engaging content for you
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Recommended
                </Badge>
              </button>

              {/* Manual Writing Option */}
              <button
                onClick={() => setMode('manual')}
                className="flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Write Manually</h3>
                  <p className="text-sm text-gray-600">
                    Create your post from scratch
                  </p>
                </div>
              </button>
            </div>
          </>
        )}

        {mode === 'ai' && (
          <>
            <DialogHeader>
              <DialogTitle>AI Content Generation</DialogTitle>
              <DialogDescription>
                Describe what you want to post about, and AI will create engaging content
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {!generatedContent ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      What do you want to write about?
                    </label>
                    <Textarea
                      placeholder="Example: Share my experience launching a new product, tips for remote team management, thoughts on AI in marketing..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tone</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="enthusiastic">Enthusiastic</option>
                        <option value="informative">Informative</option>
                        <option value="inspirational">Inspirational</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Length</label>
                      <select
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="short">Short (100-150 words)</option>
                        <option value="medium">Medium (150-250 words)</option>
                        <option value="long">Long (250-400 words)</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Generated Content</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGeneratedContent('');
                        setContent('');
                      }}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You can edit the generated content before saving
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              {!generatedContent ? (
                <Button onClick={handleGenerateAI} disabled={loading || !aiPrompt.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleSaveDraft} disabled={loading || !content.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        )}

        {mode === 'manual' && (
          <>
            <DialogHeader>
              <DialogTitle>Write Your Post</DialogTitle>
              <DialogDescription>
                Create your LinkedIn post content manually
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Textarea
                placeholder="What do you want to share with your network?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {content.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveDraft} disabled={loading || !content.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
