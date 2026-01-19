"use client";

import {
  Construction,
  BarChart2,
  TrendingUp,
  Sparkles,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PerformancePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full min-h-[600px] w-full items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-card border border-border p-8 rounded-3xl shadow-2xl skew-y-1 transform transition-all hover:skew-y-0 hover:scale-105 duration-300 group">
          <div className="absolute -top-3 -right-3 bg-yellow-500/10 text-yellow-500 p-2 rounded-xl border border-yellow-500/20 rotate-12 group-hover:rotate-0 transition-all">
            <Construction className="w-6 h-6 animate-pulse" />
          </div>
          <div className="bg-background/50 p-4 rounded-2xl mb-4">
            <BarChart2 className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex gap-2 justify-center opacity-50">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <Sparkles className="w-4 h-4 text-purple-500" />
            <Timer className="w-4 h-4 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
          Analytics Coming Soon
        </h1>
        <p className="text-muted-foreground text-lg">
          We're building a powerful analytics dashboard to help you track your
          content performance.
        </p>

        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
            In Development
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
            Coming Q1
          </span>
        </div>

        <div className="pt-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:bg-accent/50"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
