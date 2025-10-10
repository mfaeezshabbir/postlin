"use client";
import { Sparkles, Calendar, BarChart2 } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    desc: "Craft authentic, on-brand LinkedIn posts in seconds with AI that understands your tone.",
    color: "from-indigo-600 to-violet-500",
    accent: "bg-indigo-600",
    tags: ["Tone tailoring", "Smart variations"],
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Auto-schedule posts for peak engagement or build your own rhythm effortlessly.",
    color: "from-pink-600 to-purple-500",
    accent: "bg-pink-600",
    tags: ["Time optimization", "Recurring queues"],
  },
  {
    icon: BarChart2,
    title: "Performance Analytics",
    desc: "Visualize impressions, engagement, and growth with actionable insights.",
    color: "from-emerald-600 to-green-500",
    accent: "bg-emerald-600",
    tags: ["Engagement trends", "Post comparison"],
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          What Makes Postlin Powerful
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-14">
          Simplify your content workflow from ideation to analytics, all in one
          unified dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc, color, accent, tags }) => (
            <div
              key={title}
              className="relative rounded-3xl p-8 bg-white/70 backdrop-blur-md border border-white/10 shadow-xl hover:-translate-y-2 transition-all hover:shadow-2xl"
            >
              <div
                className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}
              >
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-6">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-3">{desc}</p>
              <ul className="flex flex-wrap justify-center gap-2 mt-4 text-xs text-gray-500">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className={`px-3 py-1 bg-white/40 rounded-full flex items-center gap-2`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
