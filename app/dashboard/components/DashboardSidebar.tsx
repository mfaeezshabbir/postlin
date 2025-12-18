"use client";

import Logo from "@/components/brand/Logo";
import {
  LayoutGrid,
  FileText,
  Calendar,
  CheckCircle,
  Settings,
  Plus,
  Menu,
  X,
  BarChart2,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SidebarProfile from "./SidebarProfile";
import Image from "next/image";

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface DashboardSidebarProps {
  user: User;
  stats?: {
    drafts: number;
    scheduled: number;
    published: number;
  };
  onCreateClick?: () => void;
}

export default function DashboardSidebar({
  user,
  stats = { drafts: 0, scheduled: 0, published: 0 },
  onCreateClick,
}: DashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: "All Posts",
      href: "/dashboard/all",
      icon: LayoutGrid,
      count: stats.drafts + stats.scheduled + stats.published || undefined,
    },
    {
      name: "Drafts",
      href: "/dashboard/drafts",
      icon: FileText,
      count: stats.drafts || undefined,
    },
    {
      name: "Scheduled",
      href: "/dashboard/scheduled",
      icon: Calendar,
      count: stats.scheduled || undefined,
    },
    {
      name: "Published",
      href: "/dashboard/history",
      icon: CheckCircle,
      count: stats.published || undefined,
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <Logo className="w-full h-full text-primary" />
          </div>
          <span className="font-semibold">Postlin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-sidebar">
          {/* Top: Profile */}
          <div className="p-4 border-b border-sidebar-border">
            <SidebarProfile user={user} />
          </div>

          <div className="p-4 flex flex-col gap-6 flex-1 overflow-y-auto">
            {/* Create Button */}
            <Button
              onClick={onCreateClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 py-6 text-base font-medium rounded-xl transition-all active:scale-[0.98]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Post
            </Button>

            {/* Content Library */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Content Library
              </h3>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-gray-400 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-sidebar-primary" : "text-gray-500"
                          )}
                        />
                        {item.name}
                      </div>
                      {item.count !== undefined && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full bg-white/5",
                            isActive
                              ? "text-sidebar-primary bg-sidebar-primary/10"
                              : "text-gray-600"
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Analytics Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Analytics
              </h3>
              <nav className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer disabled opacity-50">
                  <BarChart2 className="h-5 w-5 text-gray-500" />
                  Performance
                </div>
              </nav>
            </div>
          </div>

          {/* Bottom: Settings */}
          <div className="p-4 border-t border-sidebar-border">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <Settings className="h-5 w-5 text-gray-500" />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
