"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
  image?: string | null;
}

export default function SidebarProfile({
  user,
  isCollapsed = false,
}: {
  user: User;
  isCollapsed?: boolean;
}) {
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
        "flex flex-col gap-3 p-4 border-b border-sidebar-border",
        isCollapsed ? "items-center" : ""
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 w-full",
          isCollapsed ? "justify-center" : ""
        )}
      >
        <Avatar className="w-10 h-10 rounded-lg" title={user?.name || "User"}>
          {user?.image ? (
            <Image
              src={user.image}
              width={40}
              height={40}
              alt={user?.name || "User"}
            />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-sidebar-foreground">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
