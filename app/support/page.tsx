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
    <div className="min-h-screen bg-[#FFFDF5] text-slate-800 relative overflow-hidden">
      {/* Sunrise Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-yellow-200/30 via-orange-100/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-200/30 via-blue-100/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[650px] h-[650px] bg-gradient-to-t from-pink-200/30 via-rose-100/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
        <DashboardContainer
          title="Help & Support"
          description="Find answers, report issues, and connect with our team."
        >
          <div className="space-y-8">
            {/* Getting Help */}
            <Card className="border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] backdrop-blur-sm bg-white/90">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold text-slate-900">
                  Need help using Postlin?
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Whether you're scheduling posts or managing accounts, we're
                  here to make it easy. Below are a few ways to reach us or
                  troubleshoot common problems.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-slate-700 leading-relaxed">
                <p className="text-base">
                  You can reach our support team directly by email or connect
                  with us through our community platforms. We usually respond
                  within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 font-bold rounded-2xl transition-all shadow-sm hover:shadow-md"
                  >
                    <a href={linkedin} target="_blank" rel="noreferrer">
                      Connect on LinkedIn
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 font-bold rounded-2xl transition-all shadow-sm hover:shadow-md"
                  >
                    <a href={github} target="_blank" rel="noreferrer">
                      Visit GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card className="border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] backdrop-blur-sm bg-white/90">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold text-slate-900">
                  Quick Troubleshooting
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Try these simple fixes before contacting support.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-700 space-y-6">
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <p className="font-bold text-sky-900 mb-2">Can't post?</p>
                  <p className="text-sm leading-relaxed">
                    Make sure your LinkedIn account is connected and authorized
                    in your dashboard.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="font-bold text-amber-900 mb-2">
                    Something not loading?
                  </p>
                  <p className="text-sm leading-relaxed">
                    Try refreshing or logging out and back in. Cached sessions
                    can cause display issues.
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="font-bold text-rose-900 mb-2">
                    Uploads failing?
                  </p>
                  <p className="text-sm leading-relaxed">
                    Only JPG and PNG formats are supported, up to 10MB in size.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] backdrop-blur-sm bg-white/90">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold text-slate-900">
                  Feedback & Suggestions
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Help us improve by sharing your thoughts and experiences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p className="leading-relaxed">
                  We're constantly improving Postlin and love hearing from our
                  users. Whether it's a feature idea or just a small bug, your
                  voice matters.
                </p>
                <Button
                  asChild
                  className="bg-[#4B6BFB] hover:bg-[#3d5ce0] text-white font-bold rounded-2xl shadow-[0_4px_20px_-4px_rgba(75,107,251,0.4)] hover:shadow-[0_8px_30px_-6px_rgba(75,107,251,0.5)] hover:-translate-y-0.5 transition-all"
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
