import { ArrowLeft, FileText } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function TermsOfService() {
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
              <FileText className="h-3.5 w-3.5" />
              Legal
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Terms of service
            </h1>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              Last updated: September 16, 2026
            </p>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 sm:text-base">
            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                1. Agreement to terms
              </h2>
              <p>
                By creating an account, generating an API key, or using the
                Liveness SDK and cloud verification services, you agree to be
                bound by these terms. If you use the service on behalf of a
                company or organization, you confirm that you have the authority
                to agree to these terms for that entity.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                2. Description of service
              </h2>
              <p>
                Liveness Cloud provides client-side face liveness detection
                tools, biometric feature extraction libraries, and verification
                APIs. The service is designed to verify physical presence and
                match facial descriptors against enrolled identities.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                3. Accounts and credentials
              </h2>
              <p>
                You must provide an accurate email address and keep your account
                information current. You are responsible for safeguarding your
                account password and secret API keys. Any action taken using
                your API keys or account credentials will be treated as
                authorized by you.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                4. Acceptable use
              </h2>
              <p>
                You agree to use Liveness Cloud solely for legitimate identity
                verification and anti-spoofing purposes. You must not:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Use the service for unlawful surveillance, harassment, or
                  unauthorized profiling.
                </li>
                <li>
                  Capture or transmit biometric descriptors from users without
                  their knowledge or required legal consent.
                </li>
                <li>
                  Attempt to bypass rate limits, probe server vulnerabilities,
                  or disrupt API infrastructure.
                </li>
                <li>
                  Resell or redistribute access to the API without our written
                  consent.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                5. User consent and privacy compliance
              </h2>
              <p>
                If you incorporate the SDK into your own software, you are
                responsible for complying with all applicable privacy and
                biometric data regulations. This includes notifying your users
                about biometric processing and collecting any required consent
                before starting camera sessions.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                6. Open-source components and platform ownership
              </h2>
              <p>
                The client SDK package is distributed under the MIT License. The
                Liveness Cloud platform name, verification backend, dashboard
                interfaces, and documentation are the property of Liveness
                Cloud.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                7. Service availability
              </h2>
              <p>
                We work to keep the service operational, but access is provided
                on an "as is" and "as available" basis. We do not guarantee that
                the API will operate without interruptions or errors. Scheduled
                maintenance or unexpected outages may occasionally affect
                availability.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                8. Limitation of liability
              </h2>
              <p>
                To the fullest extent permitted by law, Liveness Cloud will not
                be liable for indirect, incidental, consequential, or punitive
                damages, including loss of profits, data, or business
                opportunities, arising from your use of or inability to use the
                service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                9. Termination
              </h2>
              <p>
                You may delete your account and stop using the service at any
                time. We reserve the right to suspend or terminate accounts that
                violate these terms, cause operational disruptions, or engage in
                unauthorized activities.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                10. Changes to terms
              </h2>
              <p>
                We may revise these terms periodically. When changes occur, we
                update the date at the top of this page. Your continued use of
                the service following an update constitutes acceptance of the
                revised terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                11. Contact
              </h2>
              <p>If you have questions about these terms, contact us at:</p>
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
