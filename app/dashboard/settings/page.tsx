import getCurrentUser from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardContainer from "../components/DashboardContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Shield,
  Linkedin,
} from "lucide-react";
import LinkedInConnection from "./components/LinkedInConnection";
import GeminiKeyManagement from "./components/GeminiKeyManagement";
import prisma from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
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
    <DashboardContainer
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Account
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Palette className="mr-2 h-4 w-4" />
                  Preferences
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy & Security
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {fullProfile.name || "Not set"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {fullProfile.email || "Not set"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Authentication
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {fullProfile.googleId && (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      Google
                    </Badge>
                  )}
                  {fullProfile.linkedInConnected && (
                    <Badge variant="outline" className="text-[#0A66C2] border-blue-300">
                      LinkedIn
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LinkedIn Connection Management */}
          <LinkedInConnection 
            initialConnected={fullProfile.linkedInConnected}
            linkedInId={fullProfile.linkedInId}
          />

          {/* Gemini API Key Management */}
          <GeminiKeyManagement
            initialHasKey={!!fullProfile.geminiApiKeyEncrypted}
            initialKeyAddedAt={fullProfile.geminiKeyAddedAt}
          />

          {/* AI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>AI Content Preferences</CardTitle>
              <CardDescription>
                Customize how AI generates content for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tone of Voice
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Professional, casual, inspirational, or custom
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Configure Tone
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Content Length
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Preferred post length: short, medium, or long
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Set Preference
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Topics to Avoid
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Specify topics you don't want to post about
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Manage Topics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posting Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Posting Schedule</CardTitle>
              <CardDescription>
                Set your preferred posting times for automatic scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Preferred Posting Times
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Monday - Friday, 9:00 AM and 3:00 PM
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Edit Schedule
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Time Zone
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  (UTC+00:00) Coordinated Universal Time
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Change Time Zone
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <SettingsIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Settings Coming Soon
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Full settings functionality including preferences,
                    notifications, and integrations will be available soon. This
                    is a preview of what's coming.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardContainer>
  );
}
