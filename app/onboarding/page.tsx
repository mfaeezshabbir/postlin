"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/brand/Logo";
import { CheckCircle, Linkedin, Key, Loader2, AlertCircle } from "lucide-react";
import { GEMINI_API_KEY_MIN_LENGTH } from "@/lib/constants";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "linkedin" | "gemini">("welcome");
  const [geminiKey, setGeminiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch user profile to check existing connections
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          
          // Skip to appropriate step based on existing setup
          if (!data.linkedInConnected && step === "welcome") {
            // Stay on welcome or move to LinkedIn step
          } else if (data.linkedInConnected && !data.hasGeminiKey && step === "welcome") {
            setStep("gemini");
          } else if (data.hasGeminiKey) {
            // Already fully onboarded, redirect to dashboard
            router.push("/dashboard/drafts");
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router, step]);

  const handleSkipLinkedIn = () => {
    setStep("gemini");
  };

  const handleConnectLinkedIn = async () => {
    setLoading(true);
    // Redirect to LinkedIn connection flow
    window.location.href = "/api/linkedin/connect";
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey || geminiKey.trim().length < GEMINI_API_KEY_MIN_LENGTH) {
      setError(`Please enter a valid Gemini API key (minimum ${GEMINI_API_KEY_MIN_LENGTH} characters)`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: geminiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to dashboard
        router.push("/dashboard/drafts");
      } else {
        setError(data.error || "Failed to save API key");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Postlin!
          </h1>
          <p className="text-gray-600">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "welcome" ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "welcome" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="text-sm font-medium hidden sm:inline">Welcome</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === "linkedin" ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "linkedin" ? "bg-blue-600 text-white" : step === "gemini" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
              {step === "gemini" || (profile?.linkedInConnected) ? <CheckCircle className="w-5 h-5" /> : "2"}
            </div>
            <span className="text-sm font-medium hidden sm:inline">LinkedIn</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === "gemini" ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "gemini" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              3
            </div>
            <span className="text-sm font-medium hidden sm:inline">AI Setup</span>
          </div>
        </div>

        {/* Welcome Step */}
        {step === "welcome" && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Postlin helps you create and schedule LinkedIn content with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900">
                      You're signed in with Google
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your account is ready. Now let's connect the services you need.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep("linkedin")}
                className="w-full"
                size="lg"
              >
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LinkedIn Connection Step */}
        {step === "linkedin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                Connect LinkedIn (Optional)
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn account to publish posts directly from Postlin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile?.linkedInConnected ? (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-900">
                      LinkedIn Connected
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your LinkedIn account is connected and ready to use.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Connecting LinkedIn allows you to:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Schedule and auto-publish posts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>View post analytics and engagement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Manage your content calendar</span>
                    </li>
                  </ul>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> You can skip this step and connect LinkedIn later
                      from settings. You'll still be able to create posts and copy them manually.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSkipLinkedIn}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Skip for Now
                </Button>
                {!profile?.linkedInConnected && (
                  <Button
                    onClick={handleConnectLinkedIn}
                    className="flex-1 bg-[#0A66C2] hover:bg-[#004182]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Linkedin className="w-4 h-4 mr-2" />
                        Connect LinkedIn
                      </>
                    )}
                  </Button>
                )}
                {profile?.linkedInConnected && (
                  <Button
                    onClick={() => setStep("gemini")}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gemini API Key Step */}
        {step === "gemini" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Add Your Gemini API Key
              </CardTitle>
              <CardDescription>
                Required to unlock AI-powered content generation features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Why do I need a Gemini API key?
                  </h3>
                  <p className="text-sm text-blue-700">
                    Postlin uses Google's Gemini AI to help you generate high-quality
                    LinkedIn posts. You'll need your own API key to use these features.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    How to get a Gemini API key:
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Get API Key" or "Create API Key"</li>
                    <li>Copy your API key and paste it below</li>
                  </ol>
                </div>

                <div>
                  <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key *
                  </label>
                  <input
                    id="geminiKey"
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is encrypted and stored securely. We never share it.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSaveGeminiKey}
                className="w-full"
                size="lg"
                disabled={loading || !geminiKey.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Need help? <a href="/support" className="text-blue-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
