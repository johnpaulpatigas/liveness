import {
  calculateCosineSimilarity,
  calculateEuclideanDistance,
} from "@liveness/engine/utils";
import { LivenessSDK } from "@liveness/sdk";
import { useEffect, useRef, useState } from "react";
import { ApiSettings } from "./ApiSettings";
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

const VERIFY_TYPE = {
  ONE_TO_MANY: "1:N",
  ONE_TO_ONE: "1:1",
};

const MATCH_THRESHOLD = 0.95;
const EUCLIDEAN_THRESHOLD = 0.3;

export function LivenessChecker() {
  const [uiState, setUiState] = useState(UI_STATE.IDLE);
  const [mode, setMode] = useState(MODE.ENROLL);
  const [verifyType, setVerifyType] = useState(VERIFY_TYPE.ONE_TO_MANY);
  const [instruction, setInstruction] = useState("");
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [targetId, setTargetId] = useState("");
  const [selectedLocalIndex, setSelectedLocalIndex] = useState(0);

  const [recentCloudUsers, setRecentCloudUsers] = useState(() => {
    const saved = localStorage.getItem("recent_cloud_identities");
    try {
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter((u) => u && typeof u === "object" && u.id)
        : [];
    } catch {
      return [];
    }
  });

  const [matchMetrics, setMatchMetrics] = useState(null);
  const [verificationPassed, setVerificationPassed] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [distanceHint, setDistanceHint] = useState(null);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedChallenges, setSelectedChallenges] = useState([
    "WAITING",
    "BLINK",
    "TURN_LEFT",
    "TURN_RIGHT",
  ]);

  const toggleChallenge = (type) => {
    setSelectedChallenges((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== type);
      } else {
        const order = ["WAITING", "BLINK", "TURN_LEFT", "TURN_RIGHT"];
        const next = [...prev, type];
        return order.filter((c) => next.includes(c));
      }
    });
  };

  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem("cloud_api_config");
    try {
      return saved
        ? JSON.parse(saved)
        : {
            enabled: false,
            apiKey: "",
            apiUrl: "http://localhost:3000/api/liveness",
          };
    } catch {
      return {
        enabled: false,
        apiKey: "",
        apiUrl: "http://localhost:3000/api/liveness",
      };
    }
  });

  const isCloudMode = !!(apiConfig.enabled && apiConfig.apiKey);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sdkRef = useRef(null);
  const userNameRef = useRef(userName);
  const targetIdRef = useRef(targetId);
  const verifyTypeRef = useRef(verifyType);
  const selectedLocalIndexRef = useRef(selectedLocalIndex);
  const enrolledUsersRef = useRef(enrolledUsers);
  const apiConfigRef = useRef(apiConfig);

  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    targetIdRef.current = targetId;
  }, [targetId]);

  useEffect(() => {
    verifyTypeRef.current = verifyType;
  }, [verifyType]);

  useEffect(() => {
    selectedLocalIndexRef.current = selectedLocalIndex;
  }, [selectedLocalIndex]);

  useEffect(() => {
    enrolledUsersRef.current = enrolledUsers;
  }, [enrolledUsers]);

  useEffect(() => {
    apiConfigRef.current = apiConfig;
    localStorage.setItem("cloud_api_config", JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    localStorage.setItem(
      "recent_cloud_identities",
      JSON.stringify(recentCloudUsers),
    );
  }, [recentCloudUsers]);

  useEffect(() => {
    if (!isCloudMode) {
      const saved = localStorage.getItem("face_identity");
      if (saved) {
        try {
          const rawUsers = JSON.parse(saved);
          if (Array.isArray(rawUsers) && rawUsers.length > 0) {
            const users = rawUsers.map((u, idx) => ({
              id: u.id || `local-${idx + 1}`,
              name: u.name || `User ${idx + 1}`,
              descriptor: u.descriptor,
            }));
            setEnrolledUsers(users);
            setMode(MODE.VERIFY);
          } else {
            setEnrolledUsers([]);
            setMode(MODE.ENROLL);
          }
        } catch (e) {
          console.error("Failed to parse enrolled identities", e);
          setEnrolledUsers([]);
        }
      } else {
        setEnrolledUsers([]);
        setMode(MODE.ENROLL);
      }
    } else {
      setMode(MODE.VERIFY);
    }
  }, [isCloudMode]);

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

    sdk.on("challenge", ({ type, instruction, distance }) => {
      setCurrentChallenge(type);
      setInstruction(instruction);
      setDistanceHint(distance);
      setProgress(0);
    });

    sdk.on("progress", ({ progress }) => {
      setProgress(progress);
    });

    sdk.on("success", async (livenessResult) => {
      const { descriptor } = livenessResult;
      setCurrentChallenge(null);

      // Cloud Mode
      if (apiConfigRef.current.enabled && apiConfigRef.current.apiKey) {
        try {
          const apiKey = apiConfigRef.current.apiKey.trim();
          setInstruction("Syncing with Cloud API...");

          const rawUrl =
            apiConfigRef.current.apiUrl?.trim() ||
            "http://localhost:3000/api/liveness";
          const baseUrl = rawUrl.replace(/\/+$/, "");

          let endpoint;
          let body;

          if (modeRef.current === MODE.ENROLL) {
            endpoint = `${baseUrl}/enroll`;
            body = { name: userNameRef.current || "User", ...livenessResult };
          } else if (verifyTypeRef.current === VERIFY_TYPE.ONE_TO_ONE) {
            endpoint = `${baseUrl}/verify-one`;
            const currentTargetId = (targetIdRef.current || "").trim();
            if (!currentTargetId) {
              throw new Error(
                "Target ID (UUID) is required for 1:1 verification.",
              );
            }
            body = { targetId: currentTargetId, ...livenessResult };
          } else {
            endpoint = `${baseUrl}/verify`;
            body = livenessResult;
          }

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.error || `Request failed with status ${response.status}`,
            );
          }

          const cloudResult = await response.json();

          if (modeRef.current === MODE.ENROLL) {
            const newCloudUser = {
              id: cloudResult.id,
              name: cloudResult.name,
              enrolledAt: cloudResult.enrolled_at || new Date().toISOString(),
            };
            setRecentCloudUsers((prev) => {
              const filtered = prev.filter((u) => u.id !== newCloudUser.id);
              return [newCloudUser, ...filtered].slice(0, 10);
            });
            setTargetId(cloudResult.id);
            setVerificationPassed(true);
            setUiState(UI_STATE.SUCCESS);
            setInstruction(`Cloud Identity Enrolled: ${cloudResult.name}`);
            setUserName("");
          } else if (verifyTypeRef.current === VERIFY_TYPE.ONE_TO_ONE) {
            setMatchMetrics({
              similarity: cloudResult.match?.similarity ?? 0,
              distance: cloudResult.match?.distance ?? Infinity,
            });
            setVerificationPassed(Boolean(cloudResult.verified));
            setUiState(UI_STATE.SUCCESS);
            setInstruction(
              cloudResult.verified
                ? `1:1 Match confirmed for ${cloudResult.match?.name || "Target User"}`
                : "1:1 Verification Failed: Face does not match target ID.",
            );
          } else {
            setMatchMetrics({
              similarity: cloudResult.match?.similarity ?? 0,
              distance: cloudResult.match?.distance ?? Infinity,
            });
            setVerificationPassed(Boolean(cloudResult.verified));
            setUiState(UI_STATE.SUCCESS);
            setInstruction(
              cloudResult.verified
                ? `Identified as ${cloudResult.match?.name}`
                : "1:N Verification Failed: No matching identity found.",
            );
          }
        } catch (err) {
          setVerificationPassed(false);
          setUiState(UI_STATE.FAILURE);
          setInstruction(`Cloud API Error: ${err.message}`);
        }
      }
      // Offline / LocalStorage Mode
      else {
        if (modeRef.current === MODE.ENROLL) {
          const newIdentity = {
            id: `local_${Date.now().toString(36)}`,
            name: (userNameRef.current || "").trim() || "User",
            descriptor,
          };

          setEnrolledUsers((prev) => {
            const updated = [...prev, newIdentity];
            localStorage.setItem("face_identity", JSON.stringify(updated));
            return updated;
          });

          setVerificationPassed(true);
          setUiState(UI_STATE.SUCCESS);
          setInstruction(`Enrolled ${newIdentity.name} locally!`);
          setUserName("");
        } else if (verifyTypeRef.current === VERIFY_TYPE.ONE_TO_ONE) {
          const targetUser =
            enrolledUsersRef.current[selectedLocalIndexRef.current];
          if (!targetUser) {
            setVerificationPassed(false);
            setUiState(UI_STATE.FAILURE);
            setInstruction("No local identity selected for 1:1 verification.");
            return;
          }

          const similarity = calculateCosineSimilarity(
            descriptor,
            targetUser.descriptor,
          );
          const distance = calculateEuclideanDistance(
            descriptor,
            targetUser.descriptor,
          );

          setMatchMetrics({ similarity, distance });
          const isMatch =
            similarity >= MATCH_THRESHOLD && distance <= EUCLIDEAN_THRESHOLD;

          setVerificationPassed(isMatch);
          setUiState(UI_STATE.SUCCESS);
          setInstruction(
            isMatch
              ? `1:1 Verified: Matches ${targetUser.name}`
              : `1:1 Mismatch: Does not match ${targetUser.name}`,
          );
        } else {
          if (enrolledUsersRef.current.length > 0) {
            let bestMatch = {
              similarity: -1,
              distance: Infinity,
              name: "Unknown",
            };

            enrolledUsersRef.current.forEach((user) => {
              const similarity = calculateCosineSimilarity(
                descriptor,
                user.descriptor,
              );
              const distance = calculateEuclideanDistance(
                descriptor,
                user.descriptor,
              );
              if (similarity > bestMatch.similarity) {
                bestMatch = { similarity, distance, name: user.name };
              }
            });

            const finalSim =
              bestMatch.similarity >= 0 ? bestMatch.similarity : 0;
            setMatchMetrics({
              similarity: finalSim,
              distance: bestMatch.distance,
            });

            const isMatch =
              finalSim >= MATCH_THRESHOLD &&
              bestMatch.distance <= EUCLIDEAN_THRESHOLD;

            setVerificationPassed(isMatch);
            setUiState(UI_STATE.SUCCESS);
            setInstruction(
              isMatch
                ? `1:N Verified: Identified as ${bestMatch.name}`
                : "1:N Identification Failed: No match found.",
            );
          } else {
            setVerificationPassed(false);
            setUiState(UI_STATE.FAILURE);
            setInstruction("No local identities found.");
          }
        }
      }
    });

    sdk.on("failure", (error) => {
      setVerificationPassed(false);
      setUiState(UI_STATE.FAILURE);
      setInstruction(`Error: ${error.message}`);
      setCurrentChallenge(null);
    });

    sdk.on("error", (err) => {
      setVerificationPassed(false);
      setUiState(UI_STATE.FAILURE);
      setInstruction(`System Error: ${err.message}`);
    });

    sdk.load().catch(console.error);
    sdkRef.current = sdk;

    const currentVideo = videoRef.current;
    return () => sdkRef.current?.stop(currentVideo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartClick = async () => {
    if (!videoRef.current || !canvasRef.current || !sdkRef.current) return;
    setProgress(0);
    setMatchMetrics(null);
    setVerificationPassed(null);
    setCurrentChallenge(null);
    setUiState(UI_STATE.CHECKING);

    let sessionToken = `sess_${Math.random().toString(36).substring(2, 15)}`;
    let challengeList = selectedChallenges;

    if (apiConfigRef.current.enabled && apiConfigRef.current.apiKey) {
      try {
        const rawUrl =
          apiConfigRef.current.apiUrl?.trim() ||
          "http://localhost:3000/api/liveness";
        const baseUrl = rawUrl.replace(/\/+$/, "");
        const apiKey = apiConfigRef.current.apiKey.trim();

        setInstruction("Requesting secure verification session...");
        const hasWaiting = selectedChallenges.includes("WAITING");
        const active = selectedChallenges.filter((c) => c !== "WAITING");
        const shuffledActive = [...active];
        for (let i = shuffledActive.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledActive[i], shuffledActive[j]] = [
            shuffledActive[j],
            shuffledActive[i],
          ];
        }
        const requestedChallenges = hasWaiting
          ? ["WAITING", ...shuffledActive, "WAITING"]
          : shuffledActive;

        const sessionRes = await fetch(`${baseUrl}/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            challenges: requestedChallenges,
          }),
        });

        if (!sessionRes.ok) {
          const errData = await sessionRes.json().catch(() => ({}));
          throw new Error(
            errData.error || `Session creation failed (${sessionRes.status})`,
          );
        }

        const sessionData = await sessionRes.json();
        sessionToken = sessionData.sessionToken;
        challengeList = sessionData.challenges;
      } catch (err) {
        setUiState(UI_STATE.FAILURE);
        setInstruction(`Cloud Session Error: ${err.message}`);
        return;
      }
    } else {
      if (selectedChallenges.includes("WAITING")) {
        const active = selectedChallenges.filter((c) => c !== "WAITING");
        const shuffled = [...active];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        challengeList = ["WAITING", ...shuffled, "WAITING"];
      } else {
        const shuffled = [...selectedChallenges];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        challengeList = shuffled;
      }
    }

    sdkRef.current.updateConfig({
      sessionToken,
      challenges: challengeList,
    });

    try {
      await sdkRef.current.start(videoRef.current, canvasRef.current);
    } catch {
      setUiState(UI_STATE.CAMERA_ERROR);
    }
  };

  const clearIdentity = () => {
    localStorage.removeItem("face_identity");
    setEnrolledUsers([]);
    setUserName("");
    setVerificationPassed(null);
    setMode(MODE.ENROLL);
    setUiState(UI_STATE.READY_TO_START);
  };

  const removeIdentity = (indexToRemove) => {
    setEnrolledUsers((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      if (updated.length === 0) {
        localStorage.removeItem("face_identity");
        setMode(MODE.ENROLL);
      } else {
        localStorage.setItem("face_identity", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleCopyId = (id) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const isStartDisabled =
    (mode === MODE.ENROLL && !userName?.trim()) ||
    (mode === MODE.VERIFY &&
      verifyType === VERIFY_TYPE.ONE_TO_ONE &&
      isCloudMode &&
      !targetId?.trim()) ||
    (mode === MODE.VERIFY && !isCloudMode && enrolledUsers.length === 0);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isCloudMode ? "bg-emerald-400" : "bg-blue-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isCloudMode ? "bg-emerald-500" : "bg-blue-600"
              }`}
            />
          </span>
          <span className="text-xs font-bold tracking-wide text-slate-700 uppercase">
            {isCloudMode ? "Cloud SaaS Orchestration" : "Client-Side Local Storage"}
          </span>
        </div>
        <ApiSettings config={apiConfig} onSave={setApiConfig} />
      </div>

      {/* Main Studio Area: 2 Columns on desktop */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Biometric Camera Viewport & HUD (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative aspect-3/4 sm:aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-950 shadow-xl ring-1 ring-slate-900/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full scale-x-[-1] transform object-cover"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />

            {/* Biometric Circle Reticle Guide (Preserves 1:1 circle on portrait/landscape) */}
            {uiState === UI_STATE.CHECKING && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="relative aspect-square w-full max-w-65 sm:max-w-70 rounded-full border-2 border-dashed border-white/30 transition-all">
                  {/* Subtle alignment corner ticks */}
                  <span className="absolute -top-1 left-1/2 h-2.5 w-0.5 -translate-x-1/2 bg-white/60" />
                  <span className="absolute -bottom-1 left-1/2 h-2.5 w-0.5 -translate-x-1/2 bg-white/60" />
                  <span className="absolute top-1/2 -left-1 h-0.5 w-2.5 -translate-y-1/2 bg-white/60" />
                  <span className="absolute top-1/2 -right-1 h-0.5 w-2.5 -translate-y-1/2 bg-white/60" />
                </div>
              </div>
            )}

            {/* Top Floating Instruction Pill */}
            <div className="absolute top-4 right-0 left-0 z-10 flex justify-center px-4">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/80 px-5 py-2 text-center text-xs font-medium text-white shadow-lg backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#2f5bf5] animate-pulse" />
                <span>
                  {uiState === UI_STATE.LOADING_MODELS
                    ? "Loading neural network weights..."
                    : instruction || "Position your face in the frame"}
                </span>
              </div>
            </div>

            {/* Distance Hint Badge */}
            {currentChallenge === "WAITING" && distanceHint && (
              <div className="absolute top-1/2 right-0 left-0 z-10 flex justify-center">
                <div className="rounded-full border border-amber-400/30 bg-amber-500/90 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg backdrop-blur-md">
                  {distanceHint === "CLOSER" ? "Move closer to camera" : "Step slightly back"}
                </div>
              </div>
            )}

            {/* Start / Retry Overlay */}
            {(uiState === UI_STATE.READY_TO_START ||
              uiState === UI_STATE.FAILURE) && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 p-6 backdrop-blur-xs">
                <button
                  onClick={handleStartClick}
                  disabled={isStartDisabled}
                  className={`cursor-pointer rounded-xl px-7 py-3 text-sm font-semibold shadow-md transition-all ${
                    isStartDisabled
                      ? "cursor-not-allowed bg-slate-800 text-slate-500 opacity-60"
                      : "bg-[#2f5bf5] text-white hover:bg-[#204be8] active:scale-95"
                  }`}
                >
                  {uiState === UI_STATE.READY_TO_START
                    ? "Start Verification"
                    : "Retry Session"}
                </button>
                {isStartDisabled && (
                  <p className="mt-3 text-xs text-slate-300">
                    {mode === MODE.ENROLL
                      ? "Enter a full name on the right to begin"
                      : "Provide a target user ID or enroll a face first"}
                  </p>
                )}
              </div>
            )}

            {/* Turn Head Progress Bar */}
            {(currentChallenge === "TURN_LEFT" ||
              currentChallenge === "TURN_RIGHT") && (
              <div className="absolute right-0 bottom-0 left-0 z-10 p-5">
                <ProgressBar
                  progress={progress}
                  direction={currentChallenge === "TURN_LEFT" ? "left" : "right"}
                />
              </div>
            )}

            {/* Result Modal Overlay */}
            {uiState === UI_STATE.SUCCESS && (
              <div
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-white backdrop-blur-md ${
                  verificationPassed === false
                    ? "bg-rose-950/90"
                    : "bg-emerald-950/90"
                }`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl">
                  {verificationPassed === false ? (
                    <svg
                      className="h-8 w-8 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-8 w-8 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <h3 className="px-4 text-center text-xl font-bold">
                  {instruction}
                </h3>

                {mode === MODE.VERIFY && matchMetrics !== null && (
                  <div className="mt-3 flex items-center gap-3 rounded-full bg-black/40 px-4 py-1.5 font-mono text-xs text-white/90">
                    <span>Cosine: {(matchMetrics.similarity * 100).toFixed(1)}%</span>
                    <span className="text-white/30">•</span>
                    <span>
                      Distance:{" "}
                      {matchMetrics.distance !== undefined &&
                      matchMetrics.distance !== Infinity
                        ? matchMetrics.distance.toFixed(3)
                        : "N/A"}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setUiState(UI_STATE.READY_TO_START)}
                  className="mt-6 cursor-pointer rounded-xl bg-white px-6 py-2 text-xs font-bold text-slate-900 shadow-sm transition-transform hover:bg-slate-100 active:scale-95"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Configuration & Parameters (5 cols) */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Mode Switcher: Enroll vs Verify */}
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification Objective
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.ENROLL);
                  setUiState(UI_STATE.READY_TO_START);
                }}
                className={`cursor-pointer rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === MODE.ENROLL
                    ? "bg-white text-[#2f5bf5] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Enroll Identity
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.VERIFY);
                  setUiState(UI_STATE.READY_TO_START);
                }}
                disabled={!isCloudMode && enrolledUsers.length === 0}
                className={`cursor-pointer rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === MODE.VERIFY
                    ? "bg-white text-[#2f5bf5] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                }`}
              >
                Verify Identity
              </button>
            </div>
          </div>

          {/* Enroll Name Input */}
          {mode === MODE.ENROLL && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4">
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={userName ?? ""}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f5bf5] focus:ring-2 focus:ring-[#2f5bf5]/20 focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Captured biometric descriptor vector will be bound to this profile.
              </p>
            </div>
          )}

          {/* Verification Type (1:N vs 1:1) */}
          {mode === MODE.VERIFY && (
            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Matching Mode</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {isCloudMode ? "Cloud Endpoints" : "Local Vector Store"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerifyType(VERIFY_TYPE.ONE_TO_MANY);
                    setUiState(UI_STATE.READY_TO_START);
                  }}
                  className={`flex cursor-pointer flex-col rounded-lg border p-2.5 text-left transition-all ${
                    verifyType === VERIFY_TYPE.ONE_TO_MANY
                      ? "border-[#2f5bf5] bg-blue-50/60 text-slate-900 ring-1 ring-[#2f5bf5]/30"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold">1:N Identification</span>
                  <span className="mt-0.5 text-[11px] text-slate-500">Search database</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerifyType(VERIFY_TYPE.ONE_TO_ONE);
                    setUiState(UI_STATE.READY_TO_START);
                  }}
                  className={`flex cursor-pointer flex-col rounded-lg border p-2.5 text-left transition-all ${
                    verifyType === VERIFY_TYPE.ONE_TO_ONE
                      ? "border-[#2f5bf5] bg-blue-50/60 text-slate-900 ring-1 ring-[#2f5bf5]/30"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold">1:1 Verification</span>
                  <span className="mt-0.5 text-[11px] text-slate-500">Target identity</span>
                </button>
              </div>

              {/* 1:1 Target ID Input */}
              {verifyType === VERIFY_TYPE.ONE_TO_ONE && (
                <div className="pt-2 border-t border-slate-100">
                  {isCloudMode ? (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Target User UUID
                      </label>
                      <input
                        type="text"
                        placeholder="550e8400-e29b-41d4-a716-446655440000"
                        value={targetId ?? ""}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs focus:border-[#2f5bf5] focus:outline-none"
                      />
                      {recentCloudUsers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {recentCloudUsers.map((u, i) => (
                            <button
                              key={u.id || `cloud-btn-${i}`}
                              type="button"
                              onClick={() => setTargetId(u.id || "")}
                              className="cursor-pointer rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700 hover:bg-slate-200"
                            >
                              {u.name || "User"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Select Local User
                      </label>
                      <select
                        value={selectedLocalIndex}
                        onChange={(e) => setSelectedLocalIndex(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        {enrolledUsers.map((u, i) => (
                          <option key={u.id || i} value={i}>
                            {u.name} ({u.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Challenges Config */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <h4 className="mb-2.5 text-xs font-bold text-slate-700">
              Active Liveness Challenges
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "WAITING", label: "Center Face" },
                { id: "BLINK", label: "Eye Blink" },
                { id: "TURN_LEFT", label: "Turn Left" },
                { id: "TURN_RIGHT", label: "Turn Right" },
              ].map((ch) => (
                <label
                  key={ch.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs font-semibold transition-colors ${
                    selectedChallenges.includes(ch.id)
                      ? "border-blue-200 bg-blue-50/70 text-[#2f5bf5]"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>{ch.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedChallenges.includes(ch.id)}
                    onChange={() => toggleChallenge(ch.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-[#2f5bf5] focus:ring-[#2f5bf5]"
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Challenges are automatically randomized during verification to prevent replay spoofs.
            </p>
          </div>
        </div>
      </div>

      {/* Local Identities Directory (Offline Mode) */}
      {!isCloudMode && enrolledUsers.length > 0 && (
        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="font-bold text-slate-800">
              Local Identities ({enrolledUsers.length})
            </h3>
            <button
              onClick={clearIdentity}
              className="cursor-pointer text-xs font-bold tracking-wider text-red-500 uppercase hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {enrolledUsers.map((user, index) => (
              <li
                key={user.id || index}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="font-mono text-xs text-slate-400">
                      {user.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(MODE.VERIFY);
                      setVerifyType(VERIFY_TYPE.ONE_TO_ONE);
                      setSelectedLocalIndex(index);
                      setUiState(UI_STATE.READY_TO_START);
                    }}
                    className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700"
                  >
                    Verify 1:1
                  </button>
                  <button
                    onClick={() => removeIdentity(index)}
                    className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                    title="Remove"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cloud Identities Directory */}
      {isCloudMode && recentCloudUsers.length > 0 && (
        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="font-bold text-slate-800">
              Recent Cloud Enrollments ({recentCloudUsers.length})
            </h3>
            <button
              onClick={() => {
                setRecentCloudUsers([]);
                localStorage.removeItem("recent_cloud_identities");
              }}
              className="cursor-pointer text-xs font-bold tracking-wider text-red-500 uppercase hover:text-red-700"
            >
              Clear
            </button>
          </div>
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {recentCloudUsers.map((user, idx) => (
              <li
                key={user.id || `cloud-user-${idx}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="font-mono text-xs text-slate-400">
                      ID: {user.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyId(user.id)}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {copiedId === user.id ? "Copied!" : "Copy ID"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(MODE.VERIFY);
                      setVerifyType(VERIFY_TYPE.ONE_TO_ONE);
                      setTargetId(user.id);
                      setUiState(UI_STATE.READY_TO_START);
                    }}
                    className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700"
                  >
                    Verify 1:1
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
