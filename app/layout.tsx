import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import ToastProvider from "@/components/ToastProvider";
import ConditionalNavbar from "@/components/common/ConditionalNavbar";
import Navbar from "@/components/common/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Postlin - AI-Powered LinkedIn Content Assistant",
  description:
    "Create, schedule, and publish LinkedIn posts with AI-powered content generation. Automate your LinkedIn presence with Postlin.",
  verification: {
    google: "IXowjrIm1s91KjbQVpSKVoNrt7z7bmHuPTZloc8uFiY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <ConditionalNavbar />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
