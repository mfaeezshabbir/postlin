"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { GEMINI_API_KEY_MIN_LENGTH, GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GeminiKeyManagementProps {
  initialHasKey: boolean;
  initialKeyAddedAt?: Date | null;
  initialModel?: string | null;
}

export default function GeminiKeyManagement({
  initialHasKey,
  initialKeyAddedAt,
  initialModel,
}: GeminiKeyManagementProps) {
  const [hasKey, setHasKey] = useState(initialHasKey);
  const [keyAddedAt, setKeyAddedAt] = useState(initialKeyAddedAt);
  const [selectedModel, setSelectedModel] = useState(initialModel || DEFAULT_GEMINI_MODEL);
  const [isEditing, setIsEditing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = async () => {
    if (!apiKey || apiKey.trim().length < GEMINI_API_KEY_MIN_LENGTH) {
      setError(
        `Please enter a valid Gemini API key (minimum ${GEMINI_API_KEY_MIN_LENGTH} characters)`
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: apiKey.trim(), model: selectedModel }),
      });

      const data = await response.json();

      if (response.ok) {
        setHasKey(true);
        setKeyAddedAt(data.geminiKeyAddedAt);
        setSelectedModel(data.geminiModel || DEFAULT_GEMINI_MODEL);
        setIsEditing(false);
        setApiKey("");
        setSuccess(
          hasKey
            ? "Gemini API key and model updated successfully"
            : "Gemini API key and model added successfully"
        );
      } else {
        // Sanitize error messages to avoid exposing technical details
        const isTechnicalError =
          data.error?.toLowerCase().includes("encrypt") ||
          data.error?.toLowerCase().includes("server") ||
          data.error?.toLowerCase().includes("database");

        setError(
          isTechnicalError
            ? "An unexpected system error occurred. Please try again later."
            : data.error || "Failed to save API key"
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/gemini-key", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setHasKey(false);
        setKeyAddedAt(null);
        setIsEditing(false);
        setApiKey("");
        setSuccess("Gemini API key removed successfully");
      } else {
        setError(data.error || "Failed to remove API key");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setApiKey("");
    setError("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Gemini AI API Key
        </CardTitle>
        <CardDescription>
          Manage your Google Gemini API key for AI-powered content generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  API Key Status
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {hasKey ? (
                    <>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Configured
                      </Badge>
                      {keyAddedAt && (
                        <span className="text-xs text-gray-500">
                          Added {new Date(keyAddedAt).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-300"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not configured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {hasKey && (
                  <Button
                    onClick={handleDeleteClick}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  disabled={loading}
                >
                  {hasKey ? "Update Key" : "Add Key"}
                </Button>
              </div>
            </div>

            {!hasKey && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  AI-powered content generation features are currently disabled.
                  Add your Gemini API key to unlock these features.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="geminiKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gemini API Key *
                </label>
                <div className="relative">
                  <input
                    id="geminiKey"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is encrypted and stored securely. We never share
                  it with third parties.
                </p>
              </div>

              <div>
                <label
                  htmlFor="geminiModel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI Model *
                </label>
                <select
                  id="geminiModel"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={loading}
                >
                  {GEMINI_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the AI model for content generation. Different models offer different trade-offs between speed, quality, and cost.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  Get your free API key from{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={loading || !apiKey.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save API Key"
                )}
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {hasKey && !isEditing && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Your Gemini API key is configured and AI-powered features are
              enabled. You can generate content, optimize posts, and more.
            </p>
            <p className="text-xs text-gray-500">
              Current model: <span className="font-medium text-gray-700">{selectedModel}</span>
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Gemini API Key?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your Gemini API key? AI-powered
              features will be disabled until you add a new key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
