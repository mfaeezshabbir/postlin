import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

interface HeroProps {
  isAuthenticated?: boolean;
}

export default function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        {/* large decorative accents hidden on very small screens */}
        <div className="hidden sm:block absolute -left-40 top-0 w-[520px] h-[420px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl transform rotate-12 opacity-70"></div>
        <div className="hidden sm:block absolute -right-40 bottom-0 w-[420px] h-[320px] bg-gradient-to-br from-rose-400 to-yellow-300 rounded-3xl transform -rotate-6 opacity-60"></div>

        {/* small decorative accent for XS */}
        <div className="sm:hidden absolute left-0 top-0 w-40 h-32 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl opacity-40 transform rotate-6"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          {/* Left: Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-medium">
                New · AI-first LinkedIn toolkit
              </span>
              <span className="text-sm text-gray-400 hidden sm:inline">
                No credit card • Easy setup
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Write smarter. Schedule easier.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                The modern LinkedIn assistant
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
              Generate engaging post ideas, polish your voice with AI, and
              automate publishing — all with deep analytics and LinkedIn-native
              workflows.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start w-full">
              <Link
                href={isAuthenticated ? "/dashboard/drafts" : "/login"}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:scale-[1.02] transition-transform justify-center w-full sm:w-auto"
                aria-label={
                  isAuthenticated ? "Go to Dashboard" : "Get Started Free"
                }
              >
                <span>
                  {isAuthenticated
                    ? "Open Dashboard"
                    : "Get Started — it's free"}
                </span>
                <ArrowRight className="w-4 h-4 opacity-90" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-slate-800 rounded-full font-medium shadow-sm hover:shadow-md transition justify-center w-full sm:w-auto"
                aria-label="Learn more"
              >
                Learn more
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 justify-center lg:justify-start text-sm text-gray-500">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur rounded-full px-3 py-1 border border-gray-100 shadow-sm">
                <strong className="text-slate-800">AI Drafts</strong>
                <span className="text-xs text-gray-400">Polish your voice</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur rounded-full px-3 py-1 border border-gray-100 shadow-sm">
                <strong className="text-slate-800">Scheduler</strong>
                <span className="text-xs text-gray-400">
                  Auto-post at peak times
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur rounded-full px-3 py-1 border border-gray-100 shadow-sm">
                <strong className="text-slate-800">Analytics</strong>
                <span className="text-xs text-gray-400">Understand growth</span>
              </div>
            </div>
          </div>

          {/* Right: Mockup / Visual */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative z-50">
            <div
              className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[520px] rounded-2xl bg-gradient-to-b from-white/80 to-white/60 border border-gray-100 shadow-2xl p-4"
              aria-hidden
            >
              {/* Header of mockup */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                  <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                  <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                </div>
                <div className="text-xs text-gray-400">Post Preview</div>
              </div>

              {/* Post card */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 rounded-full w-3/4 mb-3"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-full mb-2"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-5/6"></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <div>Scheduled • Tomorrow · 9:00 AM</div>
                  <div className="inline-flex items-center gap-2 bg-white/50 px-2 py-1 rounded-full border text-slate-600">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M7 7h10M7 12h6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Edit
                  </div>
                </div>
              </div>

              {/* small stats */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">
                    1.2k
                  </div>
                  <div className="mt-1">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">
                    240
                  </div>
                  <div className="mt-1">Engagements</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">18</div>
                  <div className="mt-1">Comments</div>
                </div>
              </div>
            </div>

            {/* subtle floating accent */}
            <div className="hidden lg:block absolute right-6 lg:right-24 top-12 lg:top-16 w-36 h-24 bg-white/40 rounded-2xl blur-md opacity-60 transform rotate-6"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
