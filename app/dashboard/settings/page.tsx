"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardContainer from "../components/DashboardContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Palette,
  Shield,
  Linkedin,
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Gemini key states
  const [geminiKey, setGeminiKey] = useState("");
  const [savingGeminiKey, setSavingGeminiKey] = useState(false);
  const [deletingGeminiKey, setDeletingGeminiKey] = useState(false);
  const [geminiKeyError, setGeminiKeyError] = useState("");
  const [geminiKeySuccess, setGeminiKeySuccess] = useState("");
  
  // LinkedIn states
  const [disconnectingLinkedIn, setDisconnectingLinkedIn] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    setGeminiKeyError("");
    setGeminiKeySuccess("");
    
    if (!geminiKey.trim()) {
      setGeminiKeyError("Please enter your Gemini API key");
      return;
    }

    if (!geminiKey.startsWith("AIzaSy")) {
      setGeminiKeyError("Invalid API key format. Gemini keys should start with 'AIzaSy'");
      return;
    }

    setSavingGeminiKey(true);
    try {
      const res = await fetch("/api/user/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiKey }),
      });

      if (res.ok) {
        setGeminiKeySuccess("Gemini API key saved successfully!");
        setGeminiKey("");
        fetchProfile(); // Refresh profile
      } else {
        const data = await res.json();
        setGeminiKeyError(data.error || "Failed to save API key");
      }
    } catch (error) {
      console.error("Error saving Gemini key:", error);
      setGeminiKeyError("Failed to save API key. Please try again.");
    } finally {
      setSavingGeminiKey(false);
    }
  };

  const handleDeleteGeminiKey = async () => {
    if (!confirm("Are you sure you want to delete your Gemini API key? AI features will be disabled.")) {
      return;
    }

    setDeletingGeminiKey(true);
    try {
      const res = await fetch("/api/user/gemini-key", {
        method: "DELETE",
      });

      if (res.ok) {
        setGeminiKeySuccess("Gemini API key deleted successfully");
        fetchProfile(); // Refresh profile
      } else {
        const data = await res.json();
        setGeminiKeyError(data.error || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Error deleting Gemini key:", error);
      setGeminiKeyError("Failed to delete API key. Please try again.");
    } finally {
      setDeletingGeminiKey(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!confirm("Are you sure you want to disconnect your LinkedIn account?")) {
      return;
    }

    setDisconnectingLinkedIn(true);
    try {
      const res = await fetch("/api/linkedin/disconnect", {
        method: "POST",
      });

      if (res.ok) {
        fetchProfile(); // Refresh profile
      }
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error);
    } finally {
      setDisconnectingLinkedIn(false);
    }
  };

  if (status === "loading" || loadingProfile) {
    return (
      <DashboardContainer
        title="Settings"
        description="Manage your account settings and preferences"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Account
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Palette className="mr-2 h-4 w-4" />
                  Preferences
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy & Security
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.name || session?.user?.name || "Not set"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.email || session?.user?.email || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gemini API Key section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Gemini API Key
              </CardTitle>
              <CardDescription>
                Your personal Gemini API key for AI-powered content generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  {profile?.hasGeminiKey ? (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 border-0">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not configured
                    </Badge>
                  )}
                </div>
                
                {profile?.hasGeminiKey ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Your Gemini API key is configured and encrypted. Added on{" "}
                      {profile.geminiKeyAddedAt ? new Date(profile.geminiKeyAddedAt).toLocaleDateString() : "Unknown"}.
                    </p>
                    <Button
                      onClick={handleDeleteGeminiKey}
                      disabled={deletingGeminiKey}
                      variant="destructive"
                      size="sm"
                    >
                      {deletingGeminiKey ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Key
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={geminiKey}
                        onChange={(e) => {
                          setGeminiKey(e.target.value);
                          setGeminiKeyError("");
                          setGeminiKeySuccess("");
                        }}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {geminiKeyError && (
                        <p className="text-sm text-red-600 mt-2">{geminiKeyError}</p>
                      )}
                      {geminiKeySuccess && (
                        <p className="text-sm text-green-600 mt-2">{geminiKeySuccess}</p>
                      )}
                    </div>
                    <Button
                      onClick={handleSaveGeminiKey}
                      disabled={savingGeminiKey}
                      size="sm"
                    >
                      {savingGeminiKey ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save API Key"
                      )}
                    </Button>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Don't have a Gemini API key?</strong> Get one for free at{" "}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Google AI Studio <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* LinkedIn Account section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                LinkedIn Account
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn account to publish posts directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Connection Status
                  </label>
                  {profile?.linkedInConnected ? (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-0">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not connected
                    </Badge>
                  )}
                </div>
                
                {profile?.linkedInConnected ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Your LinkedIn account is connected and ready to publish posts.
                    </p>
                    <Button
                      onClick={handleDisconnectLinkedIn}
                      disabled={disconnectingLinkedIn}
                      variant="outline"
                      size="sm"
                    >
                      {disconnectingLinkedIn ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          Disconnecting...
                        </>
                      ) : (
                        "Disconnect LinkedIn"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Connect your LinkedIn account to automatically publish posts.
                    </p>
                    <Button
                      onClick={() => window.location.href = "/api/linkedin/connect?callbackUrl=/dashboard/settings"}
                      size="sm"
                      className="bg-[#0A66C2] hover:bg-[#004182]"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      Connect LinkedIn
                    </Button>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        💡 <strong>Note:</strong> Without LinkedIn connected, you can still create posts and copy them manually.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Posting Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Posting Schedule</CardTitle>
              <CardDescription>
                Set your preferred posting times for automatic scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Preferred Posting Times
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Monday - Friday, 9:00 AM and 3:00 PM
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Edit Schedule
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Time Zone
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  (UTC+00:00) Coordinated Universal Time
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Change Time Zone
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <SettingsIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Settings Coming Soon
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Full settings functionality including preferences,
                    notifications, and integrations will be available soon. This
                    is a preview of what's coming.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardContainer>
  );
}
