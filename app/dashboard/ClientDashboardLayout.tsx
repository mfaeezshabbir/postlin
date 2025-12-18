"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { DraftModal } from "./components/DraftModal";

interface ClientDashboardLayoutProps {
  user: any;
  children: React.ReactNode;
}

export default function ClientDashboardLayout({
  user,
  children,
}: ClientDashboardLayoutProps) {
  const [stats, setStats] = useState({ drafts: 0, scheduled: 0, published: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePostCreated = () => {
    fetchStats();
    toast({
      title: "Success",
      description: "Post created successfully.",
    });
    // Ideally we would also refresh the child page's data,
    // but for now we rely on the user to navigate or for the page to re-fetch on focus.
    // In a production app, we would use a shared context or SWR/TanStack Query.
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        stats={stats}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-screen">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Global Create Post Modal */}
      <DraftModal
        open={isCreateModalOpen}
        onOpenChange={() => setIsCreateModalOpen(false)}
        onDraftSaved={handlePostCreated}
        mode="create"
      />
    </div>
  );
}
