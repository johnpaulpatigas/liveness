import * as mpFaceMesh from "@mediapipe/face_mesh";
import * as tf from "@tensorflow/tfjs";
import { FaceRecognitionNet } from "./FaceRecognitionNet";
import {
  calculateBrightness,
  calculateEAR,
  calculateFaceSize,
  calculateHeadTurnV2,
  checkOcclusion,
  generateIntegrityHash,
} from "./utils";

const FaceMesh =
  mpFaceMesh.FaceMesh ||
  mpFaceMesh.default?.FaceMesh ||
  mpFaceMesh.default ||
  (typeof window !== "undefined" ? window.FaceMesh : undefined);
const FACEMESH_TESSELATION =
  mpFaceMesh.FACEMESH_TESSELATION ||
  mpFaceMesh.default?.FACEMESH_TESSELATION ||
  (typeof window !== "undefined" ? window.FACEMESH_TESSELATION : undefined);

const DEFAULT_CONFIG = {
  blinkEARThreshold: 0.25,
  headTurnThreshold: 0.4,
  challengeTimeout: 5000,
  targetFPS: 30,
  minFaceSize: 0.3,
  maxFaceSize: 0.6,
  basePath: "",
  sessionToken: null,
  minBrightness: -0.8,
  maxBrightness: 0.9,
  challenges: null,
};

export class LivenessEngine {
  #faceMesh;
  #recognitionModel;
  #callbacks;
  #config;
  #videoElement;
  #canvasCtx;
  #isReady = false;
  #detectionLoopId = null;
  #isStopped = true;
  #challenges = [];
  #currentChallengeIndex = 0;
  #lastChallengeTime = 0;
  #isChallengeProcessing = false;
  #hasDetectedOpenEyes = false;
  #lastFrameTime = 0;
  #lastLandmarks = null;
  #recordedDescriptor = null;

  constructor(callbacks, config = {}) {
    if (
      !callbacks ||
      typeof callbacks.onReady !== "function" ||
      typeof callbacks.onSuccess !== "function" ||
      typeof callbacks.onFailure !== "function" ||
      typeof callbacks.onChallengeChanged !== "function"
    ) {
      throw new Error(
        "LivenessEngine requires a valid callbacks object with onReady, onSuccess, onFailure, and onChallengeChanged.",
      );
    }
    this.#callbacks = callbacks;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  async load() {
    try {
      const { basePath } = this.#config;
      const cleanBasePath = basePath.endsWith("/")
        ? basePath.slice(0, -1)
        : basePath;

      this.#faceMesh = new FaceMesh({
        locateFile: (file) => `${cleanBasePath}/face_mesh/${file}`,
      });
      this.#faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      this.#faceMesh.onResults(this.#onFaceMeshResults.bind(this));

      const modelUrl = `${cleanBasePath}/face_recognition`;
      this.#recognitionModel = new FaceRecognitionNet();
      await this.#recognitionModel.load(modelUrl);

      this.#isReady = true;
      this.#callbacks.onReady();
    } catch (error) {
      console.error("Fatal error during model loading:", error);
      this.#callbacks.onFailure({
        code: "MODEL_LOAD_FAILED",
        message: `Failed to load models. Check console for details. Error: ${error.message}`,
      });
    }
  }

  updateConfig(newConfig = {}) {
    this.#config = { ...this.#config, ...newConfig };
  }

  start(videoElement, canvasCtx) {
    if (!this.#isReady)
      throw new Error("Engine not loaded. Call load() first.");
    this.#videoElement = videoElement;
    this.#canvasCtx = canvasCtx;
    this.#isStopped = false;
    this.#isChallengeProcessing = false;
    this.#currentChallengeIndex = 0;
    this.#lastChallengeTime = Date.now();
    this.#hasDetectedOpenEyes = false;
    this.#lastFrameTime = 0;
    this.#recordedDescriptor = null;

    this.#challenges = this.#generateChallenges();

    this.#callbacks.onChallengeChanged(
      this.#challenges[this.#currentChallengeIndex],
    );
    if (this.#detectionLoopId) cancelAnimationFrame(this.#detectionLoopId);
    this.#detectionLoop();
  }

  stop() {
    this.#isStopped = true;
    if (this.#detectionLoopId) {
      cancelAnimationFrame(this.#detectionLoopId);
      this.#detectionLoopId = null;
    }
    if (this.#canvasCtx)
      this.#canvasCtx.clearRect(
        0,
        0,
        this.#canvasCtx.canvas.width,
        this.#canvasCtx.canvas.height,
      );
  }

  #generateChallenges() {
    if (this.#config.challenges && Array.isArray(this.#config.challenges)) {
      const validChallenges = ["WAITING", "BLINK", "TURN_LEFT", "TURN_RIGHT"];
      const filtered = this.#config.challenges.filter((c) =>
        validChallenges.includes(c),
      );
      if (filtered.length > 0) {
        return filtered;
      }
    }
    const pool = ["BLINK", "TURN_LEFT", "TURN_RIGHT"];
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return ["WAITING", ...shuffled, "WAITING"];
  }

  #detectionLoop = async () => {
    if (
      this.#isStopped ||
      !this.#videoElement ||
      this.#videoElement.readyState < 2
    ) {
      if (!this.#isStopped)
        this.#detectionLoopId = requestAnimationFrame(this.#detectionLoop);
      return;
    }

    const now = Date.now();
    const elapsed = now - this.#lastFrameTime;
    const fpsInterval = 1000 / this.#config.targetFPS;

    if (elapsed > fpsInterval) {
      this.#lastFrameTime = now - (elapsed % fpsInterval);
      await this.#faceMesh.send({ image: this.#videoElement });
    }

    this.#detectionLoopId = requestAnimationFrame(this.#detectionLoop);
  };

  #onFaceMeshResults = (results) => {
    if (this.#isStopped) return;
    this.#drawDebugOverlay(results.multiFaceLandmarks);
    const faces = results.multiFaceLandmarks;
    if (!faces || faces.length === 0) {
      this.#hasDetectedOpenEyes = false;

      if (
        Date.now() - this.#lastChallengeTime >
        this.#config.challengeTimeout
      ) {
        this.#failChallenge({
          code: "FACE_NOT_FOUND",
          message: "Could not detect a face.",
        });
      }
      return;
    }
    const landmarks = faces[0];
    this.#lastLandmarks = landmarks;
    this.#processChallenge(landmarks);
  };

  #processChallenge(landmarks) {
    if (this.#isChallengeProcessing) return;

    const currentChallenge = this.#challenges[this.#currentChallengeIndex];
    let challengePassed = false;
    let progress = 0;
    let rawValue;
    let distance;

    switch (currentChallenge) {
      case "WAITING": {
        const faceSize = calculateFaceSize(landmarks);
        if (faceSize < this.#config.minFaceSize) {
          distance = "CLOSER";
        } else if (faceSize > this.#config.maxFaceSize) {
          distance = "FURTHER";
        } else {
          const turnRatio = Math.abs(calculateHeadTurnV2(landmarks));
          if (turnRatio <= 0.2) {
            challengePassed = true;
            this.#recordCenterFace(landmarks);
          }
        }
        this.#callbacks.onChallengeChanged(currentChallenge, distance);
        break;
      }
      case "BLINK": {
        const videoW =
          this.#videoElement?.videoWidth || this.#videoElement?.width || 640;
        const videoH =
          this.#videoElement?.videoHeight || this.#videoElement?.height || 480;
        const leftEAR = calculateEAR(landmarks, "left", videoW, videoH);
        const rightEAR = calculateEAR(landmarks, "right", videoW, videoH);
        rawValue = Math.min(leftEAR, rightEAR);

        const OPEN_THRESHOLD = Math.min(
          0.3,
          Math.max(0.27, this.#config.blinkEARThreshold + 0.02),
        );

        if (rawValue > OPEN_THRESHOLD) {
          this.#hasDetectedOpenEyes = true;
        }

        if (
          this.#hasDetectedOpenEyes &&
          rawValue < this.#config.blinkEARThreshold
        ) {
          challengePassed = true;
        }
        break;
      }
      case "TURN_LEFT": {
        const turnRatio = calculateHeadTurnV2(landmarks);
        rawValue = turnRatio;
        if (turnRatio > this.#config.headTurnThreshold) {
          challengePassed = true;
          progress = 1;
        } else {
          progress = Math.max(0, turnRatio / this.#config.headTurnThreshold);
        }
        break;
      }
      case "TURN_RIGHT": {
        const turnRatio = calculateHeadTurnV2(landmarks);
        rawValue = turnRatio;
        if (turnRatio < -this.#config.headTurnThreshold) {
          challengePassed = true;
          progress = 1;
        } else {
          progress = Math.max(0, turnRatio / -this.#config.headTurnThreshold);
        }
        break;
      }
    }

    const clampedProgress = Math.max(0, Math.min(progress, 1));
    this.#callbacks.onProgress?.(clampedProgress, rawValue);

    if (challengePassed) {
      this.#isChallengeProcessing = true;
      setTimeout(() => this.#moveToNextChallenge(), 300);
    } else if (
      Date.now() - this.#lastChallengeTime >
      this.#config.challengeTimeout
    ) {
      this.#failChallenge({
        code: "CHALLENGE_TIMEOUT",
        message: `Challenge timed out: ${currentChallenge}`,
      });
    }
  }

  #failChallenge(error) {
    this.stop();
    this.#callbacks.onFailure(error);
  }

  #moveToNextChallenge() {
    this.#currentChallengeIndex++;
    this.#hasDetectedOpenEyes = false;
    if (this.#currentChallengeIndex >= this.#challenges.length) {
      this.#completeLiveness();
    } else {
      this.#lastChallengeTime = Date.now();
      this.#callbacks.onChallengeChanged(
        this.#challenges[this.#currentChallengeIndex],
        null,
      );
      this.#isChallengeProcessing = false;
    }
  }

  #recordCenterFace(landmarks) {
    try {
      const rawFaceTensor = this.#getFaceTensor([150, 150], landmarks);
      const normalizedTensor = tf.tidy(() =>
        rawFaceTensor.div(tf.scalar(127.5)).sub(tf.scalar(1.0)),
      );

      const brightness = calculateBrightness(normalizedTensor);
      const occlusionDetected = checkOcclusion(landmarks);

      tf.dispose(normalizedTensor);

      if (brightness < this.#config.minBrightness) {
        tf.dispose(rawFaceTensor);
        return this.#failChallenge({
          code: "POOR_LIGHTING",
          message: "Environment is too dark. Please move to a brighter area.",
        });
      }

      if (brightness > this.#config.maxBrightness) {
        tf.dispose(rawFaceTensor);
        return this.#failChallenge({
          code: "POOR_LIGHTING",
          message:
            "Environment is too bright (Glare detected). Please adjust lighting.",
        });
      }

      if (occlusionDetected) {
        tf.dispose(rawFaceTensor);
        return this.#failChallenge({
          code: "OCCLUSION_DETECTED",
          message:
            "Face is partially covered. Please remove any masks or obstructions.",
        });
      }

      const predictionTensor = this.#recognitionModel.predict(rawFaceTensor);
      this.#recordedDescriptor = Array.from(predictionTensor.dataSync());
      tf.dispose([rawFaceTensor, predictionTensor]);
    } catch (err) {
      console.warn("Failed to record center face descriptor:", err);
    }
  }

  async #completeLiveness() {
    this.stop();
    this.#callbacks.onChallengeChanged("PROCESSING");
    try {
      let descriptorArray = this.#recordedDescriptor;

      if (!descriptorArray) {
        const rawFaceTensor = this.#getFaceTensor(
          [150, 150],
          this.#lastLandmarks,
        );
        const normalizedTensor = tf.tidy(() =>
          rawFaceTensor.div(tf.scalar(127.5)).sub(tf.scalar(1.0)),
        );

        const brightness = calculateBrightness(normalizedTensor);
        const occlusionDetected = checkOcclusion(this.#lastLandmarks);

        tf.dispose(normalizedTensor);

        if (brightness < this.#config.minBrightness) {
          tf.dispose(rawFaceTensor);
          return this.#failChallenge({
            code: "POOR_LIGHTING",
            message: "Environment is too dark. Please move to a brighter area.",
          });
        }

        if (brightness > this.#config.maxBrightness) {
          tf.dispose(rawFaceTensor);
          return this.#failChallenge({
            code: "POOR_LIGHTING",
            message:
              "Environment is too bright (Glare detected). Please adjust lighting.",
          });
        }

        if (occlusionDetected) {
          tf.dispose(rawFaceTensor);
          return this.#failChallenge({
            code: "OCCLUSION_DETECTED",
            message:
              "Face is partially covered. Please remove any masks or obstructions.",
          });
        }

        const predictionTensor = this.#recognitionModel.predict(rawFaceTensor);
        descriptorArray = Array.from(await predictionTensor.data());
        tf.dispose([rawFaceTensor, predictionTensor]);
      }

      const timestamp = Date.now();
      const sessionToken = this.#config.sessionToken || "local-session";
      const integrity = generateIntegrityHash(
        descriptorArray,
        sessionToken,
        timestamp,
      );

      this.#callbacks.onSuccess({
        descriptor: descriptorArray,
        sessionToken,
        timestamp,
        challenges: this.#challenges,
        integrity,
      });
    } catch (error) {
      console.error("Face recognition failed:", error);
      this.#failChallenge({
        code: "RECOGNITION_FAILED",
        message: error.message,
      });
    }
  }

  #getFaceTensor(inputSize, landmarks) {
    return tf.tidy(() => {
      const [targetH, targetW] = inputSize || [150, 150];

      if (
        !landmarks ||
        landmarks.length < 468 ||
        !this.#videoElement ||
        typeof document === "undefined"
      ) {
        const image = tf.browser.fromPixels(this.#videoElement);
        return tf.image
          .resizeBilinear(image, [targetH, targetW])
          .toFloat()
          .expandDims(0);
      }

      // 1. Calculate Eye Centers using MediaPipe landmarks
      // Left eye outer corner (33) & inner corner (133)
      const leftEyeX = (landmarks[33].x + landmarks[133].x) / 2;
      const leftEyeY = (landmarks[33].y + landmarks[133].y) / 2;

      // Right eye inner corner (362) & outer corner (263)
      const rightEyeX = (landmarks[362].x + landmarks[263].x) / 2;
      const rightEyeY = (landmarks[362].y + landmarks[263].y) / 2;

      // 2. Video Dimensions
      const videoW =
        this.#videoElement.videoWidth || this.#videoElement.width || 640;
      const videoH =
        this.#videoElement.videoHeight || this.#videoElement.height || 480;

      const srcLeftEye = { x: leftEyeX * videoW, y: leftEyeY * videoH };
      const srcRightEye = { x: rightEyeX * videoW, y: rightEyeY * videoH };

      // 3. Compute rotation angle (radians) and eye distance
      const dx = srcRightEye.x - srcLeftEye.x;
      const dy = srcRightEye.y - srcLeftEye.y;
      const eyeDist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const srcCenter = {
        x: (srcLeftEye.x + srcRightEye.x) / 2,
        y: (srcLeftEye.y + srcRightEye.y) / 2,
      };

      // 4. Canonical Alignment coordinates (ResNet-34 standard for 150x150)
      const targetCenter = {
        x: targetW * 0.5,
        y: targetH * 0.45,
      };
      const targetEyeDist = targetW * 0.38;
      const scale = targetEyeDist / Math.max(eyeDist, 1e-5);

      // 5. In-memory canvas affine transformation
      const canvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(targetW, targetH)
          : document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.save();
        ctx.translate(targetCenter.x, targetCenter.y);
        ctx.rotate(-angle);
        ctx.scale(scale, scale);
        ctx.translate(-srcCenter.x, -srcCenter.y);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(this.#videoElement, 0, 0, videoW, videoH);
        ctx.restore();

        const imageTensor = tf.browser.fromPixels(canvas);
        return imageTensor.toFloat().expandDims(0);
      }

      // Fallback if canvas context is unavailable
      const image = tf.browser.fromPixels(this.#videoElement);
      return tf.image
        .resizeBilinear(image, [targetH, targetW])
        .toFloat()
        .expandDims(0);
    });
  }

  #drawDebugOverlay(landmarksArray) {
    if (!this.#canvasCtx || !landmarksArray || landmarksArray.length === 0)
      return;
    const canvas = this.#canvasCtx.canvas;
    const videoW = this.#videoElement?.videoWidth;
    const videoH = this.#videoElement?.videoHeight;
    if (
      videoW &&
      videoH &&
      (canvas.width !== videoW || canvas.height !== videoH)
    ) {
      canvas.width = videoW;
      canvas.height = videoH;
    }
    this.#canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const landmarks = landmarksArray[0];
    for (const [start, end] of FACEMESH_TESSELATION) {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      this.#canvasCtx.beginPath();
      const startX = (1 - startPoint.x) * canvas.width;
      const startY = startPoint.y * canvas.height;
      const endX = (1 - endPoint.x) * canvas.width;
      const endY = endPoint.y * canvas.height;
      this.#canvasCtx.moveTo(startX, startY);
      this.#canvasCtx.lineTo(endX, endY);
      this.#canvasCtx.strokeStyle = "rgba(0, 255, 0, 0.3)";
      this.#canvasCtx.lineWidth = 1;
      this.#canvasCtx.stroke();
    }
  }
}
