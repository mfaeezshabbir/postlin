"use client";

import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12 lg:mb-24">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            From raw idea to viral post in four simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Zigzag Snake) for Desktop */}
          <div className="hidden lg:block absolute top-20 left-[10%] right-[10%] bottom-0 pointer-events-none -z-10 h-[400px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1100 300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="gradientLine"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              {/* Zigzag Path: Top -> Bottom -> Top -> Bottom */}
              <path
                d="M 100 50 C 250 50, 250 250, 400 250 S 550 50, 700 50 S 850 250, 1000 250"
                fill="none"
                stroke="url(#gradientLine)"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="opacity-50"
              />

              {/* Floating Arrows on the path */}
              {/* Arrow 1: Step 1 -> 2 */}
              <g transform="translate(250, 150) rotate(35)">
                <path
                  d="M0 0 L12 6 L0 12"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Arrow 2: Step 2 -> 3 */}
              <g transform="translate(550, 150) rotate(-35)">
                <path
                  d="M0 0 L12 6 L0 12"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Arrow 3: Step 3 -> 4 */}
              <g transform="translate(850, 150) rotate(35)">
                <path
                  d="M0 0 L12 6 L0 12"
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10">
            {/* Step 1: Share Vision (TOP) */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-40 h-40 relative mb-6 transition-transform hover:scale-105 duration-300">
                {/* Blob Backing */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-xl opacity-60"></div>
                {/* Icon Construction */}
                <div className="relative w-full h-full bg-white rounded-full border-2 border-blue-50 shadow-lg flex items-center justify-center overflow-hidden">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-end justify-center overflow-hidden mb-[-20px] relative z-10">
                    <div className="w-10 h-10 bg-indigo-300 rounded-full opacity-50 mb-[-15px]"></div>
                  </div>
                  {/* Floating Bulbs */}
                  <div className="absolute top-5 left-1/4 animate-bounce hover:scale-110 transition">
                    <div className="w-6 h-8 bg-yellow-300 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.6)] flex items-center justify-center">
                      <div className="w-2 h-3 bg-white/60 rounded-full transform -rotate-12 translate-x-[1px]"></div>
                    </div>
                    <div className="w-3 h-2 bg-slate-400 mx-auto mt-[-1px]"></div>
                  </div>
                  <div className="absolute top-3 right-1/3 animate-bounce delay-300 hover:scale-110 transition">
                    <div className="w-4 h-6 bg-yellow-300 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.6)]"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                1. Share Your Vision <br />
                <span className="text-sm font-medium text-slate-500">
                  (AI Brainstorming)
                </span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                Easily turn your scattered thoughts into clear content drafts.
              </p>
            </div>

            {/* Arrow visual for mobile/tablet flow */}
            <div className="lg:hidden flex justify-center -my-6">
              <ArrowRight className="w-6 h-6 text-slate-300 rotate-90 md:rotate-0" />
            </div>

            {/* Step 2: Generate (BOTTOM - Pushed Down) */}
            <div className="flex flex-col items-center text-center group lg:mt-32">
              <div className="w-40 h-40 relative mb-6 transition-transform hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-xl opacity-60"></div>
                <div className="relative w-full h-full bg-white rounded-full border-2 border-indigo-50 shadow-lg flex items-center justify-center p-8">
                  <div className="w-20 h-24 bg-slate-50 border border-slate-200 rounded-lg relative flex flex-col p-2 shadow-sm">
                    <div className="w-full h-1.5 bg-slate-200 rounded mb-1.5"></div>
                    <div className="w-full h-1.5 bg-slate-200 rounded mb-1.5"></div>
                    <div className="w-2/3 h-1.5 bg-slate-200 rounded mb-1.5"></div>

                    {/* Magic Wand / Cursor */}
                    <div className="absolute -right-3 -bottom-3 w-8 h-8 pointer-events-none">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-full h-full text-indigo-500 drop-shadow-md"
                      >
                        <path
                          d="M3 21l1.9-5.7a8.5 8.5 0 1114.8-8.2L21 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    {/* Sparkles */}
                    <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse">
                      ✨
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                2. Generate & Optimize <br />
                <span className="text-sm font-medium text-slate-500">
                  (Smart AI Drafting)
                </span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                AI crafts refined, keyword-optimized content instantly.
              </p>
            </div>

            <div className="lg:hidden flex justify-center -my-6">
              <ArrowRight className="w-6 h-6 text-slate-300 rotate-90 md:rotate-0" />
            </div>

            {/* Step 3: Schedule (TOP) */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-40 h-40 relative mb-6 transition-transform hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-xl opacity-60"></div>
                <div className="relative w-full h-full bg-white rounded-full border-2 border-purple-50 shadow-lg flex items-center justify-center">
                  {/* Calendar */}
                  <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-xl relative shadow-md">
                    <div className="h-6 w-full bg-indigo-500 rounded-t-lg"></div>
                    <div className="p-2 grid grid-cols-4 gap-1">
                      <div className="aspect-square bg-slate-100 rounded-sm"></div>
                      <div className="aspect-square bg-indigo-100 rounded-sm relative">
                        <div className="absolute inset-0.5 bg-indigo-500 rounded-full"></div>
                      </div>
                      <div className="aspect-square bg-slate-100 rounded-sm"></div>
                      <div className="aspect-square bg-slate-100 rounded-sm"></div>
                    </div>
                  </div>
                  {/* Clock */}
                  <div className="absolute -right-1 -bottom-1 w-12 h-12 bg-white rounded-full border-2 border-slate-200 shadow-lg flex items-center justify-center">
                    <div className="w-1 h-3 bg-slate-800 rounded-full absolute top-2 left-1/2 -translate-x-1/2 transform origin-bottom rotate-45"></div>
                    <div className="w-0.5 h-4 bg-red-400 rounded-full absolute top-2 left-1/2 -translate-x-1/2 transform origin-bottom -rotate-12"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                3. Schedule for Impact <br />
                <span className="text-sm font-medium text-slate-500">
                  (Peak Timing)
                </span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                Post when your audience is awake and active.
              </p>
            </div>

            <div className="lg:hidden flex justify-center -my-6">
              <ArrowRight className="w-6 h-6 text-slate-300 rotate-90 md:rotate-0" />
            </div>

            {/* Step 4: Growth (BOTTOM - Pushed Down) */}
            <div className="flex flex-col items-center text-center group lg:mt-32">
              <div className="w-40 h-40 relative mb-6 transition-transform hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full blur-xl opacity-60"></div>
                <div className="relative w-full h-full bg-white rounded-full border-2 border-pink-50 shadow-lg flex items-center justify-center">
                  <div className="w-24 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg relative overflow-hidden flex items-end px-2 pb-2 gap-1">
                    <div className="w-1/4 h-1/3 bg-white/20 rounded-t-sm"></div>
                    <div className="w-1/4 h-1/2 bg-white/40 rounded-t-sm"></div>
                    <div className="w-1/4 h-3/4 bg-white/60 rounded-t-sm"></div>
                    <div className="w-1/4 h-full bg-white rounded-t-sm"></div>

                    {/* Graphic Arrow */}
                    <div className="absolute top-2 right-2 text-white">
                      <svg
                        className="w-8 h-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                4. Publish & Convert <br />
                <span className="text-sm font-medium text-slate-500">
                  (Growth & Analytics)
                </span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                Watch your meaningful engagement and networks grow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
