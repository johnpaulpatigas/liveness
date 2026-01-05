// src/components/LivenessChecker.jsx
import { useEffect, useRef, useState } from "react";
import { calculateCosineSimilarity } from "../engine/utils";
import { LivenessSDK } from "../sdk/LivenessSDK";
import { ProgressBar } from "./ProgressBar";

const UI_STATE = {
  IDLE: "IDLE",
  LOADING_MODELS: "LOADING_MODELS",
  READY_TO_START: "READY_TO_START",
  CAMERA_ERROR: "CAMERA_ERROR",
  CHECKING: "CHECKING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
};

const MODE = {
  ENROLL: "ENROLL",
  VERIFY: "VERIFY",
};

export function LivenessChecker() {
  const [uiState, setUiState] = useState(UI_STATE.IDLE);
  const [mode, setMode] = useState(MODE.ENROLL);
  const [instruction, setInstruction] = useState("");
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const [enrolledName, setEnrolledName] = useState("");
  const [userName, setUserName] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sdkRef = useRef(null);
  const userNameRef = useRef(userName);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    const saved = localStorage.getItem("face_identity");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setStoredDescriptor(parsed);
        setEnrolledName("Unknown User");
      } else {
        setStoredDescriptor(parsed.descriptor);
        setEnrolledName(parsed.name);
      }
      setMode(MODE.VERIFY);
    }
  }, []);

  useEffect(() => {
    setUiState(UI_STATE.LOADING_MODELS);
    setInstruction("Loading models, please wait...");

    const sdk = new LivenessSDK({
      headTurnThreshold: 0.4,
      challengeTimeout: 10000,
    });

    sdk.on("ready", () => {
      setUiState(UI_STATE.READY_TO_START);
      setInstruction('Click "Start" to begin.');
    });

    sdk.on("challenge", ({ type, instruction }) => {
      setCurrentChallenge(type);
      setInstruction(instruction);
      setProgress(0);
    });

    sdk.on("progress", ({ progress }) => {
      setProgress(progress);
    });

    sdk.on("success", ({ descriptor }) => {
      setCurrentChallenge(null);

      if (mode === MODE.ENROLL) {
        const payload = { name: userNameRef.current || "User", descriptor };
        localStorage.setItem("face_identity", JSON.stringify(payload));
        setStoredDescriptor(descriptor);
        setEnrolledName(payload.name);
        setUiState(UI_STATE.SUCCESS);
        setInstruction("Identity Enrolled Successfully!");
      } else {
        const saved = localStorage.getItem("face_identity");
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedDescriptor = Array.isArray(parsed)
            ? parsed
            : parsed.descriptor;
          const savedName = Array.isArray(parsed) ? "User" : parsed.name;

          const score = calculateCosineSimilarity(descriptor, savedDescriptor);
          setMatchScore(score);
          setUiState(UI_STATE.SUCCESS);
          setInstruction(
            score > 0.8
              ? `Identity Verified! Welcome, ${savedName}.`
              : "Identity Mismatch!",
          );
        }
      }
    });

    sdk.on("failure", (error) => {
      setUiState(UI_STATE.FAILURE);
      setInstruction(`Error: ${error.message}`);
      setCurrentChallenge(null);
    });

    sdk.on("error", (err) => {
      setUiState(UI_STATE.FAILURE);
      setInstruction(`System Error: ${err.message}`);
    });

    sdk.load().catch(console.error);
    sdkRef.current = sdk;

    const currentVideo = videoRef.current;
    return () => sdkRef.current?.stop(currentVideo);
  }, [mode]);

  const handleStartClick = async () => {
    if (!videoRef.current || !canvasRef.current || !sdkRef.current) return;
    setProgress(0);
    setMatchScore(null);
    setCurrentChallenge(null);
    setUiState(UI_STATE.CHECKING);

    try {
      await sdkRef.current.start(videoRef.current, canvasRef.current);
    } catch {
      setUiState(UI_STATE.CAMERA_ERROR);
    }
  };

  const clearIdentity = () => {
    localStorage.removeItem("face_identity");
    setStoredDescriptor(null);
    setEnrolledName("");
    setUserName("");
    setMode(MODE.ENROLL);
    setUiState(UI_STATE.READY_TO_START);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-full max-w-sm">
        <button
          onClick={() => setMode(MODE.ENROLL)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === MODE.ENROLL
              ? "bg-white shadow text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Enroll
        </button>
        <button
          onClick={() => setMode(MODE.VERIFY)}
          disabled={!storedDescriptor}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === MODE.VERIFY
              ? "bg-white shadow text-blue-600"
              : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
          }`}
        >
          Verify
        </button>
      </div>

      {mode === MODE.ENROLL &&
        uiState === UI_STATE.READY_TO_START &&
        !storedDescriptor && (
          <div className="mb-4 w-full max-w-sm">
            <input
              type="text"
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

      <div className="relative w-full aspect-4/3 bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
          <div className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full font-medium text-sm shadow-lg border border-white/10">
            {uiState === UI_STATE.LOADING_MODELS
              ? "Loading AI Models..."
              : instruction}
          </div>
        </div>

        {(uiState === UI_STATE.READY_TO_START ||
          uiState === UI_STATE.FAILURE) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <button
              onClick={handleStartClick}
              disabled={mode === MODE.ENROLL && !userName.trim()}
              className={`font-bold py-3 px-8 rounded-full shadow-lg transform transition-all flex items-center gap-2 ${
                mode === MODE.ENROLL && !userName.trim()
                  ? "bg-slate-500 cursor-not-allowed opacity-75 text-slate-200"
                  : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95"
              }`}
            >
              {uiState === UI_STATE.READY_TO_START
                ? "Start Session"
                : "Retry Check"}
            </button>
          </div>
        )}

        {(currentChallenge === "TURN_LEFT" ||
          currentChallenge === "TURN_RIGHT") && (
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <ProgressBar
              progress={progress}
              direction={currentChallenge === "TURN_LEFT" ? "left" : "right"}
            />
          </div>
        )}

        {uiState === UI_STATE.SUCCESS && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md z-30 text-white ${
              mode === MODE.VERIFY && matchScore < 0.8
                ? "bg-red-500/90"
                : "bg-green-500/90"
            }`}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
              {mode === MODE.VERIFY && matchScore < 0.8 ? (
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              )}
            </div>
            <h3 className="text-2xl font-bold text-center px-4">
              {instruction}
            </h3>
            {matchScore !== null && (
              <p className="text-white/90 mt-2 font-mono">
                Match Confidence: {(matchScore * 100).toFixed(2)}%
              </p>
            )}
            <button
              onClick={() => setUiState(UI_STATE.READY_TO_START)}
              className="mt-6 bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {storedDescriptor && (
        <div className="mt-8 w-full p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Identity Enrolled
              </p>
              <p className="text-lg font-medium text-slate-900">
                {enrolledName}
              </p>
              <p className="text-xs text-slate-500">
                Vector ID:{" "}
                {storedDescriptor.slice(0, 1).map((n) => n.toFixed(6))}...
              </p>
            </div>
          </div>
          <button
            onClick={clearIdentity}
            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
          >
            Clear Identity
          </button>
        </div>
      )}
    </div>
  );
}
