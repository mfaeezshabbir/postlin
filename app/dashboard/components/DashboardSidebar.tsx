"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { usePathname } from "next/navigation";
import {
  FileText,
  Clock,
  History,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
}

interface DashboardSidebarProps {
  user: User;
}

const navigation = [
  { name: "Drafts", href: "/dashboard/drafts", icon: FileText },
  { name: "Scheduled", href: "/dashboard/scheduled", icon: Clock },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Logo className="w-full h-full" />
          </div>
          <span className="text-xl font-bold text-gray-900">Postlin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-[57px]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-[57px] bottom-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent pathname={pathname} isCollapsed={false} />
      </aside>

      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Logo className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-gray-900">Postlin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <SidebarContent pathname={pathname} isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  isCollapsed,
}: {
  pathname: string;
  isCollapsed: boolean;
}) {
  const router = useRouter();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={() => {
              // Do nothing when already on the active page to avoid unnecessary navigation
              if (isActive) return;
              router.push(item.href);
            }}
            aria-current={isActive ? "page" : undefined}
            title={isCollapsed ? item.name : undefined}
            className={cn(
              "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon
              className={cn(
                "flex-shrink-0",
                isCollapsed ? "h-5 w-5" : "h-5 w-5"
              )}
            />
            {!isCollapsed && <span>{item.name}</span>}
          </button>
        );
      })}
    </nav>
  );
}
