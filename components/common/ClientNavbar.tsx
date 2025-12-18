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
    { href: "/#features", label: "Features" },
    { href: "/#how", label: "How it works" },
  ];

  return (
    <nav
      id="global-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDashboard ? "hidden" : ""
      } ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105">
              <Logo className="w-10 h-10 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Postlin
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition px-4 py-2"
              >
                Log in
              </Link>
            )}
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
            >
              <span>{user ? "Dashboard" : "Get Started Free"}</span>
              {!user && <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-slate-600"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-slate-600 py-2 hover:text-blue-600 border-b border-gray-50 last:border-0"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-3">
                {!user && (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                )}
                <Link
                  href={user ? "/dashboard" : "/register"}
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md"
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
