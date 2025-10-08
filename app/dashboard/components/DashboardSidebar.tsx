"use client";

import Logo from "@/components/brand/Logo";
import {
  FileText,
  Clock,
  History,
  Settings,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SidebarProfile from "./SidebarProfile";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";
import SidebarMobile from "./SidebarMobile";

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
}

interface DashboardSidebarProps {
  user: User;
  onAccount?: () => void;
  onNewDraft?: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigation = [
  { name: "Drafts", href: "/dashboard/drafts", icon: FileText },
  { name: "Scheduled", href: "/dashboard/scheduled", icon: Clock },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar({
  user,
  onAccount,
  onNewDraft,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}: DashboardSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const toggle = () => {
    if (controlledCollapsed !== undefined) {
      onCollapsedChange?.(!controlledCollapsed);
    } else {
      setInternalCollapsed((v) => !v);
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Logo className="w-full h-full" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            Postlin
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen((v) => !v)}
          aria-label="Open sidebar"
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
          className="lg:hidden fixed inset-0 bg-black/40 z-40 mt-[57px]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-[57px] bottom-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-250 ease-in-out shadow-lg",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarMobile
          items={navigation}
          user={user}
          onClose={() => setIsMobileOpen(false)}
          onAccount={onAccount}
          onNewDraft={onNewDraft}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 lg:rounded-r-3xl",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          !isCollapsed
            ? "lg:backdrop-blur-sm lg:shadow-lg lg:border-gray-100"
            : ""
        )}
      >
        {/* logo */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b border-gray-200",
            isCollapsed ? "lg:justify-center" : ""
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Logo className="w-full h-full" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                Postlin
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              isCollapsed
                ? "h-7 w-7 lg:absolute lg:top-16 lg:right-0 lg:transform lg:-translate-y-1/2 lg:translate-x-1/2 lg:z-20 lg:bg-white lg:shadow"
                : ""
            )}
          >
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </Button>
        </div>

        <SidebarNav items={navigation} isCollapsed={isCollapsed} />
        <SidebarProfile user={user} isCollapsed={isCollapsed} />
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}
