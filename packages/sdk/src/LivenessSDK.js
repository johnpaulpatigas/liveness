import { LivenessEngine } from "@liveness/engine";

export class LivenessSDK {
  #visibilityHandler = null;
  #activeTracks = [];

  static async getAvailableCameras() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "videoinput");
    } catch {
      return [];
    }
  }

  #initListeners() {
    return {
      ready: [],
      challenge: [],
      progress: [],
      success: [],
      failure: [],
      error: [],
    };
  }

  constructor(config = {}) {
    this.config = config;
    this.engine = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.#visibilityHandler = null;
    this.#activeTracks = [];
    this.listeners = this.#initListeners();

    this.instructions = {
      WAITING: "Please position your face in the center of the frame.",
      BLINK: "Please blink both eyes.",
      TURN_LEFT: "Slowly turn your head to your left.",
      TURN_RIGHT: "Slowly turn your head to your right.",
      PROCESSING: "Processing...",
      ...config.instructions,
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
    if (typeof WebAssembly !== "object") {
      const errorPayload = {
        code: "WASM_NOT_SUPPORTED",
        message:
          "WebAssembly is not supported in this browser. Liveness detection requires WASM.",
      };
      this._emit("error", errorPayload);
      return Promise.reject(errorPayload);
    }

    if (!window.WebGLRenderingContext) {
      const errorPayload = {
        code: "WEBGL_NOT_SUPPORTED",
        message: "WebGL is not supported. Please enable hardware acceleration.",
      };
      this._emit("error", errorPayload);
      return Promise.reject(errorPayload);
    }

    return new Promise((resolve, reject) => {
      try {
        const callbacks = {
          onReady: () => {
            this._emit("ready");
            resolve();
          },
          onChallengeChanged: (challengeType, distance) => {
            const instruction = this.instructions[challengeType] || "";
            this._emit("challenge", {
              type: challengeType,
              instruction,
              distance,
            });
          },
          onSuccess: (result) => {
            this._emit("success", result);
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
          const errorPayload = {
            code: "MODEL_LOAD_FAILED",
            message: `Failed to load AI models: ${err.message}`,
          };
          this._emit("error", errorPayload);
          reject(errorPayload);
        });
      } catch (error) {
        const errorPayload = {
          code: "INITIALIZATION_FAILED",
          message: error.message,
        };
        this._emit("error", errorPayload);
        reject(errorPayload);
      }
    });
  }

  updateConfig(newConfig = {}) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.instructions) {
      this.instructions = { ...this.instructions, ...newConfig.instructions };
    }
    if (this.engine) {
      this.engine.updateConfig(newConfig);
    }
    return this;
  }

  async start(videoElement, canvasElement, options = {}) {
    if (!this.engine) {
      throw new Error("SDK not loaded. Call load() first.");
    }

    if (
      options &&
      typeof options === "object" &&
      Object.keys(options).length > 0
    ) {
      this.updateConfig(options);
    } else if (this.engine) {
      this.engine.updateConfig(this.config);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this._emit("failure", {
        code: "BROWSER_NOT_SUPPORTED",
        message:
          "Your browser does not support camera access or the secure context (HTTPS) requirements.",
      });
      return;
    }

    try {
      if (videoElement) {
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true;
      }

      if (!videoElement.srcObject) {
        const isPortrait =
          typeof window !== "undefined" &&
          (window.matchMedia?.("(orientation: portrait)")?.matches ||
            window.innerHeight > window.innerWidth);

        const idealWidth = isPortrait ? 720 : 1280;
        const idealHeight = isPortrait ? 1280 : 720;
        const videoConstraints = {
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
          aspectRatio: { ideal: idealWidth / idealHeight },
        };

        if (this.config.deviceId) {
          videoConstraints.deviceId = { exact: this.config.deviceId };
        } else {
          videoConstraints.facingMode = "user";
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
        videoElement.srcObject = stream;

        if (videoElement.readyState >= 1 && videoElement.videoWidth > 0) {
          if (videoElement.paused) {
            await videoElement.play();
          }
        } else {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Camera stream timed out."));
            }, 10000);

            videoElement.onloadedmetadata = () => {
              clearTimeout(timeout);
              videoElement.play().then(resolve).catch(reject);
            };
          });
        }
      } else if (videoElement.paused) {
        await videoElement.play();
      }

      // Track hardware disconnections on active tracks
      if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getVideoTracks?.() || [];
        this.#activeTracks = tracks;
        tracks.forEach((track) => {
          track.onended = () => {
            const errorPayload = {
              code: "CAMERA_DISCONNECTED",
              message:
                "Camera hardware track was disconnected or ended unexpectedly.",
            };
            this._emit("error", errorPayload);
            this._emit("failure", errorPayload);
          };
        });
      }

      // Handle background tab visibility change
      if (typeof document !== "undefined" && !this.#visibilityHandler) {
        this.#visibilityHandler = () => {
          if (document.hidden) {
            this.engine?.stop();
          } else if (this.videoElement && !this.videoElement.paused) {
            const ctx = canvasElement.getContext("2d");
            this.engine?.start(this.videoElement, ctx);
          }
        };
        document.addEventListener("visibilitychange", this.#visibilityHandler);
      }

      canvasElement.width = videoElement.videoWidth || 1280;
      canvasElement.height = videoElement.videoHeight || 720;
      const ctx = canvasElement.getContext("2d");

      this.videoElement = videoElement;
      this.canvasElement = canvasElement;
      this.engine.start(videoElement, ctx);
    } catch (error) {
      let errorPayload = {
        code: "CAMERA_ERROR",
        message: error.message,
      };

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorPayload = {
          code: "CAMERA_ACCESS_DENIED",
          message:
            "Camera access was denied by the user. Please update browser permissions.",
        };
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorPayload = {
          code: "CAMERA_NOT_FOUND",
          message: "No camera device was found on this system.",
        };
      }

      this._emit("error", errorPayload);
      this._emit("failure", errorPayload);
    }
  }

  stop(videoElement) {
    if (this.engine) {
      this.engine.stop();
    }
    if (typeof document !== "undefined" && this.#visibilityHandler) {
      document.removeEventListener("visibilitychange", this.#visibilityHandler);
      this.#visibilityHandler = null;
    }
    const targetVideo = videoElement || this.videoElement;
    if (targetVideo && targetVideo.srcObject) {
      targetVideo.srcObject.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      targetVideo.srcObject = null;
    }
    this.#activeTracks = [];
    if (targetVideo === this.videoElement) {
      this.videoElement = null;
    }
    this.canvasElement = null;
  }

  destroy(videoElement) {
    this.stop(videoElement);
    if (this.engine && typeof this.engine.dispose === "function") {
      this.engine.dispose();
      this.engine = null;
    }
    this.listeners = this.#initListeners();
  }
}
