import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  isAuthenticated?: boolean;
}

export default function CTA({ isAuthenticated }: CTAProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-r from-indigo-600 to-purple-600">
      {/* Decorative shapes */}
      <div
        aria-hidden
        className="absolute -left-10 -top-10 w-44 h-44 bg-white/6 rounded-full blur-3xl transform rotate-12"
      />
      <div
        aria-hidden
        className="absolute -right-20 -bottom-16 w-64 h-64 bg-white/4 rounded-full blur-2xl"
      />

      <div className="relative z-10 bg-white/6 backdrop-blur-md rounded-xl px-6 py-8 md:px-10 md:py-12 text-white flex flex-col lg:flex-row items-center gap-8">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 text-sm font-medium tracking-wide">
            Try Postlin — Free
            <svg
              className="w-4 h-4 opacity-90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v6" />
              <path d="M12 16v6" />
              <path d="M4 12h6" />
              <path d="M14 12h6" />
            </svg>
          </span>

          <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
            Create standout LinkedIn posts in minutes
          </h2>

          <p className="mt-3 text-white/90 max-w-md">
            AI-driven drafts, scheduling, and analytics — all in one elegant
            workflow. Move from idea to published in a few clicks.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={isAuthenticated ? "/dashboard/drafts" : "/login"}
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-3 rounded-lg font-semibold shadow-lg transform transition-transform hover:scale-[1.03]"
              aria-label={isAuthenticated ? "Open dashboard" : "Get started"}
            >
              {isAuthenticated ? "Open Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/20 text-white/95 bg-white/6 hover:bg-white/8 transition"
              aria-label="Learn more about features"
            >
              Learn features
            </Link>
          </div>
        </div>

        {/* Visual mockup */}
        <div className="flex-shrink-0 w-full sm:w-72 lg:w-80">
          <div className="relative rounded-xl bg-gradient-to-b from-white/6 to-white/3 p-4 shadow-xl transform transition-transform hover:-translate-y-1">
            <div className="h-2 w-16 rounded-full bg-white/20 mb-3" />
            <div className="space-y-3">
              <div className="h-3 rounded-full bg-white/12 w-5/6 animate-pulse" />
              <div className="h-3 rounded-full bg-white/12 w-4/6 animate-pulse" />
              <div className="h-3 rounded-full bg-white/12 w-3/6 animate-pulse" />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-white/80">
              <span>Next post ready</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8">
                Schedule
              </span>
            </div>

            {/* tiny sparkle */}
            <svg
              aria-hidden
              className="absolute -top-3 -right-3 w-8 h-8 opacity-40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <path d="M12 2l1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8L12 2z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
