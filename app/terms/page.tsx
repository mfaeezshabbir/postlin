import type { Metadata } from "next";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - Postlin",
  description: "Postlin Terms of Service: rules and conditions for using Postlin.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>

          <p className="mb-4 text-gray-700">
            These Terms of Service ("Terms") govern your use of Postlin. By
            accessing or using Postlin you agree to these Terms. If you don't
            agree, please do not use the service.
          </p>

          <p className="text-sm text-gray-500 mb-6">Last updated: October 7, 2025</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Using Postlin</h2>
            <p className="text-gray-700">
              You may use Postlin to create, schedule, and publish content to
              LinkedIn. You are responsible for the content you create and must
              comply with LinkedIn's policies and these Terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Account Security</h2>
            <p className="text-gray-700">
              Keep your account credentials secure. You are responsible for
              activities that occur under your account. Notify us if you suspect
              unauthorized access.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Acceptable Use</h2>
            <p className="text-gray-700">
              You agree not to use Postlin to post illegal content, harass others,
              or attempt to bypass LinkedIn's policies. You must have the rights
              to any content you publish through the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Termination</h2>
            <p className="text-gray-700">
              We may suspend or terminate access for violations of these Terms or
              for conduct that harms other users or the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Disputes & Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, Postlin's liability is
              limited. We are not responsible for third-party services you link
              to or for content published by users.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these Terms from time to time. We will notify users
              of significant changes and publish the revised Terms on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-gray-700">
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
