"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, HelpCircle } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-300 border-t border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
            <Logo className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">Postlin</p>
            <p className="text-xs text-slate-400">Schedule. Publish. Grow.</p>
          </div>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/docs" className="hover:text-white transition">
            Docs
          </Link>
          <Link href="/support" className="hover:text-white transition">
            Support
          </Link>
          <Link href="/terms" className="hover:text-white transition">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="mailto:support@postlin.app"
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            aria-label="Contact via Email"
          >
            <Mail className="w-5 h-5" />
          </a>
          <a
            href="https://postlin.app/support"
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            aria-label="Help & Support"
          >
            <HelpCircle className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/mfaeezshabbir"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com/in/mfaeezshabbir"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {year} Postlin. All rights reserved.
      </div>
    </footer>
  );
}
