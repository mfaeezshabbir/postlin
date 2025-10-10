import getCurrentUser from "../lib/auth";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/common/Footer";
import Logo from "@/components/brand/Logo";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  {/* Navigation is rendered globally via layout */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Hero isAuthenticated={!!user} />
        <Features />
        <HowItWorks />
        <CTA isAuthenticated={!!user} />
        {/* <Pricing isAuthenticated={!!user} /> */}
      </main>

      <Footer />
    </div>
  );
}
