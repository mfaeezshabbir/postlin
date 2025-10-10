"use client";

import { Link2, Sparkles, Edit3, BarChart3 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Connect LinkedIn",
      desc: "Sign in securely and give posting access with one click.",
      icon: Link2,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      id: 2,
      title: "AI Generate Drafts",
      desc: "Get AI-powered ideas and tailored post variants instantly.",
      icon: Sparkles,
      gradient: "from-emerald-400 to-green-500",
    },
    {
      id: 3,
      title: "Review & Edit",
      desc: "Polish your drafts, add hashtags, or schedule for later.",
      icon: Edit3,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      id: 4,
      title: "Publish & Analyze",
      desc: "Post or schedule while tracking engagement in real time.",
      icon: BarChart3,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 px-6 bg-gradient-to-b from-gray-50 to-white/80">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="hidden sm:block absolute -left-40 top-0 w-[420px] h-[360px] bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl rotate-12 opacity-60" />
        <div className="hidden sm:block absolute -right-40 bottom-0 w-[400px] h-[300px] bg-gradient-to-br from-pink-400 to-yellow-300 rounded-3xl -rotate-6 opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <header className="mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-600 mb-2">
            Simple, powerful workflow
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            How it works — craft and publish in minutes
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Connect your account, let AI generate posts, refine them, and
            publish or schedule — all while tracking performance.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {steps.map(({ id, title, desc, icon: Icon, gradient }) => (
            <div
              key={id}
              className="group bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
