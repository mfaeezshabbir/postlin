"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Logo from "@/components/brand/Logo";

const SOCIAL_LINKS = [
  {
    href: "https://twitter.com/postlin",
    icon: Twitter,
    label: "Twitter",
    color: "hover:bg-sky-500 hover:shadow-sky-500/30",
  },
  {
    href: "https://linkedin.com/company/postlin",
    icon: Linkedin,
    label: "LinkedIn",
    color: "hover:bg-[#0A66C2] hover:shadow-blue-500/30",
  },
  {
    href: "https://github.com/postlin",
    icon: Github,
    label: "GitHub",
    color: "hover:bg-slate-900 hover:shadow-slate-500/30",
  },
  {
    href: "mailto:hello@postlin.com",
    icon: Mail,
    label: "Email",
    color: "hover:bg-emerald-500 hover:shadow-emerald-500/30",
  },
];

const SECTIONS = [
  { title: "Product", links: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-cyan-50/30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 flex justify-center items-center group-hover:scale-105">
                <Logo className="w-9 h-9" />
              </div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Postlin
              </span>
            </Link>
            <p className="text-slate-600 mb-6 max-w-sm leading-relaxed font-medium">
              Experience your first win with Postlin. The all-in-one AI
              assistant to grow your authentic voice on LinkedIn.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  className={`w-11 h-11 rounded-xl bg-slate-600 flex items-center justify-center hover:text-white transition-all hover:scale-110 hover:shadow-lg ${color}`}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-slate-900 font-extrabold mb-6 text-lg">
                {section.title}
              </h3>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-sky-600 transition font-medium hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 font-medium">
            © {year} Postlin. All rights reserved. Built with ❤️ for LinkedIn
            creators.
          </p>
          <div className="flex gap-6 text-sm">
            {["Privacy", "Terms", "Support"].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="text-slate-600 hover:text-sky-600 transition font-semibold"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
