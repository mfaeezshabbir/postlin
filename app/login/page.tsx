"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { XCircle, Loader2, Linkedin, CheckCircle } from 'lucide-react';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard/drafts");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Postlin
          </h1>
          <p className="text-gray-600">
            Your AI-powered LinkedIn content assistant
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Authentication failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error === "OAuthCallback"
                      ? "Unable to sign in with LinkedIn. Please try again."
                      : "An error occurred during sign in."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  // callbackUrl intentionally set to / so middleware can route appropriately
                  await signIn("linkedin", { callbackUrl: "/" });
                } catch (err) {
                  console.error("Sign in error:", err);
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Connecting to LinkedIn...</span>
                </>
              ) : (
                <>
                  <Linkedin className="w-5 h-5" />
                  <span>Continue with LinkedIn</span>
                </>
              )}
            </button>

            {/* Features list */}
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                What you'll get:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>AI-powered content generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Automated posting to LinkedIn</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Analytics and insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6 px-4">
          By continuing, you agree to allow Postlin to access your LinkedIn
          profile and publish content on your behalf. We respect your privacy
          and will never post without your approval.
        </p>
        <div className="text-center mt-4">
          <a
            href="/terms"
            className="text-xs text-gray-500 hover:underline mr-3"
          >
            Terms
          </a>
          <a href="/privacy" className="text-xs text-gray-500 hover:underline">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
