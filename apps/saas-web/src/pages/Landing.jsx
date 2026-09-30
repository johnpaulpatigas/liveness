import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  LineChart,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openModal = (path) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm install @liveness/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      <main id="main-content">
        {/* Hero Section */}
      <section className="bg-linear-to-b from-slate-50 to-white px-4 py-20 sm:px-6 md:px-12 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Secure Face Liveness{" "}
            <span className="text-blue-600">Verification</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
            Verify real users and block spoofing attempts with client-side
            liveness checks and biometric verification.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => openModal("/signup")}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 sm:w-auto"
            >
              <span>Create account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => openModal("/login")}
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
            >
              Sign in
            </button>
          </div>

          <div className="mx-auto mt-10 max-w-xs rounded-xl border border-slate-200 bg-slate-950 p-2.5 shadow-md transition-all hover:border-slate-300 sm:max-w-sm md:max-w-md">
            <div className="flex items-center justify-between font-mono text-xs sm:text-sm">
              <div className="flex items-center space-x-2 overflow-hidden pl-2 text-slate-400">
                <span className="font-bold text-blue-500">$</span>
                <span className="truncate font-medium text-slate-200 select-all">
                  npm install @liveness/sdk
                </span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex w-21 shrink-0 cursor-pointer items-center justify-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                title="Copy package installation command"
                aria-label="Copy package installation command"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-white px-4 py-20 sm:px-6 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Core capabilities
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
              Biometric verification running directly in the browser with
              server-side descriptor matching.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Bento Card 1: 2 cols wide */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-colors hover:border-slate-300 sm:p-8 md:col-span-2">
              <div className="mb-4 flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Client-side landmark tracking
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Tracks 468 facial landmarks at 60 FPS in WebAssembly and WebGL
                to detect subtle head movements and micro-actions without
                sending video streams to a server.
              </p>
              <div className="grid gap-3 border-t border-slate-200/60 pt-5 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <div className="font-mono text-xs font-semibold text-slate-900">
                    468 3D points
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sub-200ms latency
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <div className="font-mono text-xs font-semibold text-slate-900">
                    Active challenges
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Turn left, turn right, blink
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <div className="font-mono text-xs font-semibold text-slate-900">
                    Zero frame egress
                  </div>
                  <div className="text-[11px] text-slate-500">
                    100% on-device execution
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: 1 col wide */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-colors hover:border-slate-300 sm:p-8 md:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Spoof defense
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Presentation attack detection stops physical and digital bypass
                attempts before identity vectors are calculated.
              </p>
              <ul className="space-y-2.5 border-t border-slate-200/60 pt-5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span>Printed photo and paper mask rejection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span>Digital screen and video replay defense</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span>3D silicone mask and deepfake prevention</span>
                </li>
              </ul>
            </div>

            {/* Bento Card 3: Full width 3 cols */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-colors hover:border-slate-300 sm:p-8 md:col-span-3">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-7">
                  <div className="mb-3 flex items-center gap-2.5">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Vector matching &amp; audit telemetry
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Raw webcam frames are never transmitted. The client extracts
                    a 128-dimensional numerical vector and sends it alongside
                    session tokens and cryptographic integrity hashes for
                    server-side template comparison.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:col-span-5">
                  <div className="rounded-xl border border-slate-200/60 bg-white p-3.5">
                    <div className="text-[11px] font-medium text-slate-500">
                      Embedding schema
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-bold text-slate-900">
                      128-d Float32 vector
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-white p-3.5">
                    <div className="text-[11px] font-medium text-slate-500">
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

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="border-y border-slate-200/60 bg-slate-50/80 px-4 py-20 sm:px-6 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto max-w-xl text-sm text-slate-600 sm:text-base">
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

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200/80 bg-slate-50/70 px-4 py-14 sm:py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
            {/* Column 1: Brand & Status */}
            <div className="space-y-4 md:col-span-1">
              <Link
                to="/"
                onClick={scrollToTop}
                className="group flex cursor-pointer items-center gap-2"
              >
                <ShieldCheck className="h-6 w-6 shrink-0 text-blue-600" />
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Liveness
                  <span className="ml-0.5 font-light text-blue-600">Cloud</span>
                </span>
              </Link>
              <p className="text-xs leading-relaxed text-slate-500">
                Facial liveness detection API and SDK for client-side identity
                verification.
              </p>
              <div className="space-y-2 pt-1">
                <a
                  href="mailto:support@liveness.cloud"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition-colors hover:text-blue-600"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span>support@liveness.cloud</span>
                </a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <p className="mb-4 text-xs font-bold tracking-wider text-slate-900 uppercase">
                Product
              </p>
              <ul className="space-y-2.5 text-xs font-medium text-slate-600">
                <li>
                  <a
                    href="#features"
                    onClick={scrollToSection("features")}
                    className="cursor-pointer transition-colors hover:text-blue-600"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    onClick={scrollToSection("how-it-works")}
                    className="cursor-pointer transition-colors hover:text-blue-600"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => openModal("/login")}
                    className="cursor-pointer text-left transition-colors hover:text-blue-600"
                  >
                    Console Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Developer & Resources */}
            <div>
              <p className="mb-4 text-xs font-bold tracking-wider text-slate-900 uppercase">
                Developers
              </p>
              <ul className="space-y-2.5 text-xs font-medium text-slate-600">
                <li>
                  <Link
                    to="/docs?section=introduction"
                    className="transition-colors hover:text-blue-600"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/docs?section=sdk-usage"
                    className="transition-colors hover:text-blue-600"
                  >
                    Quickstart Guide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/docs?section=api-ref"
                    className="transition-colors hover:text-blue-600"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={scrollToSection("faq")}
                    className="cursor-pointer transition-colors hover:text-blue-600"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Security & Compliance */}
            <div>
              <p className="mb-4 text-xs font-bold tracking-wider text-slate-900 uppercase">
                Trust & Security
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                Camera feeds stay on the device. Descriptors are processed in
                memory and scored without storing raw images.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-xs font-medium text-slate-600 sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} Liveness Cloud, Inc. All rights
              reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="transition-colors hover:text-slate-900"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="transition-colors hover:text-slate-900"
              >
                Terms of Service
              </Link>
              <Link
                to="/docs"
                className="transition-colors hover:text-slate-900"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FAQ_DATA = [
  {
    question: "How accurate is the liveness detection?",
    answer:
      "The SDK tracks 468 facial landmarks to verify natural movement and head orientation, blocking static photos and screen replays.",
  },
  {
    question: "What browsers and devices are supported?",
    answer:
      "The SDK runs in Chrome, Safari, Firefox, and Edge on iOS, Android, macOS, and Windows.",
  },
  {
    question: "Is user biometric data stored on your servers?",
    answer:
      "Servers never receive camera images. The client extracts a 128-dimensional numerical vector, and matching runs without storing raw photos.",
  },
  {
    question: "How long does SDK integration take?",
    answer:
      "Basic integration requires calling load() and start() on the video element, then posting the resulting descriptor to your verification endpoint.",
  },
  {
    question: "Is there a limit on API usage?",
    answer:
      "API keys and verification requests have no usage caps or rate tiers.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section
      id="faq"
      className="border-t border-slate-200/60 bg-slate-50/80 px-4 py-20 sm:px-6 md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-600 sm:text-base">
            Common questions about integrating and deploying Liveness Cloud.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all"
              >
                <button
                  id={`faq-question-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => toggleFaq(index)}
                  className="flex w-full cursor-pointer items-center justify-between p-5 text-left font-bold text-slate-900 transition-colors hover:text-blue-600 sm:p-6"
                >
                  <span className="pr-4 text-base sm:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className="border-t border-slate-100 px-5 pt-0 pb-6 text-sm leading-relaxed text-slate-600 sm:px-6 sm:pb-6 sm:text-base"
                  >
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const STEPS_DATA = [
  {
    id: 1,
    step: "Step 1",
    title: "Install Package",
    description: "Add @liveness/sdk to your project using npm or yarn.",
    fileName: "Terminal",
    code: `npm install @liveness/sdk`,
    statusMessage: "Package ready for initialization",
    tag: "Frontend SDK",
  },
  {
    id: 2,
    step: "Step 2",
    title: "Run Active Session",
    description:
      "Attach the SDK to your video element and listen for challenge events.",
    fileName: "LivenessCamera.jsx",
    code: `import { LivenessSDK } from '@liveness/sdk';

const sdk = new LivenessSDK({ basePath: '/assets/models' });
await sdk.load();

sdk.on('challenge', ({ instruction }) => updateUI(instruction));
sdk.on('success', (result) => verifyWithServer(result));

await sdk.start(videoElement, canvasElement);`,
    statusMessage: "Active tracking: 60 FPS face mesh ok",
    tag: "Client Runtime",
  },
  {
    id: 3,
    step: "Step 3",
    title: "Verify via Cloud API",
    description:
      "Send the descriptor payload to your backend to compare against enrolled users.",
    fileName: "api/verify.js",
    code: `// Express / Node.js Backend Handler
app.post('/api/verify', async (req, res) => {
  const response = await fetch('https://api.liveness.cloud/api/liveness/verify', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.LIVENESS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const result = await response.json();
  res.json(result);
});`,
    statusMessage: "HTTP 200 OK: Match confirmed (similarity: 0.98)",
    tag: "Backend Verification",
  },
];

const HowItWorksInteractive = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepCopied, setStepCopied] = useState(false);

  const activeStepData = STEPS_DATA[activeStepIndex];

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setStepCopied(true);
    setTimeout(() => setStepCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile Step Selector Tabs (Visible on small screens < 1024px) */}
      <div className="mb-6 flex items-center justify-between gap-2 rounded-xl bg-slate-200/60 p-1.5 lg:hidden">
        {STEPS_DATA.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => {
              setActiveStepIndex(idx);
              setStepCopied(false);
            }}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-center text-xs font-bold transition-all ${
              idx === activeStepIndex
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Step {step.id}
          </button>
        ))}
      </div>

      <div className="grid items-stretch gap-6 text-left lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Interactive Step Cards (Desktop / Tablet) */}
        <div className="flex min-w-0 flex-col justify-between space-y-3 sm:space-y-4 lg:col-span-5">
          {STEPS_DATA.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStepIndex(idx);
                  setStepCopied(false);
                }}
                className={`w-full cursor-pointer rounded-2xl border p-6 text-left transition-all duration-200 sm:p-8 ${
                  isActive
                    ? "border-slate-300 bg-white shadow-lg ring-1 shadow-slate-900/5 ring-slate-200"
                    : "border-slate-200/80 bg-white/60 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase sm:text-xs ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {step.step}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-slate-600 sm:text-xs">
                    {step.tag}
                  </span>
                </div>
                <h3 className="mb-1 flex items-center justify-between text-base font-bold text-slate-900 sm:text-lg">
                  <span>{step.title}</span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isActive
                        ? "translate-x-1 text-slate-900"
                        : "text-slate-300"
                    }`}
                  />
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Code Window Mockup */}
        <div className="flex min-w-0 flex-col lg:col-span-7">
          <div className="flex h-full max-w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/90 px-3 py-3 sm:px-4">
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-300">
                  {activeStepData.fileName}
                </span>
              </div>

              {/* Quick Step Switcher Tabs */}
              <div
                role="tablist"
                aria-label="Integration steps"
                className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-950 p-1"
              >
                {STEPS_DATA.map((step, idx) => (
                  <button
                    key={step.id}
                    role="tab"
                    aria-selected={idx === activeStepIndex}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setStepCopied(false);
                    }}
                    className={`cursor-pointer rounded-md px-2 py-0.5 font-mono text-[10px] font-medium transition-colors sm:px-2.5 sm:py-1 sm:text-[11px] ${
                      idx === activeStepIndex
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Step {step.id}
                  </button>
                ))}
              </div>

              {/* Copy Button */}
              <button
                onClick={() => handleCopyCode(activeStepData.code)}
                className="flex w-21 shrink-0 cursor-pointer items-center justify-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                title="Copy code snippet"
                aria-label="Copy code snippet"
              >
                {stepCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Viewport */}
            <div className="max-w-full min-w-0 flex-1 overflow-x-auto bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed text-slate-200 sm:p-6 sm:text-sm">
              <pre className="wrap-break-word whitespace-pre-wrap sm:whitespace-pre">
                <code>{activeStepData.code}</code>
              </pre>
            </div>

            {/* Output State */}
            <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-400">
              <span className="font-mono text-[11px] text-emerald-400">
                {activeStepData.statusMessage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
