import {
  AlertTriangle,
  ArrowRight,
  Book,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Copy,
  Cpu,
  FileCode,
  Key,
  Layers,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-http.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-typescript.js";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../services/api";

const SidebarItem = ({ id, label, activeId, onClick, icon: Icon }) => (
  <li>
    <button
      onClick={() => onClick(id)}
      className={`group flex w-full cursor-pointer items-center rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition-all duration-150 sm:text-sm ${
        activeId === id
          ? "bg-blue-50/80 font-extrabold text-blue-600"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
      }`}
    >
      {Icon && (
        <Icon
          className={`mr-3 h-4.5 w-4.5 shrink-0 ${
            activeId === id
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
      )}
      <span>{label}</span>
    </button>
  </li>
);

const LANG_MAP = {
  html: "markup",
  xml: "markup",
  js: "javascript",
  ts: "typescript",
  shell: "bash",
  sh: "bash",
};

const CodeBlock = ({ code, language = "javascript", title }) => {
  const [copied, setCopied] = useState(false);

  const cleanCode = (code || "").trim();
  const prismLang =
    LANG_MAP[language?.toLowerCase()] ||
    language?.toLowerCase() ||
    "javascript";
  const grammar = Prism.languages[prismLang] || Prism.languages.javascript;
  const highlighted = Prism.highlight(cleanCode, grammar, prismLang);

  const lines = cleanCode.split("\n");
  const showLineNumbers = lines.length > 2 && language !== "bash";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard write errors
    }
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0c1222] shadow-md shadow-black/20">
      {/* Codeblock Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0f172a]/95 px-4 py-2.5 backdrop-blur-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-xs font-semibold text-slate-300">
            {title || language}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
          <span className="shrink-0 rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {language}
          </span>
        </div>
      </div>

      {/* Code Container with Line Numbers */}
      <div className="flex overflow-hidden">
        {showLineNumbers && (
          <div
            className="select-none py-4 pl-4 pr-3 text-right font-mono text-xs text-slate-600 border-r border-slate-800/60 shrink-0"
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <div key={i + 1} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <pre className="code-scroll flex-1 overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
          <code
            className="prism-code block"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
};

const IntroContent = () => (
  <div>
    <div className="mb-6 inline-flex items-center rounded-md border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700">
      <Book className="mr-2 h-3.5 w-3.5" /> Documentation v1.0.0
    </div>
    <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
      Liveness SDK and cloud platform
    </h1>
    <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-xl">
      Client-side active liveness verification and backend biometric identity matching.
    </p>

    <div className="mb-10 grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-3 flex items-center text-lg font-bold sm:text-xl text-slate-900">
          <Terminal className="mr-2 h-5 w-5 text-blue-600" /> Client-side engine
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Runs landmark tracking and vector extraction directly in the browser via WebAssembly and WebGL. Camera frames stay on the user device.
        </p>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center">
            <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-emerald-500" />
            MediaPipe Face Mesh running in WebAssembly
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-emerald-500" />
            ResNet-34 neural model generating 128-d vectors
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-emerald-500" />
            Pure browser execution with zero raw video uploads
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-3 flex items-center text-lg font-bold sm:text-xl text-slate-900">
          <Cloud className="mr-2 h-5 w-5 text-blue-600" /> Cloud verification API
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Manages ephemeral sessions, stores identity profiles, matches biometric vectors, and records verification audit events.
        </p>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center">
            <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-emerald-500" />
            Single-use session tokens with random challenge sequences
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-emerald-500" />
            Cosine similarity and Euclidean distance matching
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-emerald-500" />
            Audit trail with timestamps and integrity checksums
          </li>
        </ul>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-8">
      <h3 className="mb-4 text-base font-bold text-slate-900 sm:text-lg">
        Verification workflow
      </h3>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/70 bg-white p-4">
          <span className="text-xs font-black text-blue-600">01</span>
          <h4 className="mt-1 text-sm font-bold text-slate-900">Session init</h4>
          <p className="mt-1 text-xs text-slate-500">
            Backend requests an ephemeral token and random challenge order from the Cloud API.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-4">
          <span className="text-xs font-black text-blue-600">02</span>
          <h4 className="mt-1 text-sm font-bold text-slate-900">Active checks</h4>
          <p className="mt-1 text-xs text-slate-500">
            SDK guides the user through blinks and head turns in front of their webcam.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-4">
          <span className="text-xs font-black text-blue-600">03</span>
          <h4 className="mt-1 text-sm font-bold text-slate-900">Feature vector</h4>
          <p className="mt-1 text-xs text-slate-500">
            ResNet-34 extracts a 128-d numerical descriptor directly in WebAssembly.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-4">
          <span className="text-xs font-black text-blue-600">04</span>
          <h4 className="mt-1 text-sm font-bold text-slate-900">Verification</h4>
          <p className="mt-1 text-xs text-slate-500">
            Backend submits descriptor and session token to compare against stored records.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const SDKUsageContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
      Frontend integration
    </h2>
    <p className="mb-8 text-base text-slate-600 sm:text-lg">
      Install the package, configure static model assets, bind event listeners, and manage camera hardware.
    </p>

    <div className="space-y-10 sm:space-y-12">
      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          1. Package installation
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          Install the SDK package in your frontend application:
        </p>
        <CodeBlock language="bash" code="npm install @liveness/sdk" />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          2. Model assets and hosting
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          The SDK loads two sets of binary files into the browser: MediaPipe Face Mesh in <code>face_mesh/</code> and the ResNet-34 neural model in <code>face_recognition/</code>. Run the asset script to copy them to your public directory:
        </p>
        <CodeBlock
          language="bash"
          code="node .agents/plugins/liveness-sdk-plugin/skills/liveness-sdk-integration/scripts/copy-liveness-assets.js ./public"
        />
        <p className="mt-3 text-xs text-slate-500">
          Make sure your web server or CDN serves <code>.wasm</code> files with MIME type <code>application/wasm</code> and <code>.binarypb</code> files as <code>application/octet-stream</code>.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          3. Video and canvas setup
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          The SDK requires a <code>&lt;video&gt;</code> element for the camera feed and an overlay <code>&lt;canvas&gt;</code> for landmark guides. For mobile browsers, especially iOS Safari, set <code>playsinline</code>, <code>autoplay</code>, and <code>muted</code> attributes:
        </p>
        <CodeBlock
          language="html"
          title="Camera DOM elements"
          code={`<div style="position: relative; width: 640px; aspect-ratio: 4/3; overflow: hidden; border-radius: 12px; background: #000;">
  <!-- Mirrored video feed for natural user preview -->
  <video
    id="liveness-video"
    playsinline
    autoplay
    muted
    style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
  ></video>

  <!-- Overlay canvas for face landmarks and alignment guides -->
  <canvas
    id="liveness-canvas"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
  ></canvas>
</div>`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          4. Initializing the SDK and event flow
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          Create an instance with configuration options, register event listeners, and start the stream:
        </p>
        <CodeBlock
          language="javascript"
          title="SDK initialization and event handlers"
          code={`import { LivenessSDK } from "@liveness/sdk";

const sdk = new LivenessSDK({
  basePath: "",              // Path prefix to /face_mesh and /face_recognition
  challengeTimeout: 10000,   // Max time in ms per challenge
  headTurnThreshold: 0.4,    // Sensitivity for head rotation
  minBrightness: -0.8,       // Minimum tensor brightness (-1.0 to 1.0)
  maxBrightness: 0.9,        // Maximum tensor brightness (-1.0 to 1.0)
});

// 1. Models loaded into WebAssembly runtime
sdk.on("ready", () => {
  console.log("AI models initialized and ready");
});

// 2. Active prompt update
sdk.on("challenge", ({ type, instruction, distance }) => {
  // type: "WAITING" | "BLINK" | "TURN_LEFT" | "TURN_RIGHT"
  // distance: "CLOSER" | "FURTHER" | null
  console.log(type, instruction, distance);
});

// 3. Challenge progress (0 to 1)
sdk.on("progress", ({ progress }) => {
  console.log(\`Progress: \${Math.round(progress * 100)}%\`);
});

// 4. Session succeeded with 128-d biometric descriptor
sdk.on("success", async (result) => {
  // result: { descriptor, sessionToken, timestamp, challenges, integrity }
  console.log("Verification succeeded:", result.descriptor);
  sdk.stop(videoElement);
});

// 5. Challenge failed or timed out
sdk.on("failure", (error) => {
  console.error("Verification failed:", error.code, error.message);
});

// 6. Camera or hardware error
sdk.on("error", (error) => {
  console.error("Hardware error:", error.code, error.message);
});

// Load neural network files and start detection
await sdk.load();
await sdk.start(videoElement, canvasElement);`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          5. Production React hook implementation
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          This is the production React hook from our <code>react-use-liveness-hook.tsx</code> example, managing state, lifecycle, and teardown:
        </p>
        <CodeBlock
          language="typescript"
          title="react-use-liveness-hook.tsx"
          code={`import { useState, useEffect, useRef, useCallback } from "react";
import {
  LivenessSDK,
  type LivenessConfig,
  type LivenessResult,
  type LivenessError,
} from "@liveness/sdk";

export type LivenessStatus =
  | "IDLE"
  | "LOADING_MODELS"
  | "READY"
  | "DETECTING"
  | "SUCCESS"
  | "FAILURE"
  | "ERROR";

export interface ChallengeInfo {
  type: string;
  instruction: string;
  distance?: "CLOSER" | "FURTHER" | null;
}

export interface UseLivenessOptions {
  config?: Partial<LivenessConfig>;
  onSuccess?: (result: LivenessResult) => void;
  onFailure?: (error: LivenessError) => void;
}

export function useLiveness({
  config,
  onSuccess,
  onFailure,
}: UseLivenessOptions = {}) {
  const [status, setStatus] = useState<LivenessStatus>("IDLE");
  const [currentChallenge, setCurrentChallenge] =
    useState<ChallengeInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<LivenessResult | null>(null);
  const [error, setError] = useState<LivenessError | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sdkRef = useRef<LivenessSDK | null>(null);

  // Initialize and preload models
  useEffect(() => {
    setStatus("LOADING_MODELS");
    const sdk = new LivenessSDK(config);
    sdkRef.current = sdk;

    sdk.on("ready", () => {
      setStatus("READY");
    });

    sdk.on("challenge", (info: ChallengeInfo) => {
      setCurrentChallenge(info);
    });

    sdk.on("progress", ({ progress }: { progress: number }) => {
      setProgress(Math.round(progress * 100));
    });

    sdk.on("success", (res: LivenessResult) => {
      setResult(res);
      setStatus("SUCCESS");
      onSuccess?.(res);
    });

    sdk.on("failure", (err: LivenessError) => {
      setError(err);
      setStatus("FAILURE");
      onFailure?.(err);
    });

    sdk.on("error", (err: LivenessError) => {
      setError(err);
      setStatus("ERROR");
      onFailure?.(err);
    });

    sdk.load().catch((err) => {
      setError({
        code: "LOAD_FAILED",
        message: err.message || "Failed to load models",
      });
      setStatus("ERROR");
    });

    return () => {
      if (videoRef.current) {
        sdk.stop(videoRef.current);
      }
    };
  }, []);

  const start = useCallback(async () => {
    if (!sdkRef.current || !videoRef.current || !canvasRef.current) {
      console.warn("LivenessSDK or DOM elements not ready.");
      return;
    }
    setError(null);
    setResult(null);
    setProgress(0);
    setStatus("DETECTING");

    try {
      await sdkRef.current.start(videoRef.current, canvasRef.current, config);
    } catch (err: any) {
      setError({
        code: "START_FAILED",
        message: err.message || "Failed to start camera",
      });
      setStatus("ERROR");
    }
  }, [config]);

  const stop = useCallback(() => {
    if (sdkRef.current && videoRef.current) {
      sdkRef.current.stop(videoRef.current);
      setStatus("IDLE");
      setCurrentChallenge(null);
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setError(null);
    setResult(null);
    setProgress(0);
    setStatus("READY");
  }, [stop]);

  return {
    videoRef,
    canvasRef,
    status,
    currentChallenge,
    progress,
    result,
    error,
    start,
    stop,
    reset,
  };
}`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          6. Production React verification modal
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          This is the verification modal component from our <code>react-liveness-modal.tsx</code> example:
        </p>
        <CodeBlock
          language="tsx"
          title="react-liveness-modal.tsx"
          code={`import React from "react";
import { useLiveness } from "./react-use-liveness-hook";
import type { LivenessResult } from "@liveness/sdk";

interface LivenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (result: LivenessResult) => void;
  apiEndpoint?: string;
  apiKey?: string;
}

export function LivenessModal({
  isOpen,
  onClose,
  onVerified,
  apiEndpoint = "/api/liveness/verify",
  apiKey,
}: LivenessModalProps) {
  const {
    videoRef,
    canvasRef,
    status,
    currentChallenge,
    progress,
    error,
    start,
    stop,
  } = useLiveness({
    config: {
      basePath: "",
      challengeTimeout: 8000,
    },
    onSuccess: async (result) => {
      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-api-key": apiKey } : {}),
          },
          body: JSON.stringify(result),
        });

        const data = await response.json();
        if (response.ok) {
          onVerified(result);
        } else {
          console.error("Backend verification failed:", data);
        }
      } catch (err) {
        console.error("Network error during verification:", err);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
            <h3 className="text-base font-bold tracking-tight">
              Identity Verification
            </h3>
          </div>
          <button
            onClick={() => {
              stop();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-56 rounded-[50%] border-2 border-dashed border-blue-400/60 shadow-[0_0_40px_rgba(59,130,246,0.2)]" />
          </div>
        </div>

        <div className="p-6">
          <p className="text-center font-medium text-slate-200">
            {currentChallenge?.instruction || "Position your face in the frame"}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={start}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          7. Releasing camera hardware
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          In <code>LivenessSDK.js</code>, calling <code>sdk.stop(videoElement)</code> halts the detection loop and stops all media stream tracks on <code>videoElement.srcObject</code>:
        </p>
        <CodeBlock
          language="javascript"
          title="Camera hardware release"
          code={`// Stops the detection loop and stops each track on videoElement.srcObject
sdk.stop(videoElement);`}
        />
      </div>
    </div>
  </div>
);

const CloudUsageContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
      Backend and cloud verification
    </h2>
    <p className="mb-8 text-base text-slate-600 sm:text-lg">
      Verify biometric descriptors, initialize replay-protected sessions, manage API keys, and evaluate identity matches.
    </p>

    <div className="space-y-10 sm:space-y-12">
      <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-5 sm:p-7">
        <h3 className="mb-2 flex items-center text-lg font-bold text-slate-900">
          <Key className="mr-2 h-5 w-5 text-blue-600" /> API key security
        </h3>
        <p className="text-sm leading-relaxed text-slate-700">
          Keep your secret API key (<code>x-api-key</code>) on your server backend. Do not include secret keys in frontend code or public client bundles. Your backend creates ephemeral sessions and passes session tokens to the browser.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">
          Cloud API endpoints
        </h3>
        <p className="mb-6 text-sm text-slate-600">
          The production API is hosted at <code className="font-semibold text-blue-600">https://api.liveness.cloud</code>. The web dashboard runs at <code className="font-semibold text-slate-800">https://liveness.cloud</code>. All backend requests require your <code className="font-mono text-xs font-bold text-slate-800">x-api-key</code> header.
        </p>

        <div className="space-y-6">
          {/* Session Endpoint */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:rounded-2xl sm:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">
                POST
              </span>
              <code className="text-xs font-bold text-slate-900 sm:text-sm md:text-base break-all">
                https://api.liveness.cloud/api/liveness/session
              </code>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Initializes a single-use session. Returns a session token and an authoritative challenge sequence to prevent replay attacks.
            </p>
            <CodeBlock
              language="json"
              title="Response"
              code={`{
  "sessionToken": "live_sess_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  "challenges": ["WAITING", "BLINK", "TURN_LEFT", "WAITING"],
  "expiresAt": 1716336300000
}`}
            />
          </div>

          {/* Enroll Endpoint */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:rounded-2xl sm:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                POST
              </span>
              <code className="text-xs font-bold text-slate-900 sm:text-sm md:text-base break-all">
                https://api.liveness.cloud/api/liveness/enroll
              </code>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Registers a new user with their 128-dimensional biometric descriptor.
            </p>
            <CodeBlock
              language="json"
              title="Request body"
              code={`{
  "name": "Jane Doe",
  "descriptor": [0.0123, -0.0456, 0.0789, ...], // 128-d vector
  "sessionToken": "live_sess_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  "timestamp": 1716336000000,
  "challenges": ["WAITING", "BLINK", "TURN_LEFT", "WAITING"],
  "integrity": "9b3c4f2e1a5d8b7c..."
}`}
            />
          </div>

          {/* Verify Endpoint (1:N) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:rounded-2xl sm:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">
                POST
              </span>
              <code className="text-xs font-bold text-slate-900 sm:text-sm md:text-base break-all">
                https://api.liveness.cloud/api/liveness/verify
              </code>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Compares a fresh liveness result against all enrolled identities in your workspace. Returns a match when cosine similarity is at least 0.95 and Euclidean distance is within 0.30.
            </p>
            <CodeBlock
              language="json"
              title="Response"
              code={`{
  "verified": true,
  "status": "SUCCESS",
  "match": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "similarity": 0.984,
    "distance": 0.178
  },
  "metric": "cosine"
}`}
            />
          </div>

          {/* Verify-One Endpoint (1:1) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:rounded-2xl sm:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded bg-indigo-100 px-2.5 py-1 text-xs font-black text-indigo-700">
                POST
              </span>
              <code className="text-xs font-bold text-slate-900 sm:text-sm md:text-base break-all">
                https://api.liveness.cloud/api/liveness/verify-one
              </code>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Runs a direct 1:1 comparison against a specific identity UUID (<code>targetId</code>).
            </p>
            <CodeBlock
              language="json"
              title="Request body"
              code={`{
  "targetId": "550e8400-e29b-41d4-a716-446655440000",
  "descriptor": [0.0123, -0.0456, 0.0789, ...],
  "sessionToken": "live_sess_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  "timestamp": 1716336000000,
  "challenges": ["WAITING", "BLINK", "TURN_LEFT", "WAITING"],
  "integrity": "9b3c4f2e1a5d8b7c...",
  "threshold": 0.95
}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          Payload integrity validation
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          This is the integrity verification logic from our <code>apps/saas-api/src/middleware/validateIntegrity.js</code>:
        </p>
        <CodeBlock
          language="javascript"
          title="validateIntegrity.js"
          code={`import crypto from "crypto";

function generateSha256Hash(descriptor, sessionToken, timestamp) {
  const data = JSON.stringify(descriptor) + sessionToken + timestamp;
  return crypto.createHash("sha256").update(data).digest("hex");
}

function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          Next.js App Router verification route
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          From our <code>nextjs-api-route.ts</code> example, forwarding verification requests to Liveness Cloud:
        </p>
        <CodeBlock
          language="typescript"
          title="nextjs-api-route.ts"
          code={`import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      descriptor,
      targetId,
      sessionToken,
      integrity,
      threshold = 0.95,
    } = body;

    if (
      !descriptor ||
      !Array.isArray(descriptor) ||
      descriptor.length !== 128
    ) {
      return NextResponse.json(
        { error: "A valid 128-dimensional descriptor array is required." },
        { status: 400 },
      );
    }

    // Forward to Liveness Cloud API
    const livenessCloudUrl =
      process.env.LIVENESS_API_URL || "https://api.liveness.cloud/api/liveness";
    const apiKey = process.env.LIVENESS_API_KEY;

    if (apiKey) {
      const endpoint = targetId
        ? \`\${livenessCloudUrl}/verify-one\`
        : \`\${livenessCloudUrl}/verify\`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          descriptor,
          targetId,
          sessionToken,
          integrity,
          threshold,
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({
      verified: true,
      message: "Local verification completed.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal verification error." },
      { status: 500 },
    );
  }
}`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          Self-hosted Express verification server
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          From our <code>backend-verification-node.js</code> example, using mathematical utilities from <code>@liveness/engine/utils</code>:
        </p>
        <CodeBlock
          language="javascript"
          title="backend-verification-node.js"
          code={`import express from "express";
import crypto from "crypto";
import {
  calculateCosineSimilarity,
  calculateEuclideanDistance,
} from "@liveness/engine/utils";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const enrolledIdentities = new Map();

// 1. ENROLL USER
app.post("/api/liveness/enroll", (req, res) => {
  const { name, descriptor, sessionToken, integrity } = req.body;

  if (
    !name ||
    !descriptor ||
    !Array.isArray(descriptor) ||
    descriptor.length !== 128
  ) {
    return res
      .status(400)
      .json({ error: "Invalid payload. 128-d descriptor and name required." });
  }

  const id = crypto.randomUUID();
  enrolledIdentities.set(id, { id, name, descriptor, createdAt: new Date() });

  console.log(\`[Enrollment] Enrolled user: \${name} (ID: \${id})\`);
  return res.status(201).json({ id, name, success: true });
});

// 2. VERIFY USER (1:N or 1:1)
app.post("/api/liveness/verify", (req, res) => {
  const { descriptor, targetId, threshold = 0.95 } = req.body;

  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ error: "128-d descriptor vector required." });
  }

  // 1:1 Verification against specific target
  if (targetId) {
    const target = enrolledIdentities.get(targetId);
    if (!target) {
      return res
        .status(404)
        .json({ verified: false, error: "Target identity not found." });
    }
    const similarity = calculateCosineSimilarity(target.descriptor, descriptor);
    const distance = calculateEuclideanDistance(target.descriptor, descriptor);
    const verified = similarity >= threshold && distance <= 0.3;
    return res.json({
      verified,
      similarity: Number(similarity.toFixed(4)),
      distance: Number(distance.toFixed(4)),
      match: verified ? { id: target.id, name: target.name } : null,
    });
  }

  // 1:N Verification against all enrolled identities
  let bestMatch = null;
  let maxSimilarity = -1;
  let matchDistance = Infinity;

  for (const [id, user] of enrolledIdentities.entries()) {
    const sim = calculateCosineSimilarity(user.descriptor, descriptor);
    const dist = calculateEuclideanDistance(user.descriptor, descriptor);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      matchDistance = dist;
      bestMatch = user;
    }
  }

  const verified =
    maxSimilarity >= threshold && matchDistance <= 0.3 && bestMatch !== null;

  return res.json({
    verified,
    similarity: maxSimilarity > -1 ? Number(maxSimilarity.toFixed(4)) : 0,
    distance: matchDistance < Infinity ? Number(matchDistance.toFixed(4)) : 0,
    match: verified ? { id: bestMatch.id, name: bestMatch.name } : null,
  });
});

app.listen(PORT, () => {
  console.log(\`Liveness verification server running on http://localhost:\${PORT}\`);
});`}
        />
      </div>
    </div>
  </div>
);

const AISkillsContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
      AI assistant skills and rules
    </h2>
    <p className="mb-8 text-base text-slate-600 sm:text-lg">
      Equip AI assistants such as Antigravity, Cursor, Windsurf, Claude Code, and Copilot with verified SDK rules, runbooks, and implementation templates.
    </p>

    <div className="space-y-10 sm:space-y-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-3 flex items-center text-lg font-bold sm:text-xl text-slate-900">
          <Bot className="mr-2 h-5 w-5 text-blue-600" /> How assistant skills work
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          The repository includes a skill plugin in <code>plugins/liveness-sdk-plugin/</code>. When installed in your workspace, coding assistants recognize SDK API signatures, enforce biometric privacy requirements, copy model assets, and generate working integration code without guessing.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          Automated installation script
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          Run the setup script from the root of your project to copy rule files and skill definitions for one or all assistants:
        </p>
        <CodeBlock
          language="bash"
          title="Setup script commands"
          code={`# Configure all supported assistants at once
node scripts/setup-agent-skills.js --agent=all

# Or target specific editors
node scripts/setup-agent-skills.js --agent=antigravity,cursor,claude

# Target Windsurf or Copilot
node scripts/setup-agent-skills.js --agent=windsurf,copilot`}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
          Supported assistants and configuration files
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Antigravity IDE & CLI</h4>
              <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                .agents/plugins
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Loads the <code>liveness-sdk-integration</code> skill, runbooks, and reference files directly into the assistant context.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Cursor</h4>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                .cursor/rules & .cursorrules
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Applies rules to Cursor Chat and Composer, ensuring video attributes and unmount cleanup are included in code output.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Claude Code</h4>
              <span className="rounded bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700">
                CLAUDE.md
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Configures Claude Code CLI sessions with project rules, asset locations, and similarity thresholds.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Windsurf</h4>
              <span className="rounded bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700">
                .windsurfrules
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Instructs Windsurf Cascade to follow client-side vector extraction constraints and privacy rules.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">GitHub Copilot</h4>
              <span className="rounded bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                .github/copilot-instructions.md
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Supplies repository context and SDK API signatures for Copilot Chat and code completion prompts.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          Architectural rules enforced by the skills
        </h3>
        <p className="mb-4 text-sm text-slate-600">
          The skill files instruct AI assistants to follow four architectural requirements:
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
            <span className="font-bold text-slate-900">Client-side privacy:</span>
            <span className="text-slate-600"> AI assistants are instructed never to write backend code that receives raw video feeds or photos. Only 128-d numerical vectors and checksums may be transmitted.</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
            <span className="font-bold text-slate-900">Video element attributes:</span>
            <span className="text-slate-600"> All generated video components must include <code>autoPlay</code>, <code>playsInline</code>, and <code>muted</code> for mobile compatibility.</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
            <span className="font-bold text-slate-900">Hardware cleanup:</span>
            <span className="text-slate-600"> When a component unmounts, code must invoke <code>sdk.stop(videoElement)</code> to stop detection and stop every media track on the video element.</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
            <span className="font-bold text-slate-900">Verification thresholds:</span>
            <span className="text-slate-600"> Matching routines must evaluate Cosine Similarity (threshold &gt;= 0.95) and Euclidean Distance (threshold &lt;= 0.30).</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">
          Example prompts for your AI assistant
        </h3>
        <p className="mb-3 text-sm text-slate-600">
          Once the skill is active, you can use prompts like these to generate integration code:
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Prompt 1: React verification modal</div>
            <p className="mt-1 font-mono text-xs text-slate-800">
              "Add a liveness verification modal to our React registration flow using @liveness/sdk and Tailwind CSS. Ensure camera tracks are stopped when the modal closes."
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Prompt 2: Next.js verification route</div>
            <p className="mt-1 font-mono text-xs text-slate-800">
              "Create a Next.js App Router API route to verify the biometric descriptor with Liveness Cloud. Check the SHA-256 integrity hash before forwarding the request."
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Prompt 3: Model asset deployment</div>
            <p className="mt-1 font-mono text-xs text-slate-800">
              "Write a script to copy the MediaPipe and ResNet-34 model files to our Vite public directory and configure basePath in the SDK."
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Prompt 4: Mobile Safari debugging</div>
            <p className="mt-1 font-mono text-xs text-slate-800">
              "Diagnose why the webcam feed freezes on iOS Safari in our verification view and fix the video element attributes."
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MethodologyContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
      Detection methodology
    </h2>
    <p className="mb-8 text-base text-slate-600 sm:text-lg">
      How the SDK checks live physical presence using 3D facial landmarks, eye aspect ratios, and neural feature vectors.
    </p>

    <div className="space-y-8 sm:space-y-10">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
          Active challenge state machine
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          The verification sequence moves through randomized prompts to confirm responsive human movement:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5">
            <h4 className="mb-1 text-sm font-bold text-slate-900">WAITING</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Frames the user face within the oval guide, checks distance from the camera, and measures lighting across the face region.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <h4 className="mb-1 text-sm font-bold text-slate-900">BLINK</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Requires an intentional eye closure within the timeout window. Uses the Eye Aspect Ratio to detect eye closing and opening.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <h4 className="mb-1 text-sm font-bold text-slate-900">TURN_LEFT</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Monitors 3D yaw angle as the user turns their head toward the left shoulder.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <h4 className="mb-1 text-sm font-bold text-slate-900">TURN_RIGHT</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Monitors 3D yaw angle as the user turns their head toward the right shoulder.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          Eye Aspect Ratio (EAR)
        </h3>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          From <code>packages/engine/src/utils.js</code>: Eye tracking measures six 3D landmark coordinates for each eye. When the ratio of vertical eyelid distance to horizontal eye width drops below 0.25 after starting above 0.30, an intentional blink is recorded:
        </p>
        <CodeBlock
          language="javascript"
          title="utils.js - calculateEAR"
          code={`const EYE_INDICES = {
  left: [362, 385, 387, 263, 373, 380],
  right: [33, 160, 158, 133, 153, 144],
};

export function calculateEAR(landmarks, side) {
  const indices = EYE_INDICES[side];
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const verticalDist1 = euclideanDistance(p2, p6);
  const verticalDist2 = euclideanDistance(p3, p5);
  const horizontalDist = euclideanDistance(p1, p4);

  if (horizontalDist === 0) return 0;

  const ear = (verticalDist1 + verticalDist2) / (2.0 * horizontalDist);
  return ear;
}`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          3D head pose estimation
        </h3>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          From <code>packages/engine/src/utils.js</code>: Measures relative cheek depth differences compared against face width to estimate physical head yaw in three dimensions:
        </p>
        <CodeBlock
          language="javascript"
          title="utils.js - calculateHeadTurnV2"
          code={`const HEAD_POSE_INDICES = {
  leftCheek: 234,
  rightCheek: 454,
  chin: 152,
};

export function calculateHeadTurnV2(landmarks) {
  const leftCheek = landmarks[HEAD_POSE_INDICES.leftCheek];
  const rightCheek = landmarks[HEAD_POSE_INDICES.rightCheek];
  const chin = landmarks[HEAD_POSE_INDICES.chin];

  const leftDepth = leftCheek.z - chin.z;
  const rightDepth = rightCheek.z - chin.z;

  const faceWidth = euclideanDistance(leftCheek, rightCheek);
  if (faceWidth < 0.1) return 0;

  const turnRatio = (rightDepth - leftDepth) / faceWidth;
  return turnRatio;
}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h3 className="mb-2 text-lg font-bold text-slate-900">
            Luminance analysis
          </h3>
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            From <code>packages/engine/src/utils.js</code>: Computes mean brightness directly across the tensor:
          </p>
          <CodeBlock
            language="javascript"
            title="utils.js - calculateBrightness"
            code={`export function calculateBrightness(imageTensor) {
  return tf.tidy(() => {
    const mean = imageTensor.mean();
    return mean.dataSync()[0];
  });
}`}
          />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h3 className="mb-2 text-lg font-bold text-slate-900">
            Vector similarity math
          </h3>
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            From <code>packages/engine/src/utils.js</code>: Mathematical comparison between two 128-dimensional vectors:
          </p>
          <CodeBlock
            language="javascript"
            title="utils.js - calculateCosineSimilarity"
            code={`export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}`}
          />
        </div>
      </div>
    </div>
  </div>
);

const TroubleshootingContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
      Troubleshooting and production
    </h2>
    <p className="mb-8 text-base text-slate-600 sm:text-lg">
      Diagnose camera permissions, mobile Safari quirks, Content Security Policies, and ambient lighting edge cases.
    </p>

    <div className="space-y-8 sm:space-y-10">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          1. Camera permissions and secure contexts
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          The browser media API (<code>navigator.mediaDevices.getUserMedia</code>) requires a secure context (HTTPS) or <code>http://localhost</code>. When accessed over plain HTTP, the browser blocks camera access.
        </p>
        <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          <span className="font-bold text-slate-800">Resolution:</span> If the SDK emits <code>CAMERA_ACCESS_DENIED</code>, explain to the user how to grant camera permissions in their browser address bar or system settings.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          2. Mobile Safari playback
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          iOS Safari blocks video playback unless the video element has <code>playsinline</code>, <code>autoplay</code>, and <code>muted</code> attributes. In strict mobile environments, trigger <code>sdk.start()</code> from a direct user gesture (such as tapping a button).
        </p>
        <CodeBlock
          language="jsx"
          title="Video element attributes"
          code={`<video ref={videoRef} playsInline autoPlay muted />`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          3. Content Security Policy (CSP)
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Because the SDK executes WebAssembly and WebGL shaders on web worker threads, configure your CSP headers to allow them:
        </p>
        <CodeBlock
          language="http"
          title="Recommended Content-Security-Policy"
          code={`Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  connect-src 'self' https://api.liveness.cloud https://cdn.example.com;
  img-src 'self' data: blob:;`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          4. Ambient lighting tuning (POOR_LIGHTING)
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          The SDK computes normalized mean tensor brightness across the face region (from -1.0 to 1.0). If users operate in dim environments or backlit offices, widen the thresholds during initialization:
        </p>
        <CodeBlock
          language="javascript"
          title="LivenessSDK brightness configuration"
          code={`const sdk = new LivenessSDK({
  minBrightness: -0.9,  // Lower threshold for darker settings
  maxBrightness: 0.95,  // Upper threshold for bright settings
});`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          5. Occlusion handling (OCCLUSION_DETECTED)
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          This error triggers when glasses frames, medical masks, or hats cover facial landmarks. Prompt the user to remove face coverings and position their face directly in front of the camera.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <h3 className="mb-2 text-lg font-bold text-slate-900">
          6. Canvas overlay alignment
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          In <code>LivenessSDK.js</code>, canvas pixel dimensions are synchronized directly to the camera stream resolution:
        </p>
        <CodeBlock
          language="javascript"
          title="LivenessSDK.js - canvas sizing"
          code={`canvasElement.width = videoElement.videoWidth;
canvasElement.height = videoElement.videoHeight;`}
        />
      </div>
    </div>
  </div>
);

const APIRefContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
      API reference
    </h2>
    <p className="mb-8 text-base text-slate-600 sm:text-lg">
      Configuration options, event payloads, result objects, and error codes.
    </p>

    <div className="space-y-10 sm:space-y-12">
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
          LivenessSDK configuration options
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full min-w-125 text-left text-sm">
            <thead className="bg-slate-50 font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Option</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Default</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  name: "basePath",
                  def: '""',
                  desc: "URL path prefix pointing to /face_mesh and /face_recognition folders.",
                },
                {
                  name: "challengeTimeout",
                  def: "5000",
                  desc: "Maximum duration in milliseconds allowed for each challenge.",
                },
                {
                  name: "headTurnThreshold",
                  def: "0.4",
                  desc: "Yaw threshold ratio required to validate left or right head turns.",
                },
                {
                  name: "minBrightness",
                  def: "-0.8",
                  desc: "Minimum normalized tensor brightness on a scale of -1.0 to 1.0.",
                },
                {
                  name: "maxBrightness",
                  def: "0.9",
                  desc: "Maximum normalized tensor brightness on a scale of -1.0 to 1.0.",
                },
                {
                  name: "targetFPS",
                  def: "30",
                  desc: "Target processing frame rate to balance accuracy and CPU usage.",
                },
                {
                  name: "challenges",
                  def: '["WAITING", ...]',
                  desc: "Array of challenge types to execute during the verification session.",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 sm:px-6 sm:py-4">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 sm:px-6 sm:py-4">
                    {row.def}
                  </td>
                  <td className="px-4 py-3 text-slate-600 sm:px-6 sm:py-4">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
          Event registry
        </h3>
        <div className="space-y-3">
          {[
            {
              event: "ready",
              payload: "void",
              desc: "Emitted when WebAssembly runtime and neural model weights finish loading.",
            },
            {
              event: "challenge",
              payload: "{ type: string, instruction: string, distance: string | null }",
              desc: "Emitted when a new action prompt starts (WAITING, BLINK, TURN_LEFT, TURN_RIGHT).",
            },
            {
              event: "progress",
              payload: "{ progress: number, rawValue?: number }",
              desc: "Emitted during challenge execution with percentage completed (0 to 1).",
            },
            {
              event: "success",
              payload: "LivenessResult",
              desc: "Emitted when all active challenges pass. Contains the 128-d descriptor.",
            },
            {
              event: "failure",
              payload: "{ code: string, message: string }",
              desc: "Emitted when a challenge times out, face is obscured, or camera fails.",
            },
            {
              event: "error",
              payload: "{ code: string, message: string }",
              desc: "Emitted on fatal runtime, WASM, or hardware initialization failure.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div>
                <span className="font-mono text-sm font-bold text-blue-600">
                  "{item.event}"
                </span>
                <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
              </div>
              <span className="w-fit rounded bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                Payload: {item.payload}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
          LivenessResult object schema
        </h3>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5">
          <CodeBlock
            language="typescript"
            title="LivenessResult interface"
            code={`interface LivenessResult {
  // 128-dimensional floating-point vector extracted by ResNet-34 FaceRecognitionNet
  descriptor: number[];

  // Ephemeral single-use session identifier
  sessionToken: string;

  // Millisecond timestamp when challenges concluded
  timestamp: number;

  // Challenge sequence executed during this session
  challenges: ("WAITING" | "BLINK" | "TURN_LEFT" | "TURN_RIGHT")[];

  // SHA-256 integrity hash: sha256(JSON.stringify(descriptor) + sessionToken + timestamp)
  integrity: string;
}`}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
          Error codes
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full min-w-125 text-left text-sm">
            <thead className="bg-slate-50 font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Code</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Cause</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  code: "CAMERA_ACCESS_DENIED",
                  cause: "User denied camera access or origin is not HTTPS/localhost.",
                  action: "Prompt user to allow camera access in browser site settings.",
                },
                {
                  code: "POOR_LIGHTING",
                  cause: "Face region is underexposed or overexposed.",
                  action: "Guide user to face a light source or adjust room illumination.",
                },
                {
                  code: "OCCLUSION_DETECTED",
                  cause: "Glasses, masks, or hands obscure facial landmarks.",
                  action: "Ask user to remove face coverings.",
                },
                {
                  code: "TIMEOUT",
                  cause: "User did not complete the challenge within the time limit.",
                  action: "Allow user to restart the verification sequence.",
                },
                {
                  code: "NO_FACE_DETECTED",
                  cause: "No face found within the camera frame.",
                  action: "Instruct user to center their face in the guide oval.",
                },
                {
                  code: "BROWSER_NOT_SUPPORTED",
                  cause: "Browser lacks WebAssembly or WebGL support.",
                  action: "Advise user to switch to an updated modern browser.",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono font-bold text-red-600 sm:px-6 sm:py-4">
                    {row.code}
                  </td>
                  <td className="px-4 py-3 text-slate-600 sm:px-6 sm:py-4">
                    {row.cause}
                  </td>
                  <td className="px-4 py-3 text-slate-600 sm:px-6 sm:py-4">
                    {row.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const Documentation = () => {
  const [activePage, setActivePage] = useState("introduction");
  const user = api.auth.getCurrentUser();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get("section") || hash;
    const validSections = [
      "introduction",
      "sdk-usage",
      "cloud-usage",
      "ai-skills",
      "methodology",
      "troubleshooting",
      "api-ref",
    ];
    if (section && validSections.includes(section)) {
      setActivePage(section);
    }
  }, [location]);

  const scrollToTop = () => {
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTopicChange = (id) => {
    setActivePage(id);
    scrollToTop();
  };

  const menu = [
    {
      title: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction", icon: Book },
        { id: "sdk-usage", label: "Frontend SDK", icon: Code2 },
        { id: "cloud-usage", label: "Backend & Cloud API", icon: Cloud },
        { id: "ai-skills", label: "AI Assistant Skills", icon: Bot },
      ],
    },
    {
      title: "Guides & Reference",
      items: [
        { id: "methodology", label: "Methodology", icon: Layers },
        { id: "troubleshooting", label: "Troubleshooting", icon: Wrench },
        { id: "api-ref", label: "API Reference", icon: FileCode },
      ],
    },
  ];

  const flatItems = menu.flatMap((g) => g.items);
  const currentIndex = flatItems.findIndex((i) => i.id === activePage);
  const prevItem = flatItems[currentIndex - 1];
  const nextItem = flatItems[currentIndex + 1];

  const renderContent = () => (
    <div key={activePage}>
      {(() => {
        switch (activePage) {
          case "introduction":
            return <IntroContent />;
          case "sdk-usage":
            return <SDKUsageContent />;
          case "cloud-usage":
            return <CloudUsageContent />;
          case "ai-skills":
            return <AISkillsContent />;
          case "methodology":
            return <MethodologyContent />;
          case "troubleshooting":
            return <TroubleshootingContent />;
          case "api-ref":
            return <APIRefContent />;
          default:
            return <IntroContent />;
        }
      })()}
    </div>
  );

  const renderSidebarContent = () => (
    <>
      {menu.map((group, idx) => (
        <div key={idx} className="mb-6 last:mb-0">
          <p className="mb-2.5 px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            {group.title}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                id={item.id}
                label={item.label}
                activeId={activePage}
                onClick={handleTopicChange}
                icon={item.icon}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  const currentItem =
    flatItems.find((i) => i.id === activePage) || flatItems[0];
  const CurrentIcon = currentItem.icon;

  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);

  const pageContent = (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Mobile Topic Selector */}
      <div className="relative mb-3 w-full lg:hidden">
        <button
          onClick={() => setTopicDropdownOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-3 px-4 shadow-xs transition-all hover:border-slate-300 active:scale-[0.99]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CurrentIcon className="h-4 w-4" />
            </div>
            <div className="flex min-w-0 flex-col text-left">
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Topic
              </span>
              <span className="truncate text-sm font-bold text-slate-900">
                {currentItem.label}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
              topicDropdownOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </button>

        {topicDropdownOpen && (
          <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 left-0 z-40 mt-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl duration-150">
            {menu.map((group, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <div className="mb-2 px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activePage === item.id;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleTopicChange(item.id);
                          setTopicDropdownOpen(false);
                        }}
                        className={`group flex w-full cursor-pointer items-center rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition-all duration-150 sm:text-sm ${
                          isActive
                            ? "bg-blue-50/80 font-extrabold text-blue-600"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                        }`}
                      >
                        {ItemIcon && (
                          <ItemIcon
                            className={`mr-3 h-4.5 w-4.5 shrink-0 ${
                              isActive
                                ? "text-blue-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sub-navigation Sidebar */}
      <aside className="sticky top-24 hidden h-fit w-64 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:block">
        {renderSidebarContent()}
      </aside>

      {/* Docs Main Content */}
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-8 md:p-10">
          {renderContent()}

          {/* Inline Pagination Controls */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:mt-12">
            {prevItem ? (
              <button
                onClick={() => handleTopicChange(prevItem.id)}
                className="group inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-blue-600 sm:text-sm"
              >
                <ArrowRight className="h-4 w-4 rotate-180 text-slate-400 transition-transform group-hover:-translate-x-1 group-hover:text-blue-600" />
                <span>{prevItem.label}</span>
              </button>
            ) : (
              <div />
            )}

            {nextItem ? (
              <button
                onClick={() => handleTopicChange(nextItem.id)}
                className="group ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 sm:text-sm"
              >
                <span>{nextItem.label}</span>
                <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
              </button>
            ) : null}
          </div>
        </div>

        <footer className="mt-8 text-center text-xs font-medium text-slate-600">
          &copy; {new Date().getFullYear()} Liveness Cloud Platform. All rights reserved.
        </footer>
      </div>
    </div>
  );

  return user ? (
    <DashboardLayout>{pageContent}</DashboardLayout>
  ) : (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-12">
        {pageContent}
      </main>
    </div>
  );
};

export default Documentation;
