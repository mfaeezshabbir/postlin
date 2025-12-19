"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/brand/Logo";
import { CheckCircle, Linkedin, Key, Loader2, AlertCircle } from "lucide-react";
import { GEMINI_API_KEY_MIN_LENGTH } from "@/lib/constants";

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "linkedin" | "gemini">(
    "welcome"
  );
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
          } else if (
            data.linkedInConnected &&
            !data.hasGeminiKey &&
            step === "welcome"
          ) {
            setStep("gemini");
          } else if (data.hasGeminiKey) {
            // Already fully onboarded, redirect to dashboard
            router.push("/dashboard/drafts");
          } else if (data.linkedInConnected && !data.hasGeminiKey) {
            setStep("gemini");
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

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
      setError(
        `Please enter a valid Gemini API key (minimum ${GEMINI_API_KEY_MIN_LENGTH} characters)`
      );
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
        // Avoid displaying raw server error messages to the user to prevent leaking internal details.
        setError("We couldn't save your Gemini API key. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sunrise Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-yellow-200/40 via-orange-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[15%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-cyan-200/40 via-blue-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-gradient-to-t from-pink-200/40 via-rose-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Welcome to Postlin!
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${
              step === "welcome" ? "text-sky-600" : "text-slate-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                step === "welcome"
                  ? "bg-sky-500 text-white shadow-sky-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              1
            </div>
            <span className="text-sm font-bold hidden sm:inline">Welcome</span>
          </div>
          <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
          <div
            className={`flex items-center gap-2 ${
              step === "linkedin" ? "text-sky-600" : "text-slate-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                step === "linkedin"
                  ? "bg-sky-500 text-white shadow-sky-200"
                  : step === "gemini"
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {step === "gemini" || profile?.linkedInConnected ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                "2"
              )}
            </div>
            <span className="text-sm font-bold hidden sm:inline">LinkedIn</span>
          </div>
          <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
          <div
            className={`flex items-center gap-2 ${
              step === "gemini" ? "text-sky-600" : "text-slate-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                step === "gemini"
                  ? "bg-sky-500 text-white shadow-sky-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              3
            </div>
            <span className="text-sm font-bold hidden sm:inline">AI Setup</span>
          </div>
        </div>

        {/* Welcome Step */}
        {step === "welcome" && (
          <Card className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Getting Started
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Postlin helps you create and schedule LinkedIn content with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <CheckCircle className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sky-900">
                      You're signed in with Google
                    </h3>
                    <p className="text-sm text-sky-700 mt-1">
                      Your account is ready. Now let's connect the services you
                      need.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep("linkedin")}
                className="w-full bg-[#4B6BFB] hover:bg-[#3d5ce0] text-white font-bold py-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(75,107,251,0.4)] hover:shadow-[0_8px_30px_-6px_rgba(75,107,251,0.5)] hover:-translate-y-0.5 transition-all"
                size="lg"
              >
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LinkedIn Connection Step */}
        {step === "linkedin" && (
          <Card className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Linkedin className="w-6 h-6" />
                Connect LinkedIn (Optional)
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Connect your LinkedIn account to publish posts directly from
                Postlin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile?.linkedInConnected ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-emerald-900">
                      LinkedIn Connected
                    </h3>
                    <p className="text-sm text-emerald-700 mt-1">
                      Your LinkedIn account is connected and ready to use.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 font-medium">
                    Connecting LinkedIn allows you to:
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium">
                        Schedule and auto-publish posts
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium">
                        View post analytics and engagement
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium">
                        Manage your content calendar
                      </span>
                    </li>
                  </ul>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> You can skip this step and connect
                      LinkedIn later from settings. You'll still be able to
                      create posts and copy them manually.
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
                    className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-2xl shadow-[0_4px_20px_-4px_rgba(10,102,194,0.3)] hover:shadow-[0_8px_30px_-6px_rgba(10,102,194,0.4)] hover:-translate-y-0.5 transition-all"
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
                    className="flex-1 bg-[#4B6BFB] hover:bg-[#3d5ce0] text-white font-bold rounded-2xl shadow-[0_4px_20px_-4px_rgba(75,107,251,0.4)] hover:shadow-[0_8px_30px_-6px_rgba(75,107,251,0.5)] hover:-translate-y-0.5 transition-all"
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
          <Card className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Key className="w-6 h-6" />
                Add Your Gemini API Key
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Required to unlock AI-powered content generation features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                  <h3 className="font-bold text-sky-900 mb-2">
                    Why do I need a Gemini API key?
                  </h3>
                  <p className="text-sm text-sky-700">
                    Postlin uses Google's Gemini AI to help you generate
                    high-quality LinkedIn posts. You'll need your own API key to
                    use these features.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">
                    How to get a Gemini API key:
                  </h3>
                  <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                    <li>
                      Visit{" "}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:underline font-semibold"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Get API Key" or "Create API Key"</li>
                    <li>Copy your API key and paste it below</li>
                  </ol>
                </div>

                <div>
                  <label
                    htmlFor="geminiKey"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Gemini API Key *
                  </label>
                  <input
                    id="geminiKey"
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Your API key is encrypted and stored securely. We never
                    share it.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                    <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSaveGeminiKey}
                className="w-full bg-[#4B6BFB] hover:bg-[#3d5ce0] text-white font-bold py-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(75,107,251,0.4)] hover:shadow-[0_8px_30px_-6px_rgba(75,107,251,0.5)] hover:-translate-y-0.5 transition-all"
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
        <p className="text-center text-xs text-slate-600 mt-6 font-medium">
          Need help?{" "}
          <a
            href="/support"
            className="text-sky-600 hover:text-sky-800 font-bold hover:underline transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
