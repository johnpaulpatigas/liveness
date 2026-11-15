import React from "react";
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
    reset,
  } = useLiveness({
    config: {
      basePath: "", // Assets hosted in public/
      challengeTimeout: 8000,
    },
    onSuccess: async (result) => {
      try {
        // Security Notice: For production, route verification through your own backend proxy
        // to prevent exposing your secret x-api-key in client-side code.
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
        {/* Header */}
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

        {/* Camera Viewport and Overlay */}
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

          {/* Oval Guide Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-56 rounded-[50%] border-2 border-dashed border-blue-400/60 shadow-[0_0_40px_rgba(59,130,246,0.2)]" />
          </div>

          {/* Loading Models State */}
          {status === "LOADING_MODELS" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-sm font-medium text-slate-300">
                Initializing security engine...
              </p>
            </div>
          )}

          {/* Error / Failure State */}
          {(status === "FAILURE" || status === "ERROR") && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-950/90 p-6 text-center">
              <h4 className="mb-1 text-base font-bold text-red-200">
                Check Failed
              </h4>
              <p className="mb-5 max-w-xs text-xs text-red-300">
                {error?.message || "Verification could not be completed."}
              </p>
              <button
                onClick={reset}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success State */}
          {status === "SUCCESS" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/90 p-6 text-center">
              <h4 className="mb-1 text-lg font-bold text-emerald-200">
                Verification Complete
              </h4>
              <p className="text-xs text-emerald-300">
                Biometric features successfully extracted.
              </p>
            </div>
          )}
        </div>

        {/* Live Challenge Banner & Progress */}
        {status === "DETECTING" && (
          <div className="border-t border-slate-800 bg-slate-900 p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                Action Required
              </span>
              <span className="text-xs font-bold text-slate-400">
                {progress}%
              </span>
            </div>

            <p className="mb-4 flex min-h-[2.5rem] items-center text-sm font-semibold text-white">
              {currentChallenge?.instruction ||
                "Position your face in the frame"}
            </p>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {status === "READY" && (
          <div className="flex justify-end border-t border-slate-800 bg-slate-900 p-6">
            <button
              onClick={start}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 active:scale-[0.98]"
            >
              Start Liveness Check
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
