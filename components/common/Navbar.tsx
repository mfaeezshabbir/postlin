import { ArrowRight } from "lucide-react";
import Logo from "../brand/Logo";
import getCurrentUser from "../../lib/auth";

const Navbar = async () => {
  const user = await getCurrentUser();
  return (
    <nav className="sticky top-4 z-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-200/40 shadow-sm">
          <div className="flex items-center gap-3">
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
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="/#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Features
            </a>
            <a
              href="/#how"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              How it works
            </a>
            <a
              href="/#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={user ? "/dashboard/drafts" : "/login"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-medium shadow-sm hover:shadow-md transition"
              aria-label={user ? "Go to dashboard" : "Sign in"}
            >
              <span className="text-sm">{user ? "Dashboard" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="md:hidden">
            <a
              href={user ? "/dashboard/drafts" : "/login"}
              className="inline-flex items-center gap-2 p-2 rounded-lg bg-white/70 border border-gray-200/30 shadow-sm"
              aria-label="Open"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
