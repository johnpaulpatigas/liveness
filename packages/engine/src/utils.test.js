import * as tf from "@tensorflow/tfjs";
import { describe, expect, it } from "vitest";
import {
  calculateBrightness,
  calculateCosineSimilarity,
  calculateEAR,
  calculateEuclideanDistance,
  calculateFaceSize,
  calculateHeadTurnV2,
  checkOcclusion,
  generateIntegrityHash,
} from "./utils";

const p = (x, y, z = 0) => ({ x, y, z });

describe("Liveness Algorithms", () => {
  describe("calculateEAR (Eye Aspect Ratio)", () => {
    it("should return 0 if horizontal distance is 0", () => {
      const landmarks = Array(500).fill(p(0, 0, 0));
      const ear = calculateEAR(landmarks, "left");
      expect(ear).toBe(0);
    });

    it("should calculate correct ratio for a simple open eye", () => {
      const landmarks = Array(500).fill(p(0, 0, 0));
      landmarks[362] = p(0, 0);
      landmarks[263] = p(10, 0);
      landmarks[385] = p(5, 5);
      landmarks[380] = p(5, -5);
      landmarks[387] = p(5, 5);
      landmarks[373] = p(5, -5);

      const ear = calculateEAR(landmarks, "left");
      expect(ear).toBeCloseTo(1.0);
    });

    it("should calculate low ratio for closed eye", () => {
      const landmarks = Array(500).fill(p(0, 0, 0));
      landmarks[362] = p(0, 0);
      landmarks[263] = p(10, 0);
      landmarks[385] = p(5, 0.5);
      landmarks[380] = p(5, -0.5);
      landmarks[387] = p(5, 0.5);
      landmarks[373] = p(5, -0.5);

      const ear = calculateEAR(landmarks, "left");
      expect(ear).toBeCloseTo(0.1);
    });

    it("should calculate identical EAR for the same eye in landscape (1280x720) and mobile portrait (720x1280)", () => {
      // Simulate real open eye of 50px width and 15px height (true EAR = 0.30)
      const landLandmarks = Array(500).fill(p(0, 0, 0));
      landLandmarks[362] = p(100 / 1280, 100 / 720);
      landLandmarks[263] = p(150 / 1280, 100 / 720);
      landLandmarks[385] = p(125 / 1280, 107.5 / 720);
      landLandmarks[380] = p(125 / 1280, 92.5 / 720);
      landLandmarks[387] = p(125 / 1280, 107.5 / 720);
      landLandmarks[373] = p(125 / 1280, 92.5 / 720);

      const portLandmarks = Array(500).fill(p(0, 0, 0));
      portLandmarks[362] = p(100 / 720, 100 / 1280);
      portLandmarks[263] = p(150 / 720, 100 / 1280);
      portLandmarks[385] = p(125 / 720, 107.5 / 1280);
      portLandmarks[380] = p(125 / 720, 92.5 / 1280);
      portLandmarks[387] = p(125 / 720, 107.5 / 1280);
      portLandmarks[373] = p(125 / 720, 92.5 / 1280);

      const landscapeEAR = calculateEAR(landLandmarks, "left", 1280, 720);
      const portraitEAR = calculateEAR(portLandmarks, "left", 720, 1280);

      expect(landscapeEAR).toBeCloseTo(0.3);
      expect(portraitEAR).toBeCloseTo(0.3);
      expect(portraitEAR).toBeCloseTo(landscapeEAR);
    });

    it("should accept aspect ratio as single argument or as width and height", () => {
      const landmarks = Array(500).fill(p(0, 0, 0));
      landmarks[362] = p(100 / 720, 100 / 1280);
      landmarks[263] = p(150 / 720, 100 / 1280);
      landmarks[385] = p(125 / 720, 107.5 / 1280);
      landmarks[380] = p(125 / 720, 92.5 / 1280);
      landmarks[387] = p(125 / 720, 107.5 / 1280);
      landmarks[373] = p(125 / 720, 92.5 / 1280);

      const earWithDimensions = calculateEAR(landmarks, "left", 720, 1280);
      const earWithRatio = calculateEAR(landmarks, "left", 720 / 1280);

      expect(earWithDimensions).toBeCloseTo(0.3);
      expect(earWithRatio).toBeCloseTo(0.3);
      expect(earWithDimensions).toBeCloseTo(earWithRatio);
    });
  });

  describe("calculateCosineSimilarity", () => {
    it("should return 1.0 for identical vectors", () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      expect(calculateCosineSimilarity(vecA, vecB)).toBe(1);
    });

    it("should return 0 for orthogonal vectors", () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      expect(calculateCosineSimilarity(vecA, vecB)).toBe(0);
    });

    it("should return -1.0 for opposite vectors", () => {
      const vecA = [1, 0, 0];
      const vecB = [-1, 0, 0];
      expect(calculateCosineSimilarity(vecA, vecB)).toBe(-1);
    });

    it("should handle complex vectors", () => {
      const vecA = [0.5, 0.5, 0.5, 0.5];
      const vecB = [0.5, 0.5, 0.5, 0.5];
      expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(1);
    });
  });

  describe("calculateEuclideanDistance", () => {
    it("should return 0 for identical vectors", () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2, 3];
      expect(calculateEuclideanDistance(vecA, vecB)).toBe(0);
    });

    it("should calculate correct euclidean distance for known vectors", () => {
      const vecA = [0, 0];
      const vecB = [3, 4];
      expect(calculateEuclideanDistance(vecA, vecB)).toBe(5);
    });

    it("should return Infinity for mismatched vector lengths or null", () => {
      expect(calculateEuclideanDistance([1, 2], [1])).toBe(Infinity);
      expect(calculateEuclideanDistance(null, [1])).toBe(Infinity);
    });
  });

  describe("calculateHeadTurnV2", () => {
    it("should return 0 for neutral pose (equal depth)", () => {
      const landmarks = Array(500).fill(p(0, 0, 0));
      landmarks[152] = p(5, 10, 0);
      landmarks[234] = p(0, 5, -1);
      landmarks[454] = p(10, 5, -1);

      const ratio = calculateHeadTurnV2(landmarks);
      expect(ratio).toBe(0);
    });

    it("should return positive for Left Turn (Right cheek moves away)", () => {
      const landmarks = Array(500).fill(p(0, 0, 0));
      landmarks[152] = p(5, 10, 0);

      landmarks[234] = p(0, 5, 0);
      landmarks[454] = p(10, 5, -5);

      landmarks[234] = p(0, 5, -5);
      landmarks[454] = p(10, 5, 0);

      const ratio = calculateHeadTurnV2(landmarks);
      expect(ratio).toBeGreaterThan(0);
    });
  });

  describe("calculateBrightness", () => {
    it("should calculate the mean brightness of a tensor", () => {
      const img = tf.tensor4d([-0.9, -0.85, -0.8, -0.75], [1, 2, 2, 1]);
      const brightness = calculateBrightness(img);
      expect(brightness).toBeCloseTo(-0.825);
      img.dispose();
    });
  });

  describe("checkOcclusion", () => {
    it("should return true if landmarks are missing", () => {
      expect(checkOcclusion([])).toBe(true);
      expect(checkOcclusion(Array(100).fill(p(0, 0)))).toBe(true);
    });

    it("should return false for fully visible face landmarks", () => {
      const landmarks = Array(468).fill(p(0, 0, 0));
      landmarks[362] = p(0, 0);
      landmarks[263] = p(1, 0);
      landmarks[33] = p(5, 0);
      landmarks[133] = p(6, 0);

      expect(checkOcclusion(landmarks)).toBe(false);
    });

    it("should return true if eyes are too close/collapsed (occlusion)", () => {
      const landmarks = Array(468).fill(p(0, 0, 0));
      landmarks[362] = p(0, 0);
      landmarks[263] = p(0.005, 0);
      landmarks[33] = p(5, 0);
      landmarks[133] = p(6, 0);

      expect(checkOcclusion(landmarks)).toBe(true);
    });
  });

  describe("calculateFaceSize", () => {
    it("should return 0 if no landmarks", () => {
      expect(calculateFaceSize([])).toBe(0);
    });

    it("should return height of the face", () => {
      const landmarks = [
        p(0.25, 0.25),
        p(0.75, 0.25),
        p(0.25, 0.75),
        p(0.75, 0.75),
      ];
      expect(calculateFaceSize(landmarks)).toBeCloseTo(0.5);
    });

    it("should return height even for large coordinates", () => {
      const landmarks = [p(100, 100), p(300, 100), p(100, 400), p(300, 400)];
      expect(calculateFaceSize(landmarks)).toBe(300);
    });
  });

  describe("FaceRecognitionNet 128D Embeddings & Separation", () => {
    it("should evaluate embedding separation on FaceRecognitionNet", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const { FaceRecognitionNet } = await import("./FaceRecognitionNet");

      const net = new FaceRecognitionNet();

      const manifestPath = path.resolve(
        __dirname,
        "../assets/face_recognition/face_recognition_model-weights_manifest.json",
      );
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const shard1 = fs.readFileSync(
        path.resolve(
          __dirname,
          "../assets/face_recognition/face_recognition_model-shard1",
        ),
      );
      const shard2 = fs.readFileSync(
        path.resolve(
          __dirname,
          "../assets/face_recognition/face_recognition_model-shard2",
        ),
      );

      const weightBuffer = new Uint8Array(shard1.length + shard2.length);
      weightBuffer.set(shard1, 0);
      weightBuffer.set(shard2, shard1.length);

      const weightMap = tf.io.decodeWeights(
        weightBuffer.buffer,
        manifest[0].weights,
      );
      net.loadWithWeightMap(weightMap);

      // Input range [0, 255] RGB for 150x150
      const inputA = tf.randomUniform([1, 150, 150, 3], 0, 255);
      const inputB = tf.randomUniform([1, 150, 150, 3], 0, 255);
      const inputA_noisy = inputA.add(
        tf.randomNormal([1, 150, 150, 3], 0, 5.0),
      );
      const inputBlank = tf.zeros([1, 150, 150, 3]);

      const outA = net.predict(inputA);
      const outB = net.predict(inputB);
      const outA_noisy = net.predict(inputA_noisy);
      const outBlank = net.predict(inputBlank);

      const vecA = Array.from(await outA.data());
      const vecB = Array.from(await outB.data());
      const vecA_noisy = Array.from(await outA_noisy.data());
      const vecBlank = Array.from(await outBlank.data());

      function euclidean(a, b) {
        return Math.sqrt(
          a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0),
        );
      }

      console.log("--- 128D FaceRecognitionNet EVALUATION ---");
      console.log("Vector Dimension:", vecA.length);
      console.log(
        "Same Face + Noise -> Cosine Sim:",
        calculateCosineSimilarity(vecA, vecA_noisy),
        "| Euclidean:",
        euclidean(vecA, vecA_noisy),
      );
      console.log(
        "Different Input A vs B -> Cosine Sim:",
        calculateCosineSimilarity(vecA, vecB),
        "| Euclidean:",
        euclidean(vecA, vecB),
      );
      console.log(
        "Face A vs Covered/Blank Face -> Cosine Sim:",
        calculateCosineSimilarity(vecA, vecBlank),
        "| Euclidean:",
        euclidean(vecA, vecBlank),
      );

      expect(vecA.length).toBe(128);
      const simSame = calculateCosineSimilarity(vecA, vecA_noisy);
      const simDiff = calculateCosineSimilarity(vecA, vecB);
      const simBlank = calculateCosineSimilarity(vecA, vecBlank);

      expect(simSame).toBeGreaterThan(0.95);
      expect(simDiff).toBeLessThan(0.999);
      expect(simBlank).toBeLessThan(0.95);

      tf.dispose([
        inputA,
        inputB,
        inputA_noisy,
        inputBlank,
        outA,
        outB,
        outA_noisy,
        outBlank,
      ]);
    }, 30000);
  });

  describe("generateIntegrityHash", () => {
    it("should produce a deterministic non-empty hash string", () => {
      const descriptor = Array(128).fill(0.123);
      const sessionToken = "live_sess_test_token_123456";
      const timestamp = 1716336000000;

      const hash1 = generateIntegrityHash(descriptor, sessionToken, timestamp);
      const hash2 = generateIntegrityHash(descriptor, sessionToken, timestamp);

      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBeGreaterThan(0);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes if descriptor or token changes", () => {
      const descriptorA = Array(128).fill(0.1);
      const descriptorB = Array(128).fill(0.2);
      const sessionToken = "live_sess_test_token_123456";
      const timestamp = 1716336000000;

      const hashA = generateIntegrityHash(descriptorA, sessionToken, timestamp);
      const hashB = generateIntegrityHash(descriptorB, sessionToken, timestamp);
      const hashDiffToken = generateIntegrityHash(
        descriptorA,
        "live_sess_different_token",
        timestamp,
      );

      expect(hashA).not.toBe(hashB);
      expect(hashA).not.toBe(hashDiffToken);
    });
  });
});
