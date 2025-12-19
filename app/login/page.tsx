"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { XCircle, Loader2, Linkedin, CheckCircle } from "lucide-react";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sunrise Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-yellow-200/40 via-orange-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/40 via-blue-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[550px] h-[550px] bg-gradient-to-t from-pink-200/40 via-rose-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Sign in to Postlin
          </h1>
          <p className="text-slate-600 text-base font-medium">
            Securely connect your account to get started
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 border border-white/50">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-rose-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-bold text-rose-900">
                    Authentication failed
                  </h3>
                  <p className="text-sm text-rose-700 mt-1">
                    {error === "OAuthCallback"
                      ? "Unable to sign in with LinkedIn. Please try again."
                      : "An error occurred during sign in."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-sky-900 mb-1">
                  Secure Authentication
                </h3>
                <p className="text-xs text-sky-700 leading-relaxed">
                  We use industry-standard OAuth 2.0 for secure sign-in. Your
                  credentials are never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  await signIn("google", { callbackUrl: "/onboarding" });
                } catch (err) {
                  console.error("Sign in error:", err);
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-gray-700" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  await signIn("linkedin", { callbackUrl: "/dashboard" });
                } catch (err) {
                  console.error("Sign in error:", err);
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      fill="#0A66C2"
                    />
                  </svg>
                  <span>Continue with LinkedIn</span>
                </>
              )}
            </Button>

            {/* What We Access */}
            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-3">
                What we access:
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Basic profile information</strong> - Your name and
                    email for account creation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>LinkedIn posting permission</strong> - Only when you
                    explicitly approve posts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No password access</strong> - We never see or store
                    your passwords
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-3 font-medium">
            Trusted by LinkedIn professionals worldwide
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6 px-4 leading-relaxed">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            className="text-sky-600 hover:text-sky-800 font-semibold hover:underline transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-sky-600 hover:text-sky-800 font-semibold hover:underline transition-colors"
          >
            Privacy Policy
          </a>
          . We will never post without your explicit approval.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-900 border-t-transparent"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
