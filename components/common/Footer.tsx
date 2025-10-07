import Logo from "@/components/brand/Logo";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
              <Logo className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Postlin</div>
              <div className="text-xs text-slate-400">
                Schedule. Publish. Grow.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-4">
              <a
                href="/terms"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Terms
              </a>
              <span className="text-sm text-slate-600">|</span>
              <a
                href="/privacy"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Privacy
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/mfaeezshabbir"
                aria-label="mfaeezshabbir on GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-white/6 hover:bg-white/12 transition"
              >
                <Github className="w-5 h-5 text-slate-200" />
              </a>

              <a
                href="https://www.linkedin.com/in/mfaeezshabbir"
                aria-label="mfaeezshabbir on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-white/6 hover:bg-white/12 transition"
              >
                <Linkedin className="w-5 h-5 text-slate-200" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/6 pt-4 text-center">
          <p className="text-xs text-slate-500">
            © {year} Postlin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
