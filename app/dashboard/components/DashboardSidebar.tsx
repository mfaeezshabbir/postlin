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
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SidebarProfile from "./SidebarProfile";

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface DashboardSidebarProps {
  user: User;
}

const navigation = [
  { name: "All Posts", href: "/dashboard", icon: LayoutGrid },
  { name: "Drafts", href: "/dashboard/drafts", icon: FileText, count: 5 }, // Mock count
  { name: "Scheduled", href: "/dashboard/scheduled", icon: Calendar, count: 2 },
  {
    name: "Published",
    href: "/dashboard/history",
    icon: CheckCircle,
    count: 17,
  },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

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
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isMobileOpen ? <X /> : <Menu />}
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
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              {/* Use standard img or Avatar component if available. Using simple div for now */}
              <div className="h-10 w-10 rounded-full bg-indigo-500 overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white font-semibold">
                    {user.name?.[0] || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">Pro Workspace</p>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-6 flex-1 overflow-y-auto">
            {/* Create Button */}
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 py-6 text-base font-medium rounded-xl">
              <Plus className="mr-2 h-5 w-5" />
              Create New Post
            </Button>

            {/* Library */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Library
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
                          ? "bg-accent/10 text-primary"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-blue-400" : "text-gray-500"
                          )}
                        />
                        {item.name}
                      </div>
                      {item.count !== undefined && (
                        <span
                          className={cn(
                            "text-xs",
                            isActive ? "text-blue-400" : "text-gray-600"
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
          </div>

          {/* Bottom: Settings */}
          <div className="p-4 border-t border-white/5">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
