import type { Metadata } from "next";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Postlin",
  description: "Postlin Privacy Policy: how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

          <p className="mb-4 text-gray-700">
            This Privacy Policy explains how Postlin ("we", "us", "our") collects,
            uses, and shares information when you use our website and services. We
            aim to be transparent about what we collect and why.
          </p>

          <p className="text-sm text-gray-500 mb-6">Last updated: October 7, 2025</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
            <p className="text-gray-700">
              We collect information you provide directly (for example, when you
              sign in with LinkedIn or contact support). We also collect usage
              information (pages you visit, actions you take), and device
              information (browser type, IP address) to operate and improve the
              service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">How We Use Data</h2>
            <p className="text-gray-700">
              We use your information to provide the service, process and schedule
              posts on your behalf when you authorize us to, personalize features,
              and communicate with you. We do not sell your personal information.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cookies & Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar technologies for session management,
              analytics, and to improve your experience. You can control cookie
              preferences via your browser settings; disabling cookies may affect
              functionality.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Third Parties</h2>
            <p className="text-gray-700">
              We may share data with third-party service providers who help us run
              the product (for example, hosting, analytics, and email). When you
              connect a LinkedIn account we may store tokens necessary to act on
              your behalf; those tokens are stored securely and can be revoked.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
            <p className="text-gray-700">
              We retain personal data only as long as necessary to provide the
              services, fulfill legal obligations, resolve disputes, and enforce
              our agreements. If you close your account we will remove or anonymize
              data in accordance with our retention schedules.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
            <p className="text-gray-700">
              Depending on where you live, you may have rights to access,
              correct, or delete your personal information. To exercise these
              rights, contact us through the support link in the dashboard.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Security</h2>
            <p className="text-gray-700">
              We take reasonable measures to protect your data. However, no
              internet service is completely secure. If you believe your account
              has been compromised, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-gray-700">
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
