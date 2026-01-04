// src/sdk/LivenessSDK.js
import { LivenessEngine } from "../engine/LivenessEngine";

export class LivenessSDK {
  constructor(config = {}) {
    this.config = config;
    this.engine = null;
    this.listeners = {
      ready: [],
      challenge: [],
      progress: [],
      success: [],
      failure: [],
      error: [],
    };

    this.instructions = {
      BLINK: "Please blink both eyes.",
      TURN_LEFT: "Slowly turn your head to your left.",
      TURN_RIGHT: "Slowly turn your head to your right.",
      PROCESSING: "Processing...",
    };
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return this;
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
    }
    return this;
  }

  _emit(event, payload) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in LivenessSDK listener for '${event}':`, e);
        }
      });
    }
  }

  async load() {
    return new Promise((resolve, reject) => {
      try {
        const callbacks = {
          onReady: () => {
            this._emit("ready");
            resolve();
          },
          onChallengeChanged: (challengeType) => {
            const instruction = this.instructions[challengeType] || "";
            this._emit("challenge", { type: challengeType, instruction });
          },
          onSuccess: (descriptor) => {
            this._emit("success", { descriptor });
          },
          onFailure: (error) => {
            this._emit("failure", error);
          },
          onProgress: (progress, rawValue) => {
            this._emit("progress", { progress, rawValue });
          },
        };

        this.engine = new LivenessEngine(callbacks, this.config);
        this.engine.load().catch((err) => {
          this._emit("error", err);
          reject(err);
        });
      } catch (error) {
        this._emit("error", error);
        reject(error);
      }
    });
  }

  async start(videoElement, canvasElement) {
    if (!this.engine) {
      throw new Error("SDK not loaded. Call load() first.");
    }

    try {
      if (!videoElement.srcObject) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        videoElement.srcObject = stream;

        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve();
          };
        });
      }

      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      const ctx = canvasElement.getContext("2d");

      this.engine.start(videoElement, ctx);
    } catch (error) {
      this._emit("error", error);
      if (error.name === "NotAllowedError" || error.name === "NotFoundError") {
        this._emit("failure", {
          code: "CAMERA_ACCESS_DENIED",
          message: "Could not access camera. Please check permissions.",
        });
      }
    }
  }

  stop(videoElement) {
    if (this.engine) {
      this.engine.stop();
    }
    if (videoElement && videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }
}
