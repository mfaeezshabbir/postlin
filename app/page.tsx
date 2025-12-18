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
    <>
      <Hero isAuthenticated={!!user} />
      <Features />
      <HowItWorks />
      <CTA isAuthenticated={!!user} />
      {/* <Pricing isAuthenticated={!!user} /> */}

      <Footer />
    </>
  );
}
