"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import Logo from "@/components/brand/Logo";
import { Loader2, Linkedin, Key, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [geminiKey, setGeminiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch user profile to check onboarding status
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        
        // If user already has Gemini key, redirect to dashboard
        if (data.profile.hasGeminiKey) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSkipLinkedIn = () => {
    setCurrentStep(2);
  };

  const handleConnectLinkedIn = async () => {
    window.location.href = "/api/linkedin/connect?callbackUrl=/onboarding?step=2";
  };

  const handleSaveGeminiKey = async () => {
    setKeyError("");
    
    if (!geminiKey.trim()) {
      setKeyError("Please enter your Gemini API key");
      return;
    }

    if (!geminiKey.startsWith("AIzaSy")) {
      setKeyError("Invalid API key format. Gemini keys should start with 'AIzaSy'");
      return;
    }

    setSavingKey(true);
    try {
      const res = await fetch("/api/user/gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiKey }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setKeyError(data.error || "Failed to save API key");
      }
    } catch (error) {
      console.error("Error saving Gemini key:", error);
      setKeyError("Failed to save API key. Please try again.");
    } finally {
      setSavingKey(false);
    }
  };

  // Check URL params for step
  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "2" || step === "complete") {
      setCurrentStep(2);
    }
  }, [searchParams]);

  if (status === "loading" || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
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

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <div className={`w-24 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: LinkedIn Connect (Optional) */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Linkedin className="w-8 h-8 text-[#0A66C2]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect LinkedIn (Optional)
              </h2>
              <p className="text-gray-600">
                Connect your LinkedIn account to publish posts directly. You can skip this and add it later in settings.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleConnectLinkedIn}
                className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-3.5 px-6 rounded-xl"
              >
                <Linkedin className="w-5 h-5" />
                <span>Connect LinkedIn Account</span>
              </Button>

              <Button
                onClick={handleSkipLinkedIn}
                variant="outline"
                className="w-full"
              >
                Skip for now
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>Note:</strong> Without LinkedIn connected, you can still create posts manually and copy/paste them to LinkedIn.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Gemini API Key (Required) */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Key className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Your Gemini API Key
              </h2>
              <p className="text-gray-600">
                To use AI-powered content generation, you'll need your own Gemini API key. Don't worry, it's free to get started!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  id="geminiKey"
                  type="text"
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setKeyError("");
                  }}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {keyError && (
                  <p className="text-sm text-red-600 mt-2">{keyError}</p>
                )}
              </div>

              <Button
                onClick={handleSaveGeminiKey}
                disabled={savingKey}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl"
              >
                {savingKey ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900 mb-2">
                <strong>Don't have a Gemini API key?</strong>
              </p>
              <ol className="text-sm text-yellow-900 space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key"</li>
                <li>Copy the key and paste it above</li>
              </ol>
              <p className="text-xs text-yellow-800 mt-2">
                ℹ️ Your API key is encrypted and stored securely. We never share it with anyone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
