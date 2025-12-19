import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  isAuthenticated?: boolean;
}

export default function CTA({ isAuthenticated }: CTAProps) {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden text-center px-4">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-200/40 to-cyan-200/40 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Ready to Amplify Your Voice & <br />
          Grow Your Business?
        </h2>

        <div className="flex flex-col items-center gap-6 mt-10">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#4B6BFB] hover:bg-[#3d5ce0] text-white rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(75,107,251,0.4)] hover:shadow-[0_20px_50px_-15px_rgba(75,107,251,0.5)] hover:-translate-y-1 transition-all"
          >
            <span>
              {isAuthenticated ? "Go to Dashboard" : "Start Your Free Journey"}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-sm text-slate-600 font-medium">
            No credit card required. Experience your first win today.
          </p>
        </div>
      </div>
    </section>
  );
}
