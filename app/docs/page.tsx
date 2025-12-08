import React from "react";
import Footer from "@/components/common/Footer";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-800">

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Postlin Help Center
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn how to use Postlin to create, schedule, and publish posts that
            make your LinkedIn presence shine.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-28">
              <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Contents</h3>
                <nav>
                  <ul className="space-y-3 text-sm">
                    {[
                      ["#getting-started", "Getting Started"],
                      ["#create-post", "Creating Your First Post"],
                      ["#ai-assistant", "Using the AI Assistant"],
                      ["#scheduling", "Scheduling & Publishing"],
                      ["#troubleshooting", "Troubleshooting"],
                      ["#contact", "Contact Support"],
                    ].map(([href, label]) => (
                      <li key={href}>
                        <a
                          href={href}
                          className="block text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <article className="md:col-span-2 space-y-10">
            <section
              id="getting-started"
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Getting Started
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Welcome to Postlin. It’s your personal tool for crafting and
                scheduling professional LinkedIn posts. To get started, simply
                log in with your LinkedIn account, grant permissions, and you’re
                ready to post like a pro.
              </p>
              <p className="mt-4 text-gray-700">
                Once inside the dashboard, you’ll see sections like Drafts,
                Scheduled, and Published. Each one helps you manage your content
                effortlessly.
              </p>
            </section>

            <section
              id="create-post"
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Creating Your First Post
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Go to <strong>Drafts → New Draft</strong>. Here, you can type
                your post manually or ask Postlin to generate ideas for you.
              </p>
              <p className="mt-4 text-gray-700">
                Add hashtags, attach images or videos, and tweak the tone until
                it feels right. When you’re happy with it, save it as a draft or
                move on to scheduling.
              </p>
            </section>

            <section
              id="ai-assistant"
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Using the AI Assistant
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                The AI Assistant helps you write better posts faster. Enter a
                short idea or topic, and it’ll generate post suggestions,
                captions, or even hashtags.
              </p>
              <p className="mt-4 text-gray-700">
                You can edit, shorten, or reword anything. The goal is to make
                your content sound like you—authentic, engaging, and
                professional.
              </p>
            </section>

            <section
              id="scheduling"
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Scheduling & Publishing
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                When your post is ready, you can publish it immediately or
                schedule it for later. Just pick a date and time, and Postlin
                will handle the rest.
              </p>
              <p className="mt-4 text-gray-700">
                All scheduled posts appear in the “Scheduled” tab, where you can
                edit or cancel them anytime before publishing.
              </p>
            </section>

            <section
              id="troubleshooting"
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Troubleshooting
              </h2>
              <ul className="list-disc ml-6 mt-4 text-gray-700 space-y-2">
                <li>
                  <strong>Can’t connect to LinkedIn?</strong> Make sure you
                  granted all permissions when logging in.
                </li>
                <li>
                  <strong>Posts not appearing?</strong> Refresh your dashboard
                  or check your LinkedIn account directly.
                </li>
                <li>
                  <strong>Image upload issues?</strong> Make sure the image is
                  under 10MB and in JPG or PNG format.
                </li>
              </ul>
            </section>

            <section
              id="contact"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-2">Need more help?</h2>
              <p className="text-base opacity-90 mb-5">
                We’re here to help you make the most of Postlin. If you have any
                questions, feedback, or technical issues, reach out to us.
              </p>
              <div className="flex flex-wrap gap-5">
                <a
                  className="bg-white text-blue-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                  href="https://www.linkedin.com/in/mfaeezshabbir"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn: mfaeezshabbir
                </a>
              </div>
            </section>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
