"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export function GeminiKeyManager() {
  const { hasGeminiKey, profile, refetch } = useUserProfile();
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save API key");
        return;
      }

      setSuccess("API key saved successfully!");
      setApiKey("");
      setShowForm(false);
      setShowKey(false);
      await refetch();
    } catch (err) {
      console.error("Error saving Gemini key:", err);
      setError("Failed to save API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!confirm("Are you sure you want to remove your Gemini API key? AI features will be disabled.")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/gemini-key", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to remove API key");
        return;
      }

      setSuccess("API key removed successfully");
      await refetch();
    } catch (err) {
      console.error("Error removing Gemini key:", err);
      setError("Failed to remove API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block">
              Gemini API Key
            </label>
            {hasGeminiKey ? (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-green-600 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configured
                </Badge>
                {profile?.geminiKeyAddedAt && (
                  <span className="text-xs text-gray-500">
                    Added {new Date(profile.geminiKeyAddedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-300 mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not configured
              </Badge>
            )}
          </div>
        </div>

        {!showForm && (
          <div className="flex gap-2">
            {hasGeminiKey ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(true)}
                >
                  Update Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveKey}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Add API Key
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600">
        {hasGeminiKey
          ? "Your API key is encrypted and stored securely. It's used exclusively for your AI content generation requests."
          : "Add your personal Gemini API key to unlock AI-powered content generation features."}
      </p>

      {showForm && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
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
          </div>

          <div className="flex justify-between items-start gap-4">
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">How to get your API key:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Sign in and create an API key</li>
                <li>Copy and paste it above</li>
              </ol>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setApiKey("");
                  setError("");
                  setShowKey(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveKey}
                disabled={loading || !apiKey.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Key
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!hasGeminiKey && !showForm && (
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <p className="text-sm text-orange-800">
            <strong>Why do I need this?</strong><br />
            Postlin uses your personal Gemini API key to generate content on your behalf. 
            This ensures you have full control over your API usage and costs. The key is encrypted 
            and never shared.
          </p>
        </div>
      )}
    </div>
  );
}
