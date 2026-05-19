import { useEffect, useRef, useState, useCallback } from "react";
import "./landingpage.css";

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx = -100,
      my = -100;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      ring.style.left = mx + "px";
      ring.style.top = my + "px";
    };

    const onDown = () => {
      dot.style.transform = "translate(-50%,-50%) scale(2)";
      ring.style.width = "50px";
      ring.style.height = "50px";
    };
    const onUp = () => {
      dot.style.transform = "translate(-50%,-50%) scale(1)";
      ring.style.width = "36px";
      ring.style.height = "36px";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

function PipNav({ current, total }) {
  const sections = ["Intro", "Detection", "Architecture", "Deploy"];
  return (
    <div
      style={{
        position: "fixed",
        right: "2rem",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`progress-pip${current === i ? " active" : ""}`}
          title={sections[i] || ""}
        />
      ))}
    </div>
  );
}

function Metric({ value, unit, label }) {
  return (
    <div style={{ textAlign: "center", padding: "0 2rem" }}>
      <div className="metric-value">
        {value}
        <span
          style={{
            fontSize: "0.5em",
            WebkitTextFillColor: "var(--blue)",
          }}
        >
          {unit}
        </span>
      </div>
      <div className="metric-label" style={{ marginTop: "0.5rem" }}>
        {label}
      </div>
    </div>
  );
}

/* ── Icons ── */
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

/* ── Feature Card (for Features + Pricing sections) ── */
function FeatureCard({ icon, title, description }) {
  return (
    <div
      className="card-lift"
      style={{
        flex: "1 1 260px",
        padding: "2rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "8px",
          background: "rgba(37,99,235,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <h4
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#fafafa",
          margin: 0,
        }}
      >
        {title}
      </h4>
      <p
        style={{
          color: "#71717a",
          fontSize: "0.875rem",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ plan, price, features, cta, highlighted }) {
  return (
    <div
      className="card-lift"
      style={{
        flex: "1 1 260px",
        maxWidth: 340,
        padding: "2rem",
        background: highlighted ? "#2563eb" : "rgba(255,255,255,0.04)",
        border: highlighted ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        position: "relative",
      }}
    >
      {highlighted && (
        <span
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "0.25rem 0.6rem",
            borderRadius: "100px",
          }}
        >
          Popular
        </span>
      )}
      <div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: highlighted ? "#fff" : "#fafafa",
            marginBottom: "0.75rem",
          }}
        >
          {plan}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px" }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "3rem",
              lineHeight: 1,
              color: highlighted ? "#fff" : "#fafafa",
            }}
          >
            {price}
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              color: highlighted ? "rgba(255,255,255,0.7)" : "#71717a",
              marginBottom: "0.4rem",
            }}
          >
            /mo
          </span>
        </div>
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {features.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <IconCheck color={highlighted ? "#fff" : "#2563eb"} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                color: highlighted ? "rgba(255,255,255,0.9)" : "#a1a1aa",
              }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <button
        style={{
          marginTop: "auto",
          padding: "0.85rem",
          borderRadius: "6px",
          border: highlighted ? "none" : "1px solid rgba(255,255,255,0.15)",
          background: highlighted ? "#fff" : "transparent",
          color: highlighted ? "#2563eb" : "#fafafa",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: "none",
          fontWeight: 600,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!highlighted) {
            e.target.style.background = "rgba(255,255,255,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          if (!highlighted) {
            e.target.style.background = "transparent";
          }
        }}
      >
        {cta}
      </button>
    </div>
  );
}

const LivenessLanding = () => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

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

  // Preload
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
    const handleScroll = () => {
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
      setNavScrolled(scrollTop > 40);
      requestAnimationFrame(() => renderCanvas(frameIndex));
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
    <div
      className="scanlines grain"
      style={{
        background: "#000",
        color: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <CustomCursor />

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            gap: "2rem",
          }}
        >
          {/* Spinner ring */}
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <svg
              className="spinner"
              width="80"
              height="80"
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
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                color: "#2563eb",
                letterSpacing: "0.1em",
              }}
            >
              {progress}%
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.8rem",
                letterSpacing: "0.3em",
                color: "#fafafa",
                marginBottom: "0.25rem",
              }}
            >
              LIVENESS
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                color: "#52525b",
                textTransform: "uppercase",
              }}
            >
              Preloading frames
              <span className="caret" />
            </div>
          </div>

          <div style={{ width: 220, position: "relative" }}>
            <div
              style={{
                height: 1,
                background: "#27272a",
                borderRadius: 1,
              }}
            >
              <div
                className="loading-bar"
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)",
                  borderRadius: 1,
                  transition: "width 0.25s ease",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "0.75rem",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.55rem",
                color: "#3f3f46",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              <span>FRAMES</span>
              <span>
                {Math.floor((progress / 100) * frameCount)} / {frameCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section pip nav */}
      {ready && <PipNav current={Math.min(currentSection, 3)} total={4} />}

      {/* Scroll progress bar at top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "2px",
          width: `${scrollPct * 100}%`,
          background: "linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)",
          zIndex: 200,
          transition: "width 0.05s linear",
          boxShadow: "0 0 8px rgba(37,99,235,0.6)",
        }}
      />

      {/* Fixed Canvas */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          padding: "1rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50,
          background: "" /* Semi-transparent dark background */,
          backdropFilter: "blur(10px)" /* Frosted glass effect */,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#fff",
              letterSpacing: "0.02em",
            }}
          >
            Liveness Cloud
          </span>
        </div>

        {/* Center nav links */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                color: "#d4d4d8",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#fff")}
              onMouseLeave={(e) => (e.target.style.color = "#d4d4d8")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <a
            href="#login"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.875rem",
              color: "#d4d4d8",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#fff")}
            onMouseLeave={(e) => (e.target.style.color = "#d4d4d8")}
          >
            Log in
          </a>
          <a
            href="#pricing"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              background: "#2563eb",
              padding: "0.5rem 1.1rem",
              borderRadius: "6px",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#1d4ed8";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Get Started
          </a>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 10 }}>
        {/* ── HERO ── */}
        <section
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 1.5rem",
          }}
        >
          {ready && (
            <>
              <div
                className="fade-up fade-up-1"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#2563eb",
                  marginBottom: "1.5rem",
                }}
              >
                ◆ BIOMETRIC AUTHENTICATION ◆
              </div>

              <h1
                className="fade-up fade-up-2 glitch-wrapper"
                data-text="Secure Face Liveness Verification"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem,7vw,5.5rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#fafafa",
                  marginBottom: "1.5rem",
                  maxWidth: "16ch",
                }}
              >
                Secure Face Liveness{" "}
                <span style={{ color: "#2563eb" }}>Verification</span>
              </h1>

              <p
                className="fade-up fade-up-3"
                style={{
                  maxWidth: "44ch",
                  color: "#71717a",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  marginBottom: "2.5rem",
                }}
              >
                Protect your platform from spoofing attacks with our
                enterprise-grade liveness detection API. Fast, accurate, and
                easy to integrate.
              </p>

              <div
                className="fade-up fade-up-4"
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginBottom: "2rem",
                }}
              >
                <a href="#pricing" className="btn-cta">
                  Start Building Now
                </a>
                <button className="btn-ghost" style={{ cursor: "none" }}>
                  View Demo
                </button>
              </div>

              {/* Trust badges */}
              <div
                className="fade-up fade-up-4"
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {["No Credit Card Required", "Free Tier Available"].map(
                  (badge) => (
                    <div
                      key={badge}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "#52525b",
                        fontSize: "0.8rem",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <IconCheck color="#2563eb" />
                      <span>{badge}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}

          {/* Scroll indicator */}
          {ready && (
            <div
              className="scroll-bounce"
              style={{
                position: "absolute",
                bottom: "2.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                opacity: scrollPct > 0.02 ? 0 : 1,
                transition: "opacity 0.5s",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.25em",
                  color: "#3f3f46",
                  textTransform: "uppercase",
                }}
              >
                Scroll
              </div>
              <div
                style={{
                  width: 1,
                  height: 40,
                  background:
                    "linear-gradient(to bottom, #2563eb, transparent)",
                }}
              />
            </div>
          )}
        </section>

        {/* ── METRICS STRIP ── */}
        <section
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem",
              borderTop: "1px solid #27272a",
              borderBottom: "1px solid #27272a",
              padding: "3rem 4rem",
              background: "rgba(9,9,11,0.7)",
              backdropFilter: "blur(20px)",
              maxWidth: "900px",
              width: "90%",
              borderRadius: "4px",
            }}
          >
            <Metric value="99.8" unit="%" label="Liveness Accuracy" />
            <div
              style={{
                width: 1,
                background: "#27272a",
                alignSelf: "stretch",
              }}
            />
            <Metric value="<40" unit="ms" label="Inference Time" />
            <div
              style={{
                width: 1,
                background: "#27272a",
                alignSelf: "stretch",
              }}
            />
            <Metric value="0" unit="KB" label="Server Req." />
            <div
              style={{
                width: 1,
                background: "#27272a",
                alignSelf: "stretch",
              }}
            />
            <Metric value="2" unit="MB" label="Model Size" />
          </div>
        </section>

        {/* ── FEATURE 1 ── */}
        <section
          id="about"
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 5vw",
          }}
        >
          <div
            className="card-lift"
            style={{
              maxWidth: "420px",
              padding: "2.5rem",
              background: "rgba(9,9,11,0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid #27272a",
              borderRadius: "6px",
              borderLeft: "2px solid #2563eb",
            }}
          >
            <span className="rule-blue" />
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#2563eb",
                marginBottom: "0.75rem",
              }}
            >
              01 / Detection
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2.8rem",
                letterSpacing: "0.05em",
                lineHeight: 1,
                marginBottom: "1.25rem",
                color: "#fafafa",
              }}
            >
              Real-Time
              <br />
              Depth Analysis.
            </h3>
            <p
              style={{
                color: "#71717a",
                lineHeight: 1.75,
                fontSize: "0.9rem",
              }}
            >
              Ensures every subject is a physical, living human — not a
              high-resolution photograph, deepfake video, or silicone mask.
              Sub-40ms inference means zero user friction.
            </p>
            <div
              style={{
                marginTop: "1.75rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              {["Anti-spoofing", "3D depth", "IR-compatible"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.6rem",
                    padding: "0.3rem 0.75rem",
                    border: "1px solid #27272a",
                    borderRadius: "2px",
                    color: "#52525b",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE 2 ── */}
        <section
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "0 5vw",
          }}
        >
          <div
            className="card-lift"
            style={{
              maxWidth: "420px",
              padding: "2.5rem",
              background: "rgba(250,250,250,0.95)",
              color: "#09090b",
              borderRadius: "6px",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <span className="rule-blue" />
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#71717a",
                marginBottom: "0.75rem",
              }}
            >
              02 / Architecture
            </div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2.8rem",
                letterSpacing: "0.05em",
                lineHeight: 1,
                marginBottom: "1.25rem",
                color: "#09090b",
              }}
            >
              Neural
              <br />
              Networks.
            </h3>
            <p
              style={{
                color: "#52525b",
                lineHeight: 1.75,
                fontSize: "0.9rem",
              }}
            >
              A lightweight MobileNet-v3 variant pruned for edge deployment.
              Runs entirely on-device — no data leaves the user's hardware.
              ONNX-exportable for cross-platform compatibility.
            </p>
            <div
              style={{
                marginTop: "1.75rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {[
                ["WebGL", "GPU accelerated"],
                ["ONNX", "Cross-platform"],
                ["Quantized", "INT8 precision"],
                ["Pruned", "Lightweight CNN"],
              ].map(([label, desc]) => (
                <div
                  key={label}
                  style={{
                    padding: "0.75rem",
                    background: "#f4f4f5",
                    borderRadius: "4px",
                    borderLeft: "2px solid #2563eb",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.6rem",
                      fontWeight: 500,
                      color: "#09090b",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#71717a",
                      marginTop: "2px",
                    }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY LIVENESS CLOUD (Features) ── */}
        <section
          id="features"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "6rem 5vw",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#2563eb",
                marginBottom: "1rem",
              }}
            >
              ◆ Why Liveness Cloud ◆
            </div>
            <h2
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem,4vw,2.75rem)",
                color: "#fafafa",
                marginBottom: "0.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              Why Liveness Cloud?
            </h2>
            <p
              style={{
                color: "#71717a",
                fontSize: "0.95rem",
                maxWidth: "44ch",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Industry-leading biometric security for modern applications.
            </p>
          </div>

          {/* Feature cards */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: "1000px",
              width: "100%",
            }}
          >
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

        {/* ── PRICING ── */}
        <section
          id="pricing"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "6rem 5vw",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem,4vw,2.75rem)",
                color: "#fafafa",
                marginBottom: "0.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              Simple, Transparent Pricing
            </h2>
            <p
              style={{
                color: "#71717a",
                fontSize: "0.95rem",
                lineHeight: 1.7,
              }}
            >
              Start free, scale when you're ready.
            </p>
          </div>

          {/* Pricing cards */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: "760px",
              width: "100%",
            }}
          >
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
            />
          </div>
        </section>

        {/* ── DEPLOY ── */}
        <section
          id="github"
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)",
            textAlign: "center",
            padding: "0 1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#2563eb",
              marginBottom: "1.5rem",
            }}
          >
            ◆ Open Source ◆
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem,10vw,7rem)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              marginBottom: "1.5rem",
              color: "#fafafa",
            }}
          >
            Ready to
            <br />
            <span style={{ color: "#2563eb" }}>Deploy?</span>
          </h2>

          <p
            style={{
              maxWidth: "38ch",
              color: "#71717a",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              marginBottom: "2.5rem",
              fontWeight: 200,
            }}
          >
            MIT-licensed. Drop-in integration for any web or mobile application.
            Stars appreciated — issues even more so.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a
              href="https://github.com/johnpaulpatigas/liveness"
              target="_blank"
              rel="noreferrer"
              className="btn-cta"
            >
              ★ Star on GitHub
            </a>
            <button className="btn-ghost">Read the Docs</button>
          </div>

          {/* Footer line */}
          <div
            style={{
              position: "absolute",
              bottom: "2rem",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: "#27272a",
              textTransform: "uppercase",
              display: "flex",
              gap: "2rem",
            }}
          >
            <span>© 2026 Liveness Cloud. All rights reserved.</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LivenessLanding;