import getCurrentUser from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Linkedin } from "lucide-react";
import LinkedInConnection from "./components/LinkedInConnection";
import GeminiKeyManagement from "./components/GeminiKeyManagement";
import prisma from "@/lib/prisma";
import PageHeader from "../components/PageHeader";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login");
  }

  // Fetch full user profile including connection status
  const fullProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      googleId: true,
      linkedInId: true,
      linkedInConnected: true,
      geminiApiKeyEncrypted: true,
      geminiKeyAddedAt: true,
    },
  });

  if (!fullProfile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-full gap-8">
      <PageHeader title="Settings" showSearch={false} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-3">
          <div className="bg-card/50 border border-border rounded-2xl overflow-hidden sticky top-8">
            <nav className="flex flex-col p-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-white bg-white/10 hover:bg-white/10"
              >
                <User className="mr-3 h-4 w-4 text-blue-400" />
                My Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Linkedin className="mr-3 h-4 w-4" />
                Integrations
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Profile Card */}
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Profile Information
            </h2>
            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-400">
                  Display Name
                </label>
                <div className="p-3 rounded-lg bg-secondary border border-border text-foreground">
                  {fullProfile.name || "Not set"}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-400">
                  Email Address
                </label>
                <div className="p-3 rounded-lg bg-secondary border border-border text-foreground">
                  {fullProfile.email || "Not set"}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-400">
                  Connected Accounts
                </label>
                <div className="flex items-center gap-3">
                  {fullProfile.googleId && (
                    <Badge
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Google Connected
                    </Badge>
                  )}
                  {fullProfile.linkedInConnected && (
                    <Badge
                      variant="outline"
                      className="bg-[#0A66C2]/20 border-[#0A66C2]/50 text-blue-400 hover:bg-[#0A66C2]/30"
                    >
                      LinkedIn Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LinkedIn Integration */}
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              LinkedIn Connection
            </h2>
            <LinkedInConnection
              initialConnected={fullProfile.linkedInConnected}
              linkedInId={fullProfile.linkedInId}
            />
          </div>

          {/* Gemini keys */}
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              AI Configuration
            </h2>
            <GeminiKeyManagement
              initialHasKey={!!fullProfile.geminiApiKeyEncrypted}
              initialKeyAddedAt={fullProfile.geminiKeyAddedAt}
            />
          </div>

          {/* Coming Soon */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
            <SettingsIcon className="h-6 w-6 text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-blue-400">
                More Settings Coming Soon
              </h3>
              <p className="text-sm text-blue-300/70 mt-1">
                We are working on adding granular notification controls, custom
                AI personas, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
