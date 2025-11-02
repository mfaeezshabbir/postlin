"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Loader2, CheckCircle, XCircle } from "lucide-react";

interface LinkedInConnectionProps {
  initialConnected: boolean;
  linkedInId?: string | null;
}

export default function LinkedInConnection({ initialConnected, linkedInId }: LinkedInConnectionProps) {
  const [connected, setConnected] = useState(initialConnected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConnect = () => {
    setLoading(true);
    // Redirect to LinkedIn connection flow
    window.location.href = "/api/linkedin/connect";
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your LinkedIn account? You won't be able to auto-publish posts until you reconnect.")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/linkedin/disconnect", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setConnected(false);
        setSuccess("LinkedIn account disconnected successfully");
      } else {
        setError(data.error || "Failed to disconnect LinkedIn account");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="w-5 h-5" />
          LinkedIn Connection
        </CardTitle>
        <CardDescription>
          Manage your LinkedIn account connection for auto-publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Connection Status
            </label>
            <div className="mt-1 flex items-center gap-2">
              {connected ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-300"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                  {linkedInId && (
                    <span className="text-xs text-gray-500">
                      ID: {linkedInId.substring(0, 10)}...
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not connected
                </Badge>
              )}
            </div>
          </div>
          <div>
            {connected ? (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                disabled={loading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-[#0A66C2] hover:bg-[#004182]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-4 h-4 mr-2" />
                    Connect LinkedIn
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {connected
              ? "Your LinkedIn account is connected. You can schedule and auto-publish posts directly to your LinkedIn profile."
              : "Connect your LinkedIn account to enable auto-publishing and analytics features. You can still create and copy posts manually without connecting."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
