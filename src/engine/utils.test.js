// src/engine/utils.test.js
import { describe, expect, it } from "vitest";
import {
  calculateCosineSimilarity,
  calculateEAR,
  calculateHeadTurnV2,
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
});
