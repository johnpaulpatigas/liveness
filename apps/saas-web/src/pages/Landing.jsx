import { Suspense, useEffect, lazy } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Copy,
  LineChart,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FAQSection } from "../components/landing/FAQSection";
import { HowItWorksInteractive } from "../components/landing/HowItWorksInteractive";
import { useLanding } from "../hooks/useLanding";

export default function Landing() {
  const {
    copied,
    openModal,
    copyToClipboard,
    scrollToTop,
    scrollToSection,
  } = useLanding();

  // Idle preload model manifest so /demo page loads instantly
  useEffect(() => {
    if (typeof window !== "undefined" && typeof fetch === "function") {
      const preload = () => {
        fetch(
          "https://cdn.jsdelivr.net/npm/@liveness/engine@1.0.9/assets/face_recognition/face_recognition_model-weights_manifest.json",
          { cache: "force-cache" },
        ).catch(() => {});
      };
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(preload);
        return () => window.cancelIdleCallback(id);
      } else {
        const timer = setTimeout(preload, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 selection:bg-[#2f5bf5] selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      <main id="main-content">
        {/* Hero Section */}
        <section className="border-b border-slate-200/80 bg-[#fafbfc] px-4 py-16 sm:px-6 md:px-12 md:pt-20 md:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl">
              <div>
                <h1 className="font-display mb-5 text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  Biometric face verification{" "}
                  <span className="text-[#2f5bf5]">built for developers</span>
                </h1>
                <p className="mb-8 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Verify real users and block spoofing attempts with client-side
                  liveness checks and biometric verification.
                </p>

                {/* npm install — primary developer CTA */}
                <div className="mb-6 flex w-full items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-900 p-2 shadow-xs sm:max-w-sm">
                  <div className="flex min-w-0 flex-1 items-center gap-2 pl-2 font-mono text-xs">
                    <span className="shrink-0 font-bold text-[#2f5bf5]">$</span>
                    <span className="truncate font-medium text-slate-200 select-all">
                      npm install @liveness/sdk
                    </span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                    title="Copy package installation command"
                    aria-label="Copy package installation command"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row">
                  <button
                    onClick={() => openModal("/signup")}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2f5bf5] px-5 py-2.5 text-center text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#204be8] sm:w-auto"
                  >
                    <span>Create account</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal("/login")}
                    className="w-full cursor-pointer rounded-md border border-slate-200/80 bg-white px-5 py-2.5 text-center text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="content-visibility-auto bg-white px-4 py-16 sm:px-6 md:px-12 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 md:mb-16">
              <h2 className="font-display mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                What the SDK does
              </h2>
              <p className="max-w-2xl text-xs text-slate-600 sm:text-sm">
                Biometric verification running directly in the browser with
                server-side descriptor matching.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {/* Card 1: full width */}
              <div className="rounded-[10px] border border-slate-200/80 bg-[#fafbfc] p-6 transition-colors hover:border-slate-300 sm:p-7 md:col-span-3">
                <div className="mb-3 flex items-center gap-2.5">
                  <Activity className="h-5 w-5 text-[#2f5bf5]" />
                  <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                    Client-side landmark tracking
                  </h3>
                </div>
                <p className="mb-5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Tracks 468 facial landmarks at 60 FPS in WebAssembly and WebGL
                  to detect subtle head movements and micro-actions without
                  sending video streams to a server.
                </p>
                <div className="grid gap-2.5 border-t border-slate-200/80 pt-4 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-200/80 bg-white p-3">
                    <div className="font-mono text-xs font-semibold text-slate-900">
                      468 3D points
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Sub-200ms latency
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200/80 bg-white p-3">
                    <div className="font-mono text-xs font-semibold text-slate-900">
                      Active challenges
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Turn left, turn right, blink
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200/80 bg-white p-3">
                    <div className="font-mono text-xs font-semibold text-slate-900">
                      Zero frame egress
                    </div>
                    <div className="text-[10px] text-slate-500">
                      100% on-device execution
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Full width 3 cols */}
              <div className="rounded-[10px] border border-slate-200/80 bg-[#fafbfc] p-6 transition-colors hover:border-slate-300 sm:p-7 md:col-span-3">
                <div className="grid gap-6 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-7">
                    <div className="mb-2 flex items-center gap-2.5">
                      <LineChart className="h-5 w-5 text-[#2f5bf5]" />
                      <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        Vector matching &amp; audit telemetry
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                      Raw webcam frames are never transmitted. The client
                      extracts a 128-dimensional numerical vector and sends it
                      alongside session tokens and cryptographic integrity
                      hashes for server-side template comparison.
                    </p>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2 md:col-span-5">
                    <div className="rounded-md border border-slate-200/80 bg-white p-3">
                      <div className="text-[10px] font-medium text-slate-500">
                        Embedding schema
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-bold text-slate-900">
                        128-d Float32 vector
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200/80 bg-white p-3">
                      <div className="text-[10px] font-medium text-slate-500">
                        Verification threshold
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-bold text-slate-900">
                        Cosine similarity &ge; 0.95
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section: Cobalt Dark Graphite Band */}
        <section
          id="how-it-works"
          className="content-visibility-auto border-y border-slate-800 bg-[#181a20] px-4 py-20 text-slate-100 sm:px-6 md:px-12 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="font-display mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                How it works
              </h2>
              <p className="mx-auto max-w-xl text-xs text-slate-400 sm:text-sm">
                Integrate liveness verification in three steps.
              </p>
            </div>

            {/* Interactive Steps + Code Viewer Grid */}
            <HowItWorksInteractive />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <footer className="content-visibility-footer border-t border-slate-200/80 bg-[#f4f6f8] px-4 py-12 sm:py-14 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-10 md:grid-cols-[1fr_auto]">
            {/* Left: Brand & blurb */}
            <div className="max-w-sm space-y-3.5">
              <Link
                to="/"
                onClick={scrollToTop}
                className="group flex cursor-pointer items-center gap-2"
              >
                <ShieldCheck className="h-6 w-6 shrink-0 text-[#2f5bf5]" />
                <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
                  Liveness
                  <span className="ml-0.5 text-[#2f5bf5]">Cloud</span>
                </span>
              </Link>
              <p className="text-xs leading-relaxed text-slate-500">
                Facial liveness detection API and SDK for client-side identity
                verification. Camera feeds stay on the device.
              </p>
              <a
                href="mailto:support@liveness.cloud"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 transition-colors hover:text-[#2f5bf5]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#2f5bf5]" />
                <span>support@liveness.cloud</span>
              </a>
            </div>

            {/* Right: Links as horizontal rows */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium text-slate-600 md:pt-1">
              <a
                href="#features"
                onClick={scrollToSection("features")}
                className="cursor-pointer transition-colors hover:text-[#2f5bf5]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={scrollToSection("how-it-works")}
                className="cursor-pointer transition-colors hover:text-[#2f5bf5]"
              >
                How it works
              </a>
              <a
                href="#faq"
                onClick={scrollToSection("faq")}
                className="cursor-pointer transition-colors hover:text-[#2f5bf5]"
              >
                FAQ
              </a>
              <Link
                to="/docs?section=introduction"
                className="transition-colors hover:text-[#2f5bf5]"
              >
                Docs
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200/80 pt-8 text-xs font-medium text-slate-500 sm:flex-row sm:items-center">
            <p>
              &copy; {new Date().getFullYear()} Liveness Cloud, Inc. All rights
              reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="transition-colors hover:text-slate-900"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="transition-colors hover:text-slate-900"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
