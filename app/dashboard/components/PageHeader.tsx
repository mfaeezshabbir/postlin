"use client";

import { Sparkles, LayoutGrid, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  title: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export default function PageHeader({
  title,
  searchQuery,
  onSearchChange,
  showSearch = true,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-white">{title}</h1>

      {showSearch && (
        <div className="flex-1 max-w-xl mx-auto w-full">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
            </div>
            <Input
              placeholder="Ask AI to find posts..."
              className="pl-10 bg-card border-white/10 text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary/50 rounded-xl h-12 transition-all"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-gray-400">
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-white hover:bg-white/5 bg-[#1A1F37] border border-white/5 h-10 w-10 rounded-lg"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-foreground hover:bg-white/5 bg-card border border-white/5 h-10 w-10 rounded-lg"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
