import { vi, describe, expect, it } from "vitest";
import * as tf from "@tensorflow/tfjs";
import { LivenessEngine } from "./LivenessEngine";

// Mock browser requestAnimationFrame globally for testing
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

let capturedOnResults = null;

vi.mock("@mediapipe/face_mesh", () => {
  return {
    FaceMesh: class {
      setOptions() {}
      onResults(cb) {
        capturedOnResults = cb;
      }
      send() {
        return Promise.resolve();
      }
    },
    FACEMESH_TESSELATION: [],
  };
});

vi.mock("./FaceRecognitionNet", () => {
  return {
    FaceRecognitionNet: class {
      load() {
        return Promise.resolve();
      }
      predict() {
        return {
          data: () => Promise.resolve(new Float32Array(128)),
          dataSync: () => new Float32Array(128),
        };
      }
      dispose() {}
    },
  };
});

describe("LivenessEngine Custom Challenges", () => {
  it("should initialize correctly and support custom challenge configurations", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks, {
      challenges: ["BLINK", "TURN_LEFT"],
    });

    await engine.load();
    expect(callbacks.onReady).toHaveBeenCalled();

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = {
      clearRect: vi.fn(),
      canvas: { width: 640, height: 480 },
    };

    engine.start(mockVideo, mockCanvasCtx);

    // Initial challenge should be the first one from our custom list
    expect(callbacks.onChallengeChanged).toHaveBeenCalledWith("BLINK");

    engine.stop();
  });

  it("should fallback to default challenges if custom list is empty or invalid", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks, {
      challenges: ["INVALID_ACTION"],
    });

    await engine.load();

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = {
      clearRect: vi.fn(),
      canvas: { width: 640, height: 480 },
    };

    engine.start(mockVideo, mockCanvasCtx);

    // Should fallback to default starting challenge (WAITING)
    expect(callbacks.onChallengeChanged).toHaveBeenCalledWith("WAITING");

    engine.stop();
  });

  it("should update challenge configurations dynamically via updateConfig", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks);
    await engine.load();

    engine.updateConfig({ challenges: ["TURN_RIGHT", "BLINK"] });

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = {
      clearRect: vi.fn(),
      canvas: { width: 640, height: 480 },
    };

    engine.start(mockVideo, mockCanvasCtx);

    expect(callbacks.onChallengeChanged).toHaveBeenCalledWith("TURN_RIGHT");
    engine.stop();
  });

  it("should start with WAITING by default and fallback when invalid challenges provided", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks);
    await engine.load();

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = {
      clearRect: vi.fn(),
      canvas: { width: 640, height: 480 },
    };

    engine.start(mockVideo, mockCanvasCtx);

    // Initial challenge should always be WAITING (center challenge)
    expect(callbacks.onChallengeChanged).toHaveBeenCalledWith("WAITING");
    engine.stop();
  });

  it("should process BLINK challenge in mobile portrait orientation (720x1280)", async () => {
    const origFromPixels = tf.browser.fromPixels;
    tf.browser.fromPixels = vi
      .fn()
      .mockReturnValue(tf.fill([150, 150, 3], 128));

    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
      onProgress: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks, {
      challenges: ["BLINK"],
      blinkEARThreshold: 0.25,
    });

    await engine.load();

    const mockVideo = {
      readyState: 4,
      play: vi.fn().mockResolvedValue(),
      videoWidth: 720,
      videoHeight: 1280,
    };
    const mockCanvasCtx = {
      clearRect: vi.fn(),
      canvas: { width: 720, height: 1280 },
    };

    engine.start(mockVideo, mockCanvasCtx);
    expect(callbacks.onChallengeChanged).toHaveBeenCalledWith("BLINK");

    const p = (x, y, z = 0) => ({ x, y, z });

    // Open eye landmarks in portrait (normalized by 720x1280): true EAR = 15/50 = 0.30
    const portOpenLandmarks = Array(500).fill(p(0, 0, 0));
    portOpenLandmarks[362] = p(100 / 720, 100 / 1280);
    portOpenLandmarks[263] = p(150 / 720, 100 / 1280);
    portOpenLandmarks[385] = p(125 / 720, 107.5 / 1280);
    portOpenLandmarks[380] = p(125 / 720, 92.5 / 1280);
    portOpenLandmarks[387] = p(125 / 720, 107.5 / 1280);
    portOpenLandmarks[373] = p(125 / 720, 92.5 / 1280);

    portOpenLandmarks[33] = p(100 / 720, 100 / 1280);
    portOpenLandmarks[133] = p(150 / 720, 100 / 1280);
    portOpenLandmarks[160] = p(125 / 720, 107.5 / 1280);
    portOpenLandmarks[144] = p(125 / 720, 92.5 / 1280);
    portOpenLandmarks[158] = p(125 / 720, 107.5 / 1280);
    portOpenLandmarks[153] = p(125 / 720, 92.5 / 1280);

    try {
      // Feed open eyes frame in portrait
      capturedOnResults({ multiFaceLandmarks: [portOpenLandmarks] });

      // Closed eye landmarks in portrait: true EAR = 2.5/50 = 0.05
      const portClosedLandmarks = Array(500).fill(p(0, 0, 0));
      portClosedLandmarks[362] = p(100 / 720, 100 / 1280);
      portClosedLandmarks[263] = p(150 / 720, 100 / 1280);
      portClosedLandmarks[385] = p(125 / 720, 101.25 / 1280);
      portClosedLandmarks[380] = p(125 / 720, 98.75 / 1280);
      portClosedLandmarks[387] = p(125 / 720, 101.25 / 1280);
      portClosedLandmarks[373] = p(125 / 720, 98.75 / 1280);

      portClosedLandmarks[33] = p(100 / 720, 100 / 1280);
      portClosedLandmarks[133] = p(150 / 720, 100 / 1280);
      portClosedLandmarks[160] = p(125 / 720, 101.25 / 1280);
      portClosedLandmarks[144] = p(125 / 720, 98.75 / 1280);
      portClosedLandmarks[158] = p(125 / 720, 101.25 / 1280);
      portClosedLandmarks[153] = p(125 / 720, 98.75 / 1280);

      // Feed closed eyes frame in portrait
      capturedOnResults({ multiFaceLandmarks: [portClosedLandmarks] });

      // After blink detected and 300ms transition delay
      await new Promise((resolve) => setTimeout(resolve, 350));
      expect(callbacks.onSuccess).toHaveBeenCalled();
    } finally {
      tf.browser.fromPixels = origFromPixels;
      engine.stop();
    }
  });
});
