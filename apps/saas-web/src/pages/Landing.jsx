import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import "../landing.css"

function PipNav({ current, total }) {
  const sections = ["Intro", "Detection", "Architecture", "Deploy"];
  return (
    <div className="fixed top-1/2 right-8 z-[60] flex -translate-y-1/2 flex-col items-center gap-[10px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`progress-pip ${current === i ? "active" : ""}`}
          title={sections[i] || ""}
        />
      ))}
    </div>
  );
}

function Metric({ value, unit, label }) {
  return (
    <div className="px-8 text-center">
      <div className="font-['Bebas_Neue'] text-5xl text-white md:text-6xl">
        {value}
        <span className="![WebkitTextFillColor:var(--blue)] text-[0.5em] text-blue-600">
          {unit}
        </span>
      </div>
      <div className="mt-2 font-['DM_Mono'] text-[0.65rem] tracking-[0.2em] text-zinc-500 uppercase">
        {label}
      </div>
    </div>
  );
}

const IconBolt = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconChart = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconShield = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconCheck = ({ color = "#2563eb" }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card-lift flex min-w-65 flex-1 flex-col gap-4 rounded-lg border border-white/10 bg-white/3 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
        {icon}
      </div>
      <h4 className="m-0 font-['DM_Sans'] text-base font-bold text-zinc-50">
        {title}
      </h4>
      <p className="m-0 font-['DM_Sans'] text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function PricingCard({ plan, price, features, cta, highlighted, to }) {
  return (
    <div
      className={`card-lift relative flex max-w-85 flex-1 shrink-0 grow basis-65 flex-col gap-5 rounded-xl p-8 ${
        highlighted ? "bg-blue-600" : "border border-white/10 bg-white/5"
      }`}
    >
      {highlighted && (
        <span className="absolute top-5 right-5 rounded-full bg-white/20 px-[0.6rem] py-1 font-['DM_Mono'] text-[0.55rem] tracking-widest text-white uppercase">
          Popular
        </span>
      )}
      <div>
        <div
          className={`mb-3 font-['DM_Sans'] text-base font-bold ${highlighted ? "text-white" : "text-zinc-50"}`}
        >
          {plan}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={`font-['Bebas_Neue'] text-[3rem] leading-none ${highlighted ? "text-white" : "text-zinc-50"}`}
          >
            {price}
          </span>
          <span
            className={`mb-[0.4rem] font-['DM_Mono'] text-[0.7rem] ${highlighted ? "text-white/70" : "text-zinc-500"}`}
          >
            /mo
          </span>
        </div>
      </div>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <IconCheck color={highlighted ? "#fff" : "#2563eb"} />
            <span
              className={`font-['DM_Sans'] text-sm ${highlighted ? "text-white/90" : "text-zinc-400"}`}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to={to}
        className={`mt-auto block rounded-md py-[0.85rem] text-center font-['DM_Mono'] text-[0.7rem] font-semibold tracking-[0.15em] uppercase no-underline transition-all duration-200 ${
          highlighted
            ? "bg-white text-blue-600"
            : "border border-white/15 text-zinc-50 hover:bg-white/5"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

// --- Main Component ---

const Landing = () => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  const frameCount = 276;

  const getFrameUrl = (index) => {
    const frameNumber = (index + 1).toString().padStart(3, "0");
    return `/vidframe/ezgif-frame-${frameNumber}.png`;
  };

  const renderCanvas = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[index]) return;
    const ctx = canvas.getContext("2d");
    const img = imagesRef.current[index];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cA = canvas.width / canvas.height;
    const iA = img.width / img.height;
    let dW, dH, oX, oY;

    if (cA > iA) {
      dW = canvas.width;
      dH = canvas.width / iA;
      oX = 0;
      oY = (canvas.height - dH) / 2;
    } else {
      dW = canvas.height * iA;
      dH = canvas.height;
      oX = (canvas.width - dW) / 2;
      oY = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, oX, oY, dW, dH);

    const grad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.height * 0.2,
      canvas.width / 2,
      canvas.height / 2,
      canvas.height * 0.9,
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,8,30,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadedCount++;
        setProgress(Math.floor((loadedCount / frameCount) * 100));
        if (loadedCount === frameCount) {
          setLoading(false);
          setTimeout(() => setReady(true), 400);
          renderCanvas(0);
        }
      };
      imagesRef.current[i] = img;
    }
  }, [renderCanvas]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          const frac = scrollTop / maxScroll;
          const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(frac * frameCount),
          );

          setScrollPct(frac);
          setCurrentSection(Math.floor(frac * 4));
          renderCanvas(frameIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => renderCanvas(0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [loading, renderCanvas]);

  return (
    <div className="scanlines grain min-h-screen bg-black font-['DM_Sans'] text-zinc-50">
      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8 bg-black">
          <div className="relative h-20 w-20">
            <svg
              className="spinner h-full w-full"
              viewBox="0 0 80 80"
              fill="none"
            >
              <circle cx="40" cy="40" r="34" stroke="#27272a" strokeWidth="2" />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="60 150"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-['DM_Mono'] text-[0.65rem] tracking-widest text-blue-600">
              {progress}%
            </div>
          </div>

          <div className="text-center">
            <div className="mb-1 font-['Bebas_Neue'] text-[1.8rem] tracking-[0.3em] text-zinc-50">
              LIVENESS
            </div>
            <div className="font-['DM_Mono'] text-[0.6rem] tracking-[0.25em] text-zinc-600 uppercase">
              Preloading frames
              <span className="caret" />
            </div>
          </div>

          <div className="relative w-55">
            <div className="h-px w-full rounded-sm bg-zinc-800">
              <div
                className="loading-bar h-full rounded-sm bg-linear-to-r from-blue-800 via-blue-600 to-blue-400 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between font-['DM_Mono'] text-[0.55rem] tracking-widest text-zinc-700 uppercase">
              <span>FRAMES</span>
              <span>
                {Math.floor((progress / 100) * frameCount)} / {frameCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {ready && <PipNav current={Math.min(currentSection, 3)} total={4} />}

      {/* ── SCROLL PROGRESS BAR ── */}
      <div
        className="fixed top-0 left-0 z-200 h-0.5 bg-linear-to-r from-blue-800 via-blue-600 to-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.6)] transition-[width] duration-75"
        style={{ width: `${scrollPct * 100}%` }}
      />

      <div id="#main" className="fixed inset-0 z-0">
        <canvas ref={canvasRef} className="block" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <section className="flex h-screen flex-col items-center justify-center px-6 text-center">
          {ready && (
            <>
              <div className="fade-up fade-up-1 mb-6 font-['DM_Mono'] text-[0.65rem] tracking-[0.3em] text-blue-600 uppercase">
                ◆ BIOMETRIC AUTHENTICATION ◆
              </div>

              <h1
                className="fade-up fade-up-2 glitch-wrapper mb-6 max-w-[16ch] font-['DM_Sans'] text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-bold tracking-tight text-white shadow-black/20 text-shadow-lg"
                data-text="Secure Face Liveness Verification"
              >
                Secure Face Liveness{" "}
                <span className="text-blue-400">Verification</span>
              </h1>
              <p className="fade-up fade-up-3 mb-10 max-w-[44ch] text-base leading-relaxed text-zinc-500">
                Protect your platform from spoofing attacks with our
                enterprise-grade liveness detection API. Fast, accurate, and
                easy to integrate.
              </p>

              <div className="fade-up fade-up-4 mb-8 flex flex-wrap justify-center gap-4">
                <Link to="/signup" className="btn-cta">
                  Start Building Now
                </Link>
                <Link to="/login" className="btn-ghost">
                  View Demo
                </Link>
              </div>

              <div className="fade-up fade-up-4 flex flex-wrap justify-center gap-6">
                {["No Credit Card Required", "Free Tier Available"].map(
                  (badge) => (
                    <div
                      key={badge}
                      className="flex items-center gap-2 font-['DM_Sans'] text-[0.8rem] text-zinc-600"
                    >
                      <IconCheck color="#2563eb" />
                      <span>{badge}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}

          {ready && (
            <div
              className="scroll-bounce absolute bottom-10 flex flex-col items-center gap-[6px] transition-opacity duration-500"
              style={{ opacity: scrollPct > 0.02 ? 0 : 1 }}
            >
              <div className="font-['DM_Mono'] text-[0.55rem] tracking-[0.25em] text-zinc-700 uppercase">
                Scroll
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-blue-600 to-transparent" />
            </div>
          )}
        </section>

        {/* ── METRICS STRIP ── */}
        <section className="flex h-screen items-center justify-center">
          <div className="flex w-[90%] max-w-[900px] flex-wrap justify-center gap-2 rounded-sm border-y border-zinc-800 bg-zinc-950/70 px-16 py-12 backdrop-blur-2xl">
            <Metric value="99.8" unit="%" label="Liveness Accuracy" />
            <div className="hidden w-px self-stretch bg-zinc-800 md:block" />
            <Metric value="<40" unit="ms" label="Inference Time" />
            <div className="hidden w-px self-stretch bg-zinc-800 md:block" />
            <Metric value="0" unit="KB" label="Server Req." />
            <div className="hidden w-px self-stretch bg-zinc-800 md:block" />
            <Metric value="2" unit="MB" label="Model Size" />
          </div>
        </section>

        {/* ── FEATURE 1: DETECTION ── */}
        <section
          id="about"
          className="flex h-screen items-center justify-end px-[5vw]"
        >
          <div className="card-lift relative max-w-[420px] rounded-sm border border-l-2 border-zinc-800 border-l-blue-600 bg-zinc-950/85 p-10 backdrop-blur-3xl">
            <span className="rule-blue" />
            <div className="mb-3 font-['DM_Mono'] text-[0.6rem] tracking-[0.25em] text-blue-600 uppercase">
              01 / Detection
            </div>
            <h3 className="mb-5 font-['Bebas_Neue'] text-[2.8rem] leading-none tracking-wider text-zinc-50">
              Real-Time
              <br />
              Depth Analysis.
            </h3>
            <p className="text-sm leading-relaxed text-zinc-500">
              Ensures every subject is a physical, living human — not a
              high-resolution photograph, deepfake video, or silicone mask.
              Sub-40ms inference means zero user friction.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              {["Anti-spoofing", "3D depth", "IR-compatible"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-[2px] border border-zinc-800 px-3 py-1 font-['DM_Mono'] text-[0.6rem] tracking-widest text-zinc-600 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE 2: ARCHITECTURE ── */}
        <section className="flex h-screen items-center justify-start px-[5vw]">
          <div className="card-lift relative max-w-[420px] rounded-sm bg-zinc-50 p-10 text-zinc-950 shadow-[0_24px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.8)]">
            <span className="rule-blue" />
            <div className="mb-3 font-['DM_Mono'] text-[0.6rem] tracking-[0.25em] text-zinc-500 uppercase">
              02 / Architecture
            </div>
            <h3 className="mb-5 font-['Bebas_Neue'] text-[2.8rem] leading-none tracking-wider text-zinc-950">
              Neural
              <br />
              Networks.
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600">
              A lightweight MobileNet-v3 variant pruned for edge deployment.
              Runs entirely on-device — no data leaves the user's hardware.
              ONNX-exportable for cross-platform compatibility.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                ["WebGL", "GPU accelerated"],
                ["ONNX", "Cross-platform"],
                ["Quantized", "INT8 precision"],
                ["Pruned", "Lightweight CNN"],
              ].map(([label, desc]) => (
                <div
                  key={label}
                  className="rounded-sm border-l-2 border-l-blue-600 bg-zinc-100 p-3"
                >
                  <div className="font-['DM_Mono'] text-[0.6rem] font-medium tracking-widest text-zinc-950">
                    {label}
                  </div>
                  <div className="mt-[2px] text-[0.7rem] text-zinc-500">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          className="flex min-h-screen flex-col items-center justify-center bg-black/70 px-[5vw] py-24 backdrop-blur-2xl"
        >
          <div className="mb-14 text-center">
            <div className="mb-4 font-['DM_Mono'] text-base tracking-[0.3em] text-blue-600 uppercase">
              ◆ FEATURES ◆
            </div>
            <h2 className="mb-3 font-['DM_Sans'] text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight text-zinc-50">
              Why Liveness Cloud?
            </h2>
            <p className="mx-auto max-w-[44ch] text-[0.95rem] leading-relaxed text-zinc-500">
              Industry-leading biometric security for modern applications.
            </p>
          </div>
          <div className="flex w-full max-w-[1000px] flex-wrap justify-center gap-6">
            <FeatureCard
              icon={<IconBolt />}
              title="Real-time Detection"
              description="Process liveness checks in milliseconds using our optimized neural networks."
            />
            <FeatureCard
              icon={<IconChart />}
              title="Advanced Analytics"
              description="Gain insights into verification patterns and security metrics with our dashboard."
            />
            <FeatureCard
              icon={<IconShield />}
              title="Spoof Protection"
              description="Robust detection against photos, videos, masks, and deepfake attempts."
            />
          </div>
        </section>

        {/* ── PRICING SECTION ── */}
        <section
          id="pricing"
          className="flex min-h-screen flex-col items-center justify-center bg-black/80 px-[5vw] py-24 backdrop-blur-sm"
        >
          <div className="mb-14 text-center">
            <h2 className="mb-3 font-['DM_Sans'] text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight text-zinc-50">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-zinc-500">
              Start free, scale when you're ready.
            </p>
          </div>
          <div className="flex w-full max-w-[760px] flex-wrap justify-center gap-6">
            <PricingCard
              plan="Free"
              price="$0"
              features={[
                "1,000 checks/month",
                "Community Support",
                "Basic Analytics",
              ]}
              cta="Start for free"
              highlighted={false}
              to="/signup"
            />
            <PricingCard
              plan="Pro"
              price="$49"
              features={[
                "Unlimited checks",
                "Priority 24/7 Support",
                "Advanced Analytics",
              ]}
              cta="Get Pro Access"
              highlighted={true}
              to="/signup"
            />
          </div>
        </section>

        <section
          id="github"
          className="relative flex h-screen flex-col items-center justify-center bg-gradient-to-t from-black/10 to-[#00050f]/80 px-6 text-center"
        >
          <div className="mb-6 font-['DM_Mono'] text-[0.6rem] tracking-[0.3em] text-blue-400 uppercase">
            ◆ Open Source ◆
          </div>
          <h2 className="mb-6 font-['Bebas_Neue'] text-[clamp(3rem,10vw,7rem)] leading-[0.95] tracking-wider text-white drop-shadow-[0_0_60px_rgba(37,99,235,0.4)]">
            Ready to
            <br />
            <span className="text-blue-400">Deploy?</span>
          </h2>
          <p className="mb-10 max-w-[38ch] text-[0.9rem] leading-relaxed font-extralight text-white">
            MIT-licensed. Drop-in integration for any web or mobile application.
            Stars appreciated — issues even more so.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/johnpaulpatigas/liveness"
              target="_blank"
              rel="noreferrer"
              className="btn-cta"
            >
              ★ Star on GitHub
            </a>
            <Link to="/signup" className="btn-ghost">
              Read the Docs
            </Link>
          </div>
          <div className="absolute bottom-8 font-['DM_Mono'] text-[0.55rem] tracking-widest text-zinc-700 uppercase">
            <span>© 2026 Liveness Cloud. All rights reserved.</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;