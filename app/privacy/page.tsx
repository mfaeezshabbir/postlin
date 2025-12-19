import type { Metadata } from "next";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Postlin",
  description:
    "Postlin Privacy Policy: how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mb-6 text-slate-700 leading-relaxed text-lg">
            This Privacy Policy explains how Postlin ("we", "us", "our")
            collects, uses, and shares information when you use our website and
            services. We aim to be transparent about what we collect and why.
          </p>

          <p className="text-sm text-slate-500 mb-8 font-medium">
            Last updated: October 7, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Information We Collect
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We collect information you provide directly (for example, when you
              sign in with LinkedIn or contact support). We also collect usage
              information (pages you visit, actions you take), and device
              information (browser type, IP address) to operate and improve the
              service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              How We Use Data
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We use your information to provide the service, process and
              schedule posts on your behalf when you authorize us to,
              personalize features, and communicate with you. We do not sell
              your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Cookies & Tracking
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We use cookies and similar technologies for session management,
              analytics, and to improve your experience. You can control cookie
              preferences via your browser settings; disabling cookies may
              affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Third Parties
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We may share data with third-party service providers who help us
              run the product (for example, hosting, analytics, and email). When
              you connect a LinkedIn account we may store tokens necessary to
              act on your behalf; those tokens are stored securely and can be
              revoked.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Data Retention
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We retain personal data only as long as necessary to provide the
              services, fulfill legal obligations, resolve disputes, and enforce
              our agreements. If you close your account we will remove or
              anonymize data in accordance with our retention schedules.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">
              Your Rights
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Depending on where you live, you may have rights to access,
              correct, or delete your personal information. To exercise these
              rights, contact us through the support link in the dashboard.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">Security</h2>
            <p className="text-slate-700 leading-relaxed">
              We take reasonable measures to protect your data. However, no
              internet service is completely secure. If you believe your account
              has been compromised, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-900">Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have questions about this policy or your data, please reach
              out to us via the contact details provided on the site or by using
              the support/contact link in the dashboard.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
