"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../brand/Logo";

export default function ClientNavbar({
  user,
  isDashboard = false,
}: {
  user: any;
  isDashboard?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/docs", label: "Docs" },
    { href: "/support", label: "Support" },
  ];

  return (
    <nav
      id="global-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDashboard ? "hidden" : ""
      } ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-b border-slate-200 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105">
              <Logo className="w-9 h-9 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Postlin
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-600 transition-all group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <Link
                href="/login"
                className="text-sm font-bold text-slate-700 hover:text-slate-900 transition px-5 py-2.5 rounded-xl hover:bg-slate-100"
              >
                Log in
              </Link>
            )}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4B6BFB] hover:bg-[#3d5ce0] text-white font-bold shadow-[0_4px_20px_-4px_rgba(75,107,251,0.4)] hover:shadow-[0_8px_30px_-6px_rgba(75,107,251,0.5)] hover:-translate-y-0.5 transition-all text-sm"
            >
              <span>{user ? "Dashboard" : "Get Started"}</span>
              {!user && <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] p-6 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-base font-bold text-slate-700 py-3 hover:text-sky-600 border-b border-slate-100 last:border-0 transition"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-3">
                {!user && (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full text-center py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Log in
                  </Link>
                )}
                <Link
                  href={user ? "/dashboard" : "/login"}
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-[#4B6BFB] text-white font-bold hover:bg-[#3d5ce0] shadow-[0_4px_20px_-4px_rgba(75,107,251,0.4)] transition"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
