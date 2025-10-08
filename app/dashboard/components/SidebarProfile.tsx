"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
}

export default function SidebarProfile({
  user,
  isCollapsed = false,
}: {
  user: User;
  isCollapsed?: boolean;
}) {
  const router = useRouter();

  const initials = React.useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 border-b border-gray-200",
        isCollapsed ? "items-center" : ""
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 w-full",
          isCollapsed ? "justify-center" : ""
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 focus:outline-none"
              aria-label="Open profile menu"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg,#6366f1 0%,#ec4899 100%)",
                }}
                title={user?.name || "User"}
              >
                {initials}
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email || ""}
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="center" sideOffset={8}>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
