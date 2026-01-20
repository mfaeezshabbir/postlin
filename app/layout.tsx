import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import ToastProvider from "@/components/ToastProvider";
import ConditionalNavbar from "@/components/common/ConditionalNavbar";
import Navbar from "@/components/common/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000",
  ),
  title: "Postlin - AI-Powered LinkedIn Content Assistant",
  description:
    "Create, schedule, and publish LinkedIn posts with AI-powered content generation. Automate your LinkedIn presence with Postlin.",
  openGraph: {
    title: "Postlin - AI-Powered LinkedIn Content Assistant",
    description:
      "Create, schedule, and publish LinkedIn posts with AI-powered content generation. Automate your LinkedIn presence with Postlin.",
    url: "/",
    siteName: "Postlin",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Postlin AI Assistant Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Postlin - AI-Powered LinkedIn Content Assistant",
    description:
      "Create, schedule, and publish LinkedIn posts with AI-powered content generation.",
    images: ["/og-image.png"],
  },
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <ConditionalNavbar />
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
