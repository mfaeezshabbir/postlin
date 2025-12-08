import React from "react";
import DashboardContainer from "@/app/dashboard/components/DashboardContainer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/common/Footer";

export default function SupportPage() {
  const github = "https://github.com/mfaeezshabbir";
  const linkedin = "https://www.linkedin.com/in/mfaeezshabbir";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <DashboardContainer
          title="Help & Support"
          description="Find answers, report issues, and connect with our team."
        >
          <div className="space-y-10">
            {/* Getting Help */}
            <Card className="border-0 shadow-lg rounded-2xl backdrop-blur-sm bg-white/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Need help using Postlin?
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Whether you're scheduling posts or managing accounts, we’re
                  here to make it easy. Below are a few ways to reach us or
                  troubleshoot common problems.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  You can reach our support team directly by email or connect
                  with us through our community platforms. We usually respond
                  within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="outline">
                    <a href={linkedin} target="_blank" rel="noreferrer">
                      Connect on LinkedIn
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={github} target="_blank" rel="noreferrer">
                      Visit GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card className="border-0 shadow-lg rounded-2xl backdrop-blur-sm bg-white/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Quick Troubleshooting
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Try these simple fixes before contacting support.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-4">
                <div>
                  <p className="font-semibold">Can’t post?</p>
                  <p>
                    Make sure your LinkedIn account is connected and authorized
                    in your dashboard.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Something not loading?</p>
                  <p>
                    Try refreshing or logging out and back in. Cached sessions
                    can cause display issues.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Uploads failing?</p>
                  <p>
                    Only JPG and PNG formats are supported, up to 10MB in size.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="border-0 shadow-lg rounded-2xl backdrop-blur-sm bg-white/80">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Feedback & Suggestions
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Help us improve by sharing your thoughts and experiences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  We’re constantly improving Postlin and love hearing from our
                  users. Whether it’s a feature idea or just a small bug, your
                  voice matters.
                </p>
                <Button
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <a href={linkedin} target="_blank" rel="noreferrer">
                    Send Feedback
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardContainer>
      </div>
      <Footer />
    </div>
  );
}
