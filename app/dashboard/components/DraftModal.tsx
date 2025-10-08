"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Loader2,
  Image as ImageIcon,
  Hash,
  X,
  Upload,
  Calendar,
  Save,
  Wand2,
  Edit3,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ScheduleDialog from "./ScheduleDialog";

interface DraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftSaved: () => void;
  mode: "create" | "edit";
  draftId?: string | null;
}

export function DraftModal({
  open,
  onOpenChange,
  onDraftSaved,
  mode,
  draftId,
}: DraftModalProps) {
  const { push } = require("@/components/ToastProvider").useToasts?.() || { push: (t: any) => "" };
  // Main states
  const [creationMode, setCreationMode] = useState<"choose" | "manual" | "ai">(
    "choose"
  );
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(false);

  // AI generation states
  const [aiPrompt, setAiPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [generatedContent, setGeneratedContent] = useState("");

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hashtag states
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  // Track if current content was AI-generated
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  // Image prompt fallback states
  const [showImagePromptDialog, setShowImagePromptDialog] = useState(false);

  // Scheduling states
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [imagePromptText, setImagePromptText] = useState("");

  // Stored image prompt from draft (for reuse)
  const [storedImagePrompt, setStoredImagePrompt] = useState<string | null>(
    null
  );

  // Track the current draft ID (can change when saving a new draft)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(
    draftId || null
  );

  // Fetch draft if in edit mode
  useEffect(() => {
    if (open && mode === "edit" && draftId) {
      fetchDraft();
    } else if (open && mode === "create") {
      setCreationMode("choose");
    }
  }, [open, mode, draftId]);

  const fetchDraft = async () => {
    if (!draftId) return;

    setFetchingDraft(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`);
      if (!response.ok) throw new Error("Failed to fetch draft");

      const data = await response.json();
      setContent(data.draft.draftText);

      if (data.draft.imageUrl) {
        setImagePreview(data.draft.imageUrl);
      }

      if (data.draft.imagePrompt) {
        setStoredImagePrompt(data.draft.imagePrompt);
      }

      const hashtagRegex = /#[\w]+/g;
      const foundHashtags = data.draft.draftText.match(hashtagRegex) || [];
      setHashtags(foundHashtags.map((tag: string) => tag.substring(1)));

      setCreationMode("manual");
    } catch (error) {
  console.error("Error fetching draft:", error);
  push({ title: "Failed", description: "Failed to load draft. Please try again.", variant: "error" });
      onOpenChange(false);
    } finally {
      setFetchingDraft(false);
    }
  };

  // Strip markdown formatting from text
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^[\s]*[-*+]\s+/gm, "• ")
      .replace(/^[\s]*\d+\.\s+/gm, "• ")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/—/g, ",")
      .replace(/\*/g, "");
  };

  const resetModal = () => {
    setCreationMode("choose");
    setContent("");
    setAiPrompt("");
    setGeneratedContent("");
    setSelectedImage(null);
    setImagePreview(null);
    setHashtags([]);
    setHashtagInput("");
    setLoading(false);
    setIsAIGenerated(false);
    setImagePromptText("");
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

    if (!file.type.startsWith("image/")) {
      push({ title: "Invalid File", description: "Please select an image file", variant: "error" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      push({ title: "Image Too Large", description: "Image size must be less than 10MB", variant: "error" });
      return;
    }

    setSelectedImage(file);

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
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  // Insert hashtags into content
  const insertHashtagsIntoContent = (text: string) => {
    const hasHashtags = /#[\w]+/.test(text);

    if (hasHashtags || hashtags.length === 0) {
      return text;
    }

    const hashtagString = "\n\n" + hashtags.map((tag) => `#${tag}`).join(" ");
    const contentWithoutHashtags = text.replace(/\n\n#[\w\s]+$/, "").trim();

    return contentWithoutHashtags + hashtagString;
  };

  // AI Generation
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          tone,
          length,
          generateImage: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to generate content"
        );
      }

      const data = await response.json();
      const cleanContent = stripMarkdown(data.content);

      setGeneratedContent(cleanContent);
      setContent(cleanContent);
      setIsAIGenerated(true);

      if (data.hashtags && Array.isArray(data.hashtags)) {
        setHashtags(data.hashtags);
      } else {
        const hashtagMatches = cleanContent.match(/#[\w]+/g);
        if (hashtagMatches) {
          const extractedHashtags = hashtagMatches.map((tag: string) =>
            tag.replace("#", "")
          );
          setHashtags(extractedHashtags);
        }
      }

      if (data.image?.base64) {
        setImagePreview(data.image.base64);
      }

      if (data.imagePrompt) {
        const promptToStore =
          typeof data.imagePrompt === "object"
            ? JSON.stringify(data.imagePrompt, null, 2)
            : data.imagePrompt;
        setImagePromptText(promptToStore);

        if (!data.image?.base64) {
          setShowImagePromptDialog(true);
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate content. Please try again.";
      push({ title: "AI Error", description: `AI Generation Error: ${errorMessage}. Please check that your GEMINI_API_KEY is valid.`, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Save Draft
  const handleSaveDraft = async (): Promise<string | null> => {
    if (!content.trim()) {
      push({ title: "Validation", description: "Please enter some content", variant: "info" });
      return null;
    }

    const finalContent = insertHashtagsIntoContent(content);

    setLoading(true);
    try {
      let uploadedImageUrl = null;

      if (imagePreview) {
        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imagePreview }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedImageUrl = uploadData.imageUrl;
        }
      }

      let response;

      const draftData = {
        content: finalContent,
        imageUrl: uploadedImageUrl,
        imagePrompt: imagePromptText || storedImagePrompt,
        hashtags: hashtags,
        isAIGenerated: isAIGenerated,
      };

      if (mode === "edit" && draftId) {
        response = await fetch(`/api/drafts/${draftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        });
      } else {
        response = await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        });
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        const errorDetails =
          errorData.details || errorData.error || "Unknown error";
        throw new Error(
          `Failed to ${
            mode === "edit" ? "update" : "create"
          } draft: ${errorDetails}`
        );
      }

      const result = await response.json();
      const savedDraftId = result.draft?.id || draftId;

      return savedDraftId;
    } catch (error) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} draft:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      push({ title: "Save Failed", description: `Failed to ${mode === "edit" ? "update" : "create"} draft. Error: ${errorMessage}`, variant: "error" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle Schedule
  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      push({ title: "Schedule", description: "Please select both date and time", variant: "info" });
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      push({ title: "Schedule", description: "Scheduled time must be in the future", variant: "error" });
      return;
    }

    setScheduling(true);
    try {
      let postIdToSchedule = currentDraftId || draftId;

      if (!postIdToSchedule) {
        const savedId = await handleSaveDraft();

        if (!savedId) {
          throw new Error("Failed to save draft before scheduling");
        }

        postIdToSchedule = savedId;
        setCurrentDraftId(savedId);
      }

      const response = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postIdToSchedule,
          scheduledAt: scheduledDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to schedule post"
        );
      }

  const data = await response.json();
  push({ title: "Scheduled", description: data.message || "Post scheduled successfully!", variant: "success" });
      setShowScheduleDialog(false);
      onDraftSaved();
      handleClose();
    } catch (error) {
      console.error("Error scheduling post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      push({ title: "Schedule Error", description: `Failed to schedule post. Error: ${errorMessage}`, variant: "error" });
    } finally {
      setScheduling(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="!max-w-[80vw] !w-[70vw] max-h-[95vh] p-0 gap-0 border-0 shadow-2xl overflow-hidden">
          {fetchingDraft ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading your draft...
              </h3>
              <p className="text-sm text-gray-500">Just a moment</p>
            </div>
          ) : (
            <>
              {/* Choose Creation Mode */}
              {mode === "create" && creationMode === "choose" && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      Create New Post
                    </h2>
                    <p className="text-gray-600">
                      Choose how you'd like to craft your LinkedIn content
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
                    {/* AI Generation Card */}
                    <button
                      onClick={() => setCreationMode("ai")}
                      className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />

                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-110">
                          <Wand2 className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          AI Assistant
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          Describe your idea and let AI create engaging,
                          professional content with hashtags and images
                        </p>

                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 border-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-600"
                          >
                            Fast & Easy
                          </Badge>
                        </div>
                      </div>
                    </button>

                    {/* Manual Writing Card */}
                    <button
                      onClick={() => setCreationMode("manual")}
                      className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />

                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
                          <Edit3 className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Write Manually
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          Craft your message from scratch with full creative
                          control over every word
                        </p>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-600"
                          >
                            Full Control
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-600"
                          >
                            Custom
                          </Badge>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* AI Generation Flow */}
              {creationMode === "ai" && (
                <div className="flex h-full max-h-[95vh]">
                  {/* Left Sidebar - AI Controls */}
                  <div className="w-96 bg-gradient-to-br from-purple-50 to-blue-50 p-6 border-r border-gray-200 overflow-y-auto">
                    <button
                      onClick={() => {
                        setCreationMode("choose");
                        setGeneratedContent("");
                        setContent("");
                      }}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to options
                    </button>

                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                        <Wand2 className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        AI Assistant
                      </h2>
                      <p className="text-sm text-gray-600">
                        Tell us what you want to write about
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Your Topic
                        </label>
                        <Textarea
                          placeholder="Example: Share insights from launching our new SaaS product, tips for remote team productivity, or thoughts on AI in business..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={5}
                          className="resize-none bg-white border-2 focus:border-purple-400"
                          disabled={loading || !!generatedContent}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Tone of Voice
                          </label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 rounded-lg focus:border-purple-400 focus:outline-none bg-white"
                            disabled={loading || !!generatedContent}
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual & Friendly</option>
                            <option value="enthusiastic">Enthusiastic</option>
                            <option value="informative">Informative</option>
                            <option value="inspirational">Inspirational</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Content Length
                          </label>
                          <select
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 rounded-lg focus:border-purple-400 focus:outline-none bg-white"
                            disabled={loading || !!generatedContent}
                          >
                            <option value="short">Short (100-150 words)</option>
                            <option value="medium">
                              Medium (150-250 words)
                            </option>
                            <option value="long">Long (250-400 words)</option>
                          </select>
                        </div>
                      </div>

                      {!generatedContent ? (
                        <Button
                          onClick={handleGenerateAI}
                          disabled={loading || !aiPrompt.trim()}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 h-12"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Generate Content
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setGeneratedContent("");
                            setContent("");
                          }}
                          variant="outline"
                          className="w-full h-12 border-2"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Start Over
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right Content Area */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {generatedContent ? (
                      <>
                        <div className="flex-1 overflow-y-auto p-6">
                          <div className="max-w-3xl mx-auto space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700">
                                  Generated Content
                                </label>
                                <span className="text-xs text-gray-500">
                                  {wordCount} words • {charCount}/3000
                                  characters
                                </span>
                              </div>
                              <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={12}
                                className="resize-none text-base leading-relaxed"
                              />
                              {charCount > 3000 && (
                                <p className="text-xs text-red-600 mt-2">
                                  ⚠️ Content exceeds LinkedIn's 3000 character
                                  limit
                                </p>
                              )}
                            </div>

                            {/* Image Section */}
                            <div>
                              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                Post Image
                              </label>
                              {!imagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="image-upload-ai"
                                  />
                                  <label
                                    htmlFor="image-upload-ai"
                                    className="cursor-pointer"
                                  >
                                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                                    <p className="text-sm font-medium text-gray-700">
                                      Upload an image
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      PNG, JPG up to 10MB
                                    </p>
                                  </label>
                                </div>
                              ) : (
                                <div className="relative rounded-xl overflow-hidden">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover"
                                  />
                                  <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Hashtags Section */}
                            <div>
                              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                Hashtags
                              </label>
                              <div className="flex gap-2 mb-3">
                                <input
                                  type="text"
                                  value={hashtagInput}
                                  onChange={(e) =>
                                    setHashtagInput(e.target.value)
                                  }
                                  onKeyDown={handleHashtagKeyDown}
                                  placeholder="Add hashtag"
                                  className="flex-1 px-4 py-2 border-2 rounded-lg focus:border-purple-400 focus:outline-none"
                                />
                                <Button
                                  type="button"
                                  onClick={handleAddHashtag}
                                  variant="outline"
                                  className="border-2"
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
                                      className="px-3 py-1.5 text-sm"
                                    >
                                      #{tag}
                                      <button
                                        onClick={() => handleRemoveHashtag(tag)}
                                        className="ml-2 hover:bg-gray-300 rounded-full"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
                          <Button variant="ghost" onClick={handleClose}>
                            Cancel
                          </Button>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowScheduleDialog(true)}
                              className="border-2"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule
                            </Button>
                            <Button
                              onClick={async () => {
                                const savedId = await handleSaveDraft();
                                if (savedId) {
                                  onDraftSaved();
                                  handleClose();
                                }
                              }}
                              disabled={loading || !content.trim()}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Draft
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center max-w-md">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Ready to create?
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            Fill in the details on the left and click "Generate
                            Content" to let AI craft your perfect LinkedIn post
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Writing Flow */}
              {creationMode === "manual" && (
                <div className="flex h-full max-h-[95vh]">
                  {/* Left Sidebar - Meta Controls */}
                  <div className="w-80 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                    {mode === "create" && (
                      <button
                        onClick={() => setCreationMode("choose")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to options
                      </button>
                    )}

                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                        <Edit3 className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {mode === "edit" ? "Edit Draft" : "Write Post"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Craft your message with full control
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Image Upload */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Post Image
                        </label>
                        {!imagePreview ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="image-upload-manual"
                            />
                            <label
                              htmlFor="image-upload-manual"
                              className="cursor-pointer"
                            >
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-xs font-medium text-gray-700">
                                Upload image
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 10MB
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="relative rounded-xl overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-40 object-cover"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Hashtags */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Hashtags
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={hashtagInput}
                            onChange={(e) => setHashtagInput(e.target.value)}
                            onKeyDown={handleHashtagKeyDown}
                            placeholder="Add hashtag"
                            className="flex-1 px-3 py-2 border-2 rounded-lg focus:border-green-400 focus:outline-none text-sm"
                          />
                          <Button
                            type="button"
                            onClick={handleAddHashtag}
                            size="sm"
                            variant="outline"
                            className="border-2"
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
                                className="text-xs"
                              >
                                #{tag}
                                <button
                                  onClick={() => handleRemoveHashtag(tag)}
                                  className="ml-1.5 hover:bg-gray-300 rounded-full"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                          Content Stats
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Words</span>
                            <span className="font-semibold text-gray-900">
                              {wordCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Characters</span>
                            <span
                              className={`font-semibold ${
                                charCount > 3000
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {charCount}/3000
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hashtags</span>
                            <span className="font-semibold text-gray-900">
                              {hashtags.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content Area */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8">
                      <div className="max-w-3xl mx-auto">
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Your Content
                        </label>
                        <Textarea
                          placeholder="Share your thoughts, insights, or updates with your network..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={20}
                          className="resize-none text-base leading-relaxed"
                          disabled={loading}
                        />
                        {charCount > 3000 && (
                          <p className="text-xs text-red-600 mt-2">
                            ⚠️ Content exceeds LinkedIn's 3000 character limit
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowScheduleDialog(true)}
                          disabled={loading || !content.trim()}
                          className="border-2"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                        <Button
                          onClick={async () => {
                            const savedId = await handleSaveDraft();
                            if (savedId) {
                              onDraftSaved();
                              handleClose();
                            }
                          }}
                          disabled={loading || !content.trim()}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {mode === "edit" ? "Save Changes" : "Save Draft"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        scheduledDate={scheduledDate}
        setScheduledDate={setScheduledDate}
        scheduledTime={scheduledTime}
        setScheduledTime={setScheduledTime}
        scheduling={scheduling}
        onSchedule={handleSchedule}
      />

      {/* Image Prompt Fallback Dialog */}
      <Dialog
        open={showImagePromptDialog}
        onOpenChange={setShowImagePromptDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Image Generation Unavailable
            </DialogTitle>
            <DialogDescription>
              We couldn't generate an image due to API rate limits, but we've
              created a perfect prompt for you!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {imagePromptText}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(imagePromptText);
                }}
              >
                Copy
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                Suggested Tools:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Google AI Studio (Free)</li>
                <li>• Bing Image Creator (Free)</li>
                <li>• Leonardo AI (Free tier)</li>
                <li>• Craiyon (Free)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowImagePromptDialog(false)}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
