import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 md:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-blue-600 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-10 md:p-12">
          <div className="border-b border-slate-100 pb-6 sm:pb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy Policy
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Privacy policy
            </h1>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              Last updated: September 16, 2026
            </p>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 sm:text-base">
            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                1. Overview
              </h2>
              <p>
                Liveness Cloud ("we", "us", or "our") provides biometric face
                verification and active liveness detection developer tools. This
                policy explains what information we collect, how it is
                processed, and your rights regarding your data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                2. Camera feeds and client-side processing
              </h2>
              <p>
                The SDK processes camera frames directly on the user's device
                using WebAssembly and WebGL. Raw webcam video, frame captures,
                and photos never leave the browser and are never sent to our
                servers.
              </p>
              <p className="mt-3">
                During verification, the client library measures facial
                landmarks and converts them into a 128-dimensional numerical
                descriptor. Only this mathematical vector and session metadata
                reach the backend API. The numerical descriptor cannot be
                reverse-engineered to recreate a photograph of the user's face.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                3. Information we collect
              </h2>
              <p>
                When you create an account or use our verification services, we
                collect:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Account details including your name, username, email address,
                  and a salted cryptographic hash of your password.
                </li>
                <li>
                  API key records, including the key name, identifier, and
                  creation date.
                </li>
                <li>
                  Enrolled biometric descriptors, consisting of a user
                  identifier and the 128-dimensional numerical vector used for
                  1:1 or 1:N matching.
                </li>
                <li>
                  Verification logs containing session identifiers, match
                  confidence scores, pass or fail outcomes, timestamps, and
                  failure reason codes such as poor lighting or challenge
                  timeout.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                4. How we use your information
              </h2>
              <p>We use the collected information to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Authenticate API requests and evaluate liveness checks.</li>
                <li>
                  Compare verification descriptors against enrolled vectors.
                </li>
                <li>Display audit logs and analytics in your console.</li>
                <li>Protect against fraudulent requests and replay attacks.</li>
                <li>Maintain and improve platform reliability.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                5. Data retention and deletion
              </h2>
              <p>
                Enrolled vectors and verification logs remain in your account
                until you delete them. You can delete specific enrolled
                identities or API keys at any time directly through the console
                or API. When you delete an enrolled identity, its associated
                vector is immediately purged from the database.
              </p>
              <p className="mt-3">
                If you choose to close your account, all associated credentials,
                vectors, and logs will be permanently deleted from our active
                databases.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                6. Data security
              </h2>
              <p>
                We use standard security measures to protect stored records:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  All data in transit is encrypted using modern TLS (HTTPS).
                </li>
                <li>
                  Verification descriptors are matched in memory without writing
                  unnecessary intermediary files.
                </li>
                <li>
                  API authentication requires unique keys tied to your account.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                7. Developer responsibilities
              </h2>
              <p>
                If you integrate the Liveness SDK into your own software, you
                are responsible for providing notice to your end users and
                obtaining any consents required by applicable local privacy
                regulations prior to initiating biometric verification sessions.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                8. Contact us
              </h2>
              <p>
                If you have questions about this privacy policy or how data is
                handled, please contact us at:
              </p>
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-4 font-mono text-xs text-slate-700 sm:text-sm">
                support@liveness.cloud
              </div>
            </section>
          </div>
        </article>

        <footer className="mt-8 text-center text-xs font-medium text-slate-600">
          &copy; {new Date().getFullYear()} Liveness Cloud Platform. All rights
          reserved.
        </footer>
      </main>
    </div>
  );
}
