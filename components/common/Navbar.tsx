"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../brand/Logo";
import getCurrentUser from "../../lib/auth";

const Navbar = async () => {
  const [open, setOpen] = useState(false);
  const user = await getCurrentUser();

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how", label: "How it works" },
  ];

  return (
    <nav className="sticky top-4 z-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-200/40 shadow-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Logo className="w-full h-full text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-gray-900">
                Postlin
              </span>
              <span className="text-xs text-gray-500">
                AI-powered LinkedIn Assistant
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href={user ? "/dashboard/drafts" : "/login"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-medium shadow-sm hover:shadow-md transition"
            >
              <span className="text-sm">{user ? "Dashboard" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg bg-white/70 border border-gray-200/30 shadow-sm"
          >
            {open ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {open && (
          <div className="md:hidden mt-2 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200/40 shadow-md animate-fadeIn">
            <div className="flex flex-col gap-4 text-gray-700">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium hover:text-gray-900 transition"
                >
                  {label}
                </Link>
              ))}

              <Link
                href={user ? "/dashboard/drafts" : "/login"}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-medium shadow-sm hover:shadow-md transition"
              >
                <span className="text-sm">
                  {user ? "Dashboard" : "Sign In"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
