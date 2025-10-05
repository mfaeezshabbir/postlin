'use client';

import { useState, useEffect } from 'react';
import { Sparkles, FileText, Loader2, Image as ImageIcon, Hash, X, Upload } from 'lucide-react';
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

interface DraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftSaved: () => void;
  mode: 'create' | 'edit';
  draftId?: string | null;
}

export function DraftModal({ open, onOpenChange, onDraftSaved, mode, draftId }: DraftModalProps) {
  // Main states
  const [creationMode, setCreationMode] = useState<'choose' | 'manual' | 'ai'>('choose');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(false);

  // AI generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hashtag states
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  // Track if current content was AI-generated
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  // Image prompt fallback states
  const [showImagePromptDialog, setShowImagePromptDialog] = useState(false);
  const [imagePromptText, setImagePromptText] = useState('');
  
  // Stored image prompt from draft (for reuse)
  const [storedImagePrompt, setStoredImagePrompt] = useState<string | null>(null);

  // Fetch draft if in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && draftId) {
      fetchDraft();
    } else if (open && mode === 'create') {
      // Reset to choose mode for create
      setCreationMode('choose');
    }
  }, [open, mode, draftId]);

  const fetchDraft = async () => {
    if (!draftId) return;

    setFetchingDraft(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`);
      if (!response.ok) throw new Error('Failed to fetch draft');
      
      const data = await response.json();
      setContent(data.draft.draftText);
      
      // Load image if exists
      if (data.draft.imageUrl) {
        setImagePreview(data.draft.imageUrl);
      }
      
      // Load stored image prompt if exists
      if (data.draft.imagePrompt) {
        setStoredImagePrompt(data.draft.imagePrompt);
      }
      
      // Extract hashtags from content
      const hashtagRegex = /#[\w]+/g;
      const foundHashtags = data.draft.draftText.match(hashtagRegex) || [];
      setHashtags(foundHashtags.map((tag: string) => tag.substring(1)));
      
      // For edit mode, go directly to manual mode
      setCreationMode('manual');
    } catch (error) {
      console.error('Error fetching draft:', error);
      alert('Failed to load draft. Please try again.');
      onOpenChange(false);
    } finally {
      setFetchingDraft(false);
    }
  };

  // Strip markdown formatting from text
  const stripMarkdown = (text: string): string => {
    return text
      // Remove bold/italic markdown (**text**, __text__, *text*, _text_)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove inline code (`code`)
      .replace(/`([^`]+)`/g, '$1')
      // Remove headers (# Header)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bullet points markdown (-, *, +)
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      // Remove numbered lists (1. item)
      .replace(/^[\s]*\d+\.\s+/gm, '• ')
      // Remove links [text](url)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove em dashes
      .replace(/—/g, ',')
      // Clean up any remaining asterisks
      .replace(/\*/g, '');
  };

  const resetModal = () => {
    setCreationMode('choose');
    setContent('');
    setAiPrompt('');
    setGeneratedContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setHashtags([]);
    setHashtagInput('');
    setLoading(false);
    setIsAIGenerated(false);
    setImagePromptText('');
    setStoredImagePrompt(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetModal();
      onOpenChange(false);
    }
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Hashtag handling
  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  // Insert hashtags into content
  const insertHashtagsIntoContent = (text: string) => {
    // If content already has hashtags (from AI generation), just return it
    // Otherwise, add the hashtags from the chip manager
    const hasHashtags = /#[\w]+/.test(text);
    
    if (hasHashtags || hashtags.length === 0) {
      return text;
    }
    
    // Add hashtags from chip manager
    const hashtagString = '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
    
    // Remove any existing hashtags at the end if present
    const contentWithoutHashtags = text.replace(/\n\n#[\w\s]+$/, '').trim();
    
    return contentWithoutHashtags + hashtagString;
  };

  // AI Generation
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
          generateImage: true, // Request AI to generate image
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      
      // Strip any markdown formatting that might have slipped through
      const cleanContent = stripMarkdown(data.content);
      
      setGeneratedContent(cleanContent);
      setContent(cleanContent);
      
      // Mark as AI-generated
      setIsAIGenerated(true);
      
      // Use structured hashtags from JSON response (already parsed as array)
      if (data.hashtags && Array.isArray(data.hashtags)) {
        setHashtags(data.hashtags);
      } else {
        // Fallback: Extract hashtags from content if not provided in structured format
        const hashtagMatches = cleanContent.match(/#[\w]+/g);
        if (hashtagMatches) {
          const extractedHashtags = hashtagMatches.map((tag: string) => tag.replace('#', ''));
          setHashtags(extractedHashtags);
        }
      }
      
      // Set AI-generated image if available
      if (data.image?.base64) {
        setImagePreview(data.image.base64);
        // Note: selectedImage will be null since it's AI-generated, not user-uploaded
        // We'll handle this in the save function
      }
      
      // Store image prompt (as JSON string if it's an object, or as-is if string)
      if (data.imagePrompt) {
        const promptToStore = typeof data.imagePrompt === 'object' 
          ? JSON.stringify(data.imagePrompt, null, 2) 
          : data.imagePrompt;
        setImagePromptText(promptToStore);
        
        // Show dialog if image generation failed
        if (!data.image?.base64) {
          setShowImagePromptDialog(true);
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content. Please try again.';
      alert(`AI Generation Error: ${errorMessage}\n\nPlease check that your GEMINI_API_KEY is valid.`);
    } finally {
      setLoading(false);
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    // Add hashtags to content
    const finalContent = insertHashtagsIntoContent(content);

    setLoading(true);
    try {
      let uploadedImageUrl = null;

      // Upload image if present
      if (imagePreview) {
        console.log('📤 Uploading image...');
        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imagePreview }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedImageUrl = uploadData.imageUrl;
          console.log(`✅ Image uploaded: ${uploadedImageUrl}`);
        } else {
          console.error('⚠️ Image upload failed, continuing without image');
        }
      }

      let response;
      
      const draftData = { 
        content: finalContent,
        imageUrl: uploadedImageUrl,
        imagePrompt: imagePromptText || storedImagePrompt, // Save image prompt
        hashtags: hashtags,
        isAIGenerated: isAIGenerated, // Track if it was AI-generated
      };
      
      console.log('📤 Saving draft with data:', {
        contentLength: finalContent.length,
        hasImage: !!uploadedImageUrl,
        hasImagePrompt: !!(imagePromptText || storedImagePrompt),
        hashtagsCount: hashtags.length,
        isAIGenerated,
      });
      
      if (mode === 'edit' && draftId) {
        // Update existing draft
        response = await fetch(`/api/drafts/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });
      } else {
        // Create new draft
        response = await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorDetails = errorData.details || errorData.error || 'Unknown error';
        console.error('❌ Draft API error:', errorData);
        throw new Error(`Failed to ${mode === 'edit' ? 'update' : 'create'} draft: ${errorDetails}`);
      }

      onDraftSaved();
      handleClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} draft:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} draft.\n\nError: ${errorMessage}\n\nPlease try again.`);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Loading state when fetching draft */}
        {fetchingDraft ? (
          <>
            <DialogHeader>
              <DialogTitle>Loading Draft...</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </>
        ) : (
          <>
            {/* Choose Creation Mode (only for create mode) */}
            {mode === 'create' && creationMode === 'choose' && (
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
                    onClick={() => setCreationMode('ai')}
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
                    onClick={() => setCreationMode('manual')}
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

            {/* AI Generation Mode */}
            {creationMode === 'ai' && (
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
                    <>
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
                        rows={10}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500">
                        You can edit the generated content before saving
                      </p>

                      {/* Image Upload Section */}
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">
                          <ImageIcon className="w-4 h-4 inline mr-2" />
                          Add Image (Optional)
                        </label>
                        {!imagePreview ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">Click to upload image</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                            </label>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Hashtags Section */}
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">
                          <Hash className="w-4 h-4 inline mr-2" />
                          Add Hashtags (Optional)
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={hashtagInput}
                            onChange={(e) => setHashtagInput(e.target.value)}
                            onKeyDown={handleHashtagKeyDown}
                            placeholder="Type hashtag and press Enter"
                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                          />
                          <Button
                            type="button"
                            onClick={handleAddHashtag}
                            size="sm"
                            variant="outline"
                          >
                            Add
                          </Button>
                        </div>
                        {hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {hashtags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                #{tag}
                                <button
                                  onClick={() => handleRemoveHashtag(tag)}
                                  className="ml-1 hover:bg-gray-300 rounded-full"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
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

            {/* Manual Writing Mode */}
            {creationMode === 'manual' && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {mode === 'edit' ? 'Edit Draft' : 'Write Your Post'}
                  </DialogTitle>
                  <DialogDescription>
                    {mode === 'edit' 
                      ? 'Make changes to your draft post'
                      : 'Create your LinkedIn post content manually'
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Textarea
                      placeholder="What do you want to share with your network?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      className="resize-none"
                      disabled={loading}
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>{wordCount} words • {charCount} characters</span>
                      <span className={charCount > 3000 ? 'text-red-600 font-medium' : ''}>
                        {charCount > 3000 && '⚠️ LinkedIn limit: 3000 characters'}
                      </span>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium block">
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Add Image (Optional)
                      </label>
                      {storedImagePrompt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePromptText(storedImagePrompt);
                            setShowImagePromptDialog(true);
                          }}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          View Image Prompt
                        </Button>
                      )}
                    </div>
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload-manual"
                        />
                        <label htmlFor="image-upload-manual" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hashtags Section */}
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium mb-2 block">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Add Hashtags (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyDown={handleHashtagKeyDown}
                        placeholder="Type hashtag and press Enter"
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleAddHashtag}
                        size="sm"
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            #{tag}
                            <button
                              onClick={() => handleRemoveHashtag(tag)}
                              className="ml-1 hover:bg-gray-300 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
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
                      mode === 'edit' ? 'Save Changes' : 'Save Draft'
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        )}
      </DialogContent>

      {/* Image Prompt Fallback Dialog */}
      <Dialog open={showImagePromptDialog} onOpenChange={setShowImagePromptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Image Generation Unavailable
            </DialogTitle>
            <DialogDescription>
              We couldn't generate an image due to API rate limits, but we've created a perfect prompt for you! 
              Copy this and use it in any image generation tool like DALL-E, Midjourney, or Leonardo AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Prompt Box */}
            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{imagePromptText}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(imagePromptText);
                  // Simple visual feedback
                  const btn = document.activeElement as HTMLButtonElement;
                  const originalText = btn.textContent;
                  btn.textContent = '✓ Copied!';
                  setTimeout(() => {
                    if (btn) btn.textContent = originalText;
                  }, 2000);
                }}
              >
                📋 Copy
              </Button>
            </div>

            {/* Suggested Tools */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Suggested Image Generation Tools:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>
                  • <a 
                    href="https://aistudio.google.com/app/prompts/new_freeform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    Google AI Studio
                  </a> (Free - use your Gemini API key)
                </li>
                <li>
                  • <a 
                    href="https://www.bing.com/images/create" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    Bing Image Creator
                  </a> (Free with Microsoft account)
                </li>
                <li>
                  • <a 
                    href="https://leonardo.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    Leonardo AI
                  </a> (Free tier available)
                </li>
                <li>
                  • <a 
                    href="https://www.craiyon.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    Craiyon
                  </a> (Completely free)
                </li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-amber-900 mb-2">📝 How to Use:</h4>
              <ol className="space-y-1 text-sm text-amber-800 list-decimal list-inside">
                <li>Click "Copy" above to copy the prompt</li>
                <li>Open one of the suggested tools (or any AI image generator)</li>
                <li>Paste the prompt and generate your image</li>
                <li>Download the image</li>
                <li>Come back here and upload it using the "Upload Image" button</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowImagePromptDialog(false)}>
              Got it, thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
