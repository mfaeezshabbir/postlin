import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  isAuthenticated?: boolean;
}

export default function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32 bg-[#FFFDF5]">
      {/* Sunrise Background Gradients */}
      <div className="absolute inset-0 z-0 bg-[#FFFDF5]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-yellow-200/40 via-orange-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-200/40 via-blue-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] bg-gradient-to-t from-pink-200/40 via-rose-100/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto max-w-7xl text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white border border-yellow-200 shadow-[0_2px_10px_rgba(250,204,21,0.15)] backdrop-blur-sm animate-fade-in-up hover:scale-105 transition-transform cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          <span className="text-sm font-bold text-slate-800 tracking-wide">
            Experience Your First Win with Postlin.
          </span>
        </div>

        {/* Headlines */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8 animate-fade-in-up delay-100 drop-shadow-sm">
          Stop Scrolling, <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span className="relative z-10">Start Growing on LinkedIn</span>
            {/* Highlight Decoration */}
            <div className="absolute -inset-1 top-auto h-4 bg-yellow-200/60 -skew-y-2 -z-0 rounded-full"></div>
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed animate-fade-in-up delay-200 font-medium">
          Your audience is waiting for your authentic voice. Let Postlin amplify
          it and turn views into inbound opportunities.
        </p>

        {/* 3-Step Process Visualization with Sunrise Palette */}
        <div className="relative max-w-6xl mx-auto mb-16 animate-fade-in-up delay-300 perspective-1000">
          {/* Connecting Arrows (Desktop) */}
          <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-between px-[20%] pointer-events-none z-20">
            <ArrowRight className="w-6 h-6 text-slate-300/80" />
            <ArrowRight className="w-6 h-6 text-slate-300/80" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1: Share Idea (Green/Teal for "Go") */}
            <div className="group relative bg-[#F0FDF4] rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-green-100 hover:shadow-[0_20px_40px_-15px_rgba(22,163,74,0.1)]">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  1. Share Your Idea
                </h3>
              </div>

              {/* Visual */}
              <div className="bg-white rounded-3xl p-6 h-48 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
                <div className="w-full h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-start gap-2 relative">
                  <span className="text-xs text-slate-400 font-medium">
                    Enter your idea as text...
                  </span>
                  <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
                  <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                  <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>

                  <div className="absolute bottom-3 right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-400/30">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Generate & Refine (Blue/Sky for "Intelligence") - Sunrise Style */}
            <div className="group relative bg-[#F0F9FF] rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-sky-100 hover:shadow-[0_20px_40px_-15px_rgba(2,132,199,0.1)]">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  2. Generate & Refine
                </h3>
              </div>

              {/* Visual */}
              <div className="bg-white rounded-3xl p-4 h-48 flex items-center justify-center gap-2 shadow-sm relative overflow-hidden">
                <div className="flex-1 flex flex-col items-center gap-2 bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Before
                  </span>
                  <div className="w-full h-16 bg-white border border-slate-100 rounded-lg shadow-sm"></div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-400" />
                <div className="flex-1 flex flex-col items-center gap-2 bg-sky-50 p-2 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-600 uppercase">
                    Predicted
                  </span>
                  <div className="flex items-end gap-1 h-16 pb-1">
                    <div className="w-2 bg-sky-300 h-6 rounded-t-sm"></div>
                    <div className="w-2 bg-sky-500 h-10 rounded-t-sm"></div>
                    <div className="w-2 bg-sky-400 h-8 rounded-t-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Publish (Warm Orange/Pink for "Celebration") */}
            <div className="group relative bg-[#FFF7ED] rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-orange-100 hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.1)]">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  3. Publish & Celebrate
                </h3>
              </div>

              {/* Visual */}
              <div className="bg-white rounded-3xl p-6 h-48 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/confetti-doodles.png')] opacity-10"></div>
                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 mb-3 transform rotate-3 transition-transform group-hover:rotate-12">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-800">Post Published!</p>
                <span className="text-xs text-orange-500 font-medium mt-1">
                  View Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-500">
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#4B6BFB] text-white rounded-2xl font-bold text-lg shadow-[0_10px_30px_-10px_rgba(75,107,251,0.4)] hover:shadow-[0_20px_40px_-15px_rgba(75,107,251,0.5)] hover:-translate-y-1 transition-all w-full sm:w-auto"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
          </Link>
        </div>
      </div>
    </section>
  );
}
