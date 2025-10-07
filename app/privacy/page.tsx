import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Postlin",
  description: "Postlin Privacy Policy: how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

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
        <h2 className="text-xl font-semibold mb-2">Third Parties</h2>
        <p className="text-gray-700">
          We may share data with third-party service providers who help us run
          the product (for example, hosting, analytics, and email). When you
          connect a LinkedIn account we may store tokens necessary to act on
          your behalf; those tokens are stored securely and can be revoked.
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
    </main>
  );
}
