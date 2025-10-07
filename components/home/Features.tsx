import React from "react";
import { Sparkles, Calendar, BarChart2 } from "lucide-react";

export default function Features(): React.ReactElement {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-16 grid gap-8 grid-cols-1 md:grid-cols-3"
      aria-label="Key features"
    >
      <div className="relative overflow-hidden rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-white/10 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl">
        <div
          aria-hidden
          className="absolute -left-16 -top-10 w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-200 to-violet-100 opacity-30 blur-3xl"
        />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex-none w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight text-gray-900">
              AI Content Generation
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Create authentic, on-brand LinkedIn posts in seconds using
              context-aware AI that adapts to your voice.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <li className="inline-flex items-center gap-2 bg-white/40 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Tone tailoring
              </li>
              <li className="inline-flex items-center gap-2 bg-white/40 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Variations & hooks
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-white/10 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl">
        <div
          aria-hidden
          className="absolute -right-16 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-tr from-pink-100 to-purple-100 opacity-30 blur-3xl"
        />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex-none w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-purple-500 text-white flex items-center justify-center shadow-md">
            <Calendar className="w-7 h-7" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight text-gray-900">
              Smart Scheduling
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Auto-schedule posts at peak engagement windows or pick your own
              cadence with calendar-first controls.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <li className="inline-flex items-center gap-2 bg-white/40 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600" />
                Time optimization
              </li>
              <li className="inline-flex items-center gap-2 bg-white/40 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600" />
                Recurring queues
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-white/10 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl">
        <div
          aria-hidden
          className="absolute -left-10 -bottom-12 w-56 h-56 rounded-full bg-gradient-to-tr from-emerald-100 to-green-100 opacity-30 blur-3xl"
        />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex-none w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md">
            <BarChart2 className="w-7 h-7" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight text-gray-900">
              Performance Analytics
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Understand what resonates — impressions, engagement and follower
              growth visualized with actionable suggestions.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <li className="inline-flex items-center gap-2 bg-white/40 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Engagement trends
              </li>
              <li className="inline-flex items-center gap-2 bg-white/40 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Post comparison
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
