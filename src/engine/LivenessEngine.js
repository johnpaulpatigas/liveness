// src/engine/LivenessEngine.js
import { FaceMesh, FACEMESH_TESSELATION } from "@mediapipe/face_mesh";
import * as tf from "@tensorflow/tfjs";
import { calculateEAR, calculateHeadTurnV2 } from "./utils";

const DEFAULT_CONFIG = {
  blinkEARThreshold: 0.25,
  headTurnThreshold: 0.4,
  challengeTimeout: 5000,
  targetFPS: 30,
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
      this.#faceMesh = new FaceMesh({
        locateFile: (file) => `/face_mesh/${file}`,
      });
      this.#faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      this.#faceMesh.onResults(this.#onFaceMeshResults.bind(this));

      const modelUrl = "/mobilenet-v2/model.json";

      this.#recognitionModel = await tf.loadGraphModel(modelUrl);

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
    const challenges = ["BLINK"];

    if (Math.random() > 0.5) {
      challenges.push("TURN_LEFT", "TURN_RIGHT");
    } else {
      challenges.push("TURN_RIGHT", "TURN_LEFT");
    }

    for (let i = challenges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [challenges[i], challenges[j]] = [challenges[j], challenges[i]];
    }

    return challenges;
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
    this.#processChallenge(landmarks);
  };

  #processChallenge(landmarks) {
    if (this.#isChallengeProcessing) return;

    const currentChallenge = this.#challenges[this.#currentChallengeIndex];
    let challengePassed = false;
    let progress = 0;
    let rawValue;

    switch (currentChallenge) {
      case "BLINK": {
        const leftEAR = calculateEAR(landmarks, "left");
        const rightEAR = calculateEAR(landmarks, "right");
        rawValue = Math.min(leftEAR, rightEAR);

        const OPEN_THRESHOLD = 0.3;

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
      );
      this.#isChallengeProcessing = false;
    }
  }

  async #completeLiveness() {
    this.stop();
    this.#callbacks.onChallengeChanged("PROCESSING");
    try {
      const inputSize = this.#recognitionModel.inputs[0].shape.slice(1, 3);
      const faceTensor = this.#getFaceTensor(inputSize);
      const predictionTensor = this.#recognitionModel.predict(faceTensor);
      const normalizedTensor = tf.tidy(() => {
        const norm = predictionTensor.norm();
        if (norm.dataSync()[0] > 1e-6) {
          return predictionTensor.div(norm);
        }
        return predictionTensor;
      });
      const descriptorArray = await normalizedTensor.data();
      tf.dispose([faceTensor, predictionTensor, normalizedTensor]);
      this.#callbacks.onSuccess(Array.from(descriptorArray));
    } catch (error) {
      console.error("Face recognition failed:", error);
      this.#failChallenge({
        code: "RECOGNITION_FAILED",
        message: error.message,
      });
    }
  }

  #getFaceTensor(inputSize) {
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(this.#videoElement);
      const [height, width] = inputSize;
      const resized = tf.image.resizeBilinear(tensor, [height, width]);
      const normalized = resized
        .toFloat()
        .div(tf.scalar(127.5))
        .sub(tf.scalar(1.0));
      return normalized.expandDims(0);
    });
  }

  #drawDebugOverlay(landmarksArray) {
    if (!this.#canvasCtx || !landmarksArray || landmarksArray.length === 0)
      return;
    const canvas = this.#canvasCtx.canvas;
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
