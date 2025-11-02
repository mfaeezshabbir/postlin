"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Key, CheckCircle, Loader2, ArrowRight, SkipForward } from "lucide-react";
import Logo from "@/components/brand/Logo";

type OnboardingStep = "linkedin" | "gemini";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("linkedin");
  const [loading, setLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile to check onboarding status
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          
          // If user already has Gemini key, skip to dashboard
          if (data.hasGeminiKey) {
            router.push("/dashboard/drafts");
          } else if (data.linkedInConnected) {
            // If LinkedIn is connected but no Gemini key, go to Gemini step
            setStep("gemini");
          }
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
  }, [status, session, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSkipLinkedIn = () => {
    setStep("gemini");
  };

  const handleConnectLinkedIn = async () => {
    setLoading(true);
    try {
      // Redirect to LinkedIn OAuth
      window.location.href = "/api/auth/signin/linkedin?callbackUrl=/onboarding";
    } catch (err) {
      console.error("LinkedIn connection error:", err);
      setLoading(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) {
      setError("Please enter your Gemini API key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save API key");
        setLoading(false);
        return;
      }

      // Success! Redirect to dashboard
      router.push("/dashboard/drafts");
    } catch (err) {
      console.error("Error saving Gemini key:", err);
      setError("Failed to save API key. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Postlin!
          </h1>
          <p className="text-gray-600">
            Let's set up your account in just a few steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              step === "linkedin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Linkedin className="w-4 h-4" />
            <span className="text-sm font-medium">LinkedIn</span>
            {profile?.linkedInConnected && <CheckCircle className="w-4 h-4" />}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              step === "gemini" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="text-sm font-medium">Gemini API</span>
          </div>
        </div>

        {/* LinkedIn Connection Step */}
        {step === "linkedin" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A66C2] rounded-full mb-4">
                <Linkedin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect LinkedIn (Optional)
              </h2>
              <p className="text-gray-600">
                Connect your LinkedIn account to automatically publish posts. You can skip this and add it later.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConnectLinkedIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-3.5 px-6 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Linkedin className="w-5 h-5" />
                    <span>Connect LinkedIn</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleSkipLinkedIn}
                disabled={loading}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-3.5"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip for now</span>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Why connect LinkedIn?</strong>
                <br />
                Allows you to schedule and automatically publish posts directly to your LinkedIn profile.
              </p>
            </div>
          </div>
        )}

        {/* Gemini API Key Step */}
        {step === "gemini" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Your Gemini API Key
              </h2>
              <p className="text-gray-600">
                Enter your personal Gemini API key to unlock AI-powered content generation.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  id="gemini-key"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleSaveGeminiKey}
                disabled={loading || !geminiKey.trim()}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Save & Continue</span>
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                <strong>How to get your Gemini API key:</strong>
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Get API Key" or "Create API Key"</li>
                <li>Copy the key and paste it above</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                Your API key is encrypted and stored securely. We never share it with anyone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
