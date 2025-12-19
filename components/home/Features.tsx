"use client";
import {
  MessageCircle,
  Clock,
  BarChart3,
  Users,
  Zap,
  Search,
} from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Feature 1: Authentic Voice (Green/Teal Theme) */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-32">
          {/* Visual (Left) */}
          <div className="w-full lg:w-1/2 relative bg-[#F0FDF4] rounded-[3rem] p-8 sm:p-12 border border-green-50">
            {/* Mockup */}
            <div className="relative bg-white rounded-3xl shadow-xl p-6 border border-gray-100/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0"></div>
                <div>
                  <div className="h-3 bg-slate-100 rounded-full w-24 mb-2"></div>
                  <div className="h-2 bg-slate-50 rounded-full w-40"></div>
                </div>
              </div>
              {/* Voice Waves / Connection */}
              <div className="flex flex-col items-center justify-center py-4 relative">
                <div className="flex items-center gap-1 mb-2">
                  <span className="w-1 h-4 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="w-1 h-8 bg-green-500 rounded-full animate-pulse delay-75"></span>
                  <span className="w-1 h-6 bg-green-400 rounded-full animate-pulse delay-100"></span>
                  <span className="w-1 h-10 bg-green-600 rounded-full animate-pulse delay-150"></span>
                  <span className="w-1 h-5 bg-green-400 rounded-full animate-pulse delay-200"></span>
                </div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-green-200"></div>
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold relative z-10 flex items-center gap-1 shadow-lg shadow-green-600/20">
                  <Zap className="w-3 h-3" /> Postlin
                </div>
              </div>
              {/* Optimized Output */}
              <div className="mt-4 bg-green-50/50 rounded-xl p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                    AI
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="h-2 bg-green-200/50 rounded-full w-full"></div>
                    <div className="h-2 bg-green-200/50 rounded-full w-5/6"></div>
                    <div className="h-2 bg-green-200/50 rounded-full w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text (Right) */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
              Authentic Voice Amplification
            </h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Don't Sound Like Everyone Else. <br />
              <span className="text-green-600">
                Sound Like You, Only Better.
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Postlin captures your unique tone. You provide the insight; we
              provide the reach. No soulless AI drafts, just your voice
              amplified for maximum impact.
            </p>
          </div>
        </div>

        {/* Feature 2: Smart Timing (Blue/Sky Theme) */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20 mb-32">
          {/* Visual (Right) */}
          <div className="w-full lg:w-1/2 relative bg-[#F0F9FF] rounded-[3rem] p-8 sm:p-12 border border-sky-50">
            <div className="relative bg-white rounded-3xl shadow-xl p-6 border border-gray-100/50 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-slate-700">
                  Calendar Heatmap
                </span>
                <Clock className="w-5 h-5 text-sky-500" />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {/* Fake Heatmap */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const intensity = [100, 200, 50, 300, 400, 100, 50][i % 7];
                  const color =
                    intensity > 300
                      ? "bg-sky-500 shadow-sky-500/50 shadow-lg scale-110 z-10"
                      : intensity > 200
                      ? "bg-sky-400"
                      : intensity > 100
                      ? "bg-sky-200"
                      : "bg-gray-100";
                  const isBestTime = intensity > 350;

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md ${color} relative flex items-center justify-center transition-all hover:scale-110`}
                    >
                      {isBestTime && (
                        <div className="absolute -top-6 bg-slate-800 text-white text-[10px] py-0.5 px-2 rounded whitespace-nowrap z-20">
                          Best Time
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="bg-sky-50 px-4 py-2 rounded-lg border border-sky-100 text-sky-700 text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                  96% Engagement Prob.
                </div>
              </div>
            </div>
          </div>

          {/* Text (Left) */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
              Smart Timing & Scheduling
            </h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Stop Guessing, <br />
              <span className="text-sky-600">
                Start Timing for Maximum Impact.
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Schedule posts for when your audience is *actually* online and
              engaged. Simple insights, better results. It's like having a
              growth mentor for your calendar.
            </p>
          </div>
        </div>

        {/* Feature 3: Analytics (Purple/Pink Theme) */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Visual (Left) */}
          <div className="w-full lg:w-1/2 relative bg-[#FDF4FF] rounded-[3rem] p-8 sm:p-12 border border-purple-50">
            <div className="relative bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100/50">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Growth</h4>
                    <p className="text-xs text-slate-500">+127% Last 30 Days</p>
                  </div>
                </div>
              </div>
              {/* Chart Area */}
              <div className="h-40 flex items-end justify-between gap-2 px-2">
                {[30, 45, 35, 60, 55, 75, 40, 65, 80, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-purple-200 rounded-t-sm relative group hover:bg-purple-300 transition-colors"
                    style={{ height: `${h}%` }}
                  >
                    {h === 95 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                        Viral Post
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Insight Cards */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Top Topic</p>
                  <p className="font-semibold text-slate-800">#AILeadership</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Audience</p>
                  <p className="font-semibold text-slate-800">
                    Founders & CTOs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text (Right) */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
              Actionable Insights & Growth
            </h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Understand *Why* You're Growing. <br />
              <span className="text-purple-600">Replicate Your Success.</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Traditional wisdom packaged with modern data. Simple explanations,
              not overwhelming charts. Learn what works and compound your
              growth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
