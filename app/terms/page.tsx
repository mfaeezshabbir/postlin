import type { Metadata } from "next";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - Postlin",
  description:
    "Postlin Terms of Service: rules and conditions for using Postlin.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF5] relative overflow-hidden">
      {/* Sunrise Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-yellow-200/30 via-orange-100/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-200/30 via-blue-100/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[650px] h-[650px] bg-gradient-to-t from-pink-200/30 via-rose-100/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-white/50">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">
            Terms of Service
          </h1>

          <p className="mb-6 text-slate-700 leading-relaxed text-lg">
            These Terms of Service ("Terms") govern your use of Postlin. By
            accessing or using Postlin you agree to these Terms. If you don't
            agree, please do not use the service.
          </p>

          <p className="text-sm text-slate-500 mb-8 font-medium">
            Last updated: October 7, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Using Postlin
            </h2>
            <p className="text-slate-700 leading-relaxed">
              You may use Postlin to create, schedule, and publish content to
              LinkedIn. You are responsible for the content you create and must
              comply with LinkedIn's policies and these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Account Security
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Keep your account credentials secure. You are responsible for
              activities that occur under your account. Notify us if you suspect
              unauthorized access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Acceptable Use
            </h2>
            <p className="text-slate-700 leading-relaxed">
              You agree not to use Postlin to post illegal content, harass
              others, or attempt to bypass LinkedIn's policies. You must have
              the rights to any content you publish through the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Termination
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We may suspend or terminate access for violations of these Terms
              or for conduct that harms other users or the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Disputes & Liability
            </h2>
            <p className="text-slate-700 leading-relaxed">
              To the maximum extent permitted by law, Postlin's liability is
              limited. We are not responsible for third-party services you link
              to or for content published by users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Changes to Terms
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We may modify these Terms from time to time. We will notify users
              of significant changes and publish the revised Terms on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-900">Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              For questions about these Terms, please contact us through the
              contact methods on the site or via the support link inside the
              dashboard.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
