export default function HowItWorks() {
  return (
    <section
      className="relative bg-gradient-to-b from-gray-50 to-white/80 py-16"
      id="how"
    >
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-600 mb-2">
            Simple, powerful workflow
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900">
            How it works — craft and publish in minutes
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Connect your account, let AI generate tailored posts, refine them,
            and publish or schedule — all while tracking performance.
          </p>
        </header>

        <div className="relative">
          {/* connector line for larger screens */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-14 bottom-0 w-[2px] bg-gradient-to-b from-indigo-200 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <article className="group relative flex flex-col items-start gap-4 p-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
              <span className="absolute -left-6 top-6 hidden md:inline-flex w-12 h-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-semibold text-lg ring-4 ring-white">
                1
              </span>
              <div className="w-full flex items-center gap-4">
                <div className="flex-none w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 2v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 8v12h12V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Connect LinkedIn
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Securely sign in and grant posting permissions in one click.
                  </p>
                </div>
              </div>
            </article>

            {/* Step 2 */}
            <article className="group relative flex flex-col items-start gap-4 p-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
              <span className="absolute -left-6 top-6 hidden md:inline-flex w-12 h-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-semibold text-lg ring-4 ring-white">
                2
              </span>
              <div className="w-full flex items-center gap-4">
                <div className="flex-none w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 10h18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 6v8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 6v8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Generate Drafts
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Produce multiple post variants tailored to your audience and
                    tone.
                  </p>
                </div>
              </div>
            </article>

            {/* Step 3 */}
            <article className="group relative flex flex-col items-start gap-4 p-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
              <span className="absolute -left-6 top-6 hidden md:inline-flex w-12 h-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-semibold text-lg ring-4 ring-white">
                3
              </span>
              <div className="w-full flex items-center gap-4">
                <div className="flex-none w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4 6h16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 12h16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 18h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Review & Edit
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Tweak copy, add hashtags, or schedule — inline editor with
                    autosave.
                  </p>
                </div>
              </div>
            </article>

            {/* Step 4 */}
            <article className="group relative flex flex-col items-start gap-4 p-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
              <span className="absolute -left-6 top-6 hidden md:inline-flex w-12 h-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-semibold text-lg ring-4 ring-white">
                4
              </span>
              <div className="w-full flex items-center gap-4">
                <div className="flex-none w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 20v-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 8h6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Publish & Analyze
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Post immediately or schedule, then track engagement and
                    growth.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#"
            className="inline-flex items-center gap-3 px-5 py-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition"
            aria-label="Get started"
          >
            Get started — it's free
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
