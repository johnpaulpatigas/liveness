import { describe, it, expect, vi } from "vitest";
import { LivenessApiClient, computeIntegrity } from "./index.js";

describe("LivenessApiClient & Crypto", () => {
  it("should compute SHA-256 and HMAC integrity hashes correctly", async () => {
    const descriptor = Array.from({ length: 128 }, () => 0.1);
    const sessionToken = "live_sess_test_12345678";
    const timestamp = 1700000000000;
    const secret = "secret_key_123";

    const hashWithoutSecret = await computeIntegrity(
      descriptor,
      sessionToken,
      timestamp,
    );
    expect(hashWithoutSecret).toBeDefined();
    expect(typeof hashWithoutSecret).toBe("string");
    expect(hashWithoutSecret.length).toBe(64);

    const hashWithSecret = await computeIntegrity(
      descriptor,
      sessionToken,
      timestamp,
      secret,
    );
    expect(hashWithSecret).toBeDefined();
    expect(typeof hashWithSecret).toBe("string");
    expect(hashWithSecret.length).toBe(64);
    expect(hashWithSecret).not.toEqual(hashWithoutSecret);
  });

  it("should send API key and format requests properly", async () => {
    const mockResponse = {
      sessionToken: "live_sess_abc",
      sessionSecret: "sec_123",
      challenges: ["WAITING", "BLINK", "WAITING"],
      expiresAt: Date.now() + 300000,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => "application/json" },
      json: async () => mockResponse,
    });

    const client = new LivenessApiClient({
      baseUrl: "https://api.liveness.cloud/api",
      apiKey: "live_pk_test1234567890",
      fetch: mockFetch,
    });

    const session = await client.liveness.createSession({
      challenges: ["WAITING", "BLINK", "WAITING"],
    });

    expect(session).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledConfig] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("https://api.liveness.cloud/api/liveness/session");
    expect(calledConfig.method).toBe("POST");
    expect(calledConfig.headers["x-api-key"]).toBe("live_pk_test1234567890");
    expect(JSON.parse(calledConfig.body)).toEqual({
      challenges: ["WAITING", "BLINK", "WAITING"],
    });
  });

  it("should auto-compute integrity hash on verify", async () => {
    const mockVerifyResponse = {
      verified: true,
      match: {
        id: "user_123",
        name: "Alice",
        similarity: 0.98,
        distance: 0.05,
      },
      status: "SUCCESS",
      metric: "both",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => mockVerifyResponse,
    });

    const client = new LivenessApiClient({
      apiKey: "live_pk_test1234567890",
      fetch: mockFetch,
    });

    const descriptor = Array.from({ length: 128 }, () => 0.05);
    const result = await client.liveness.verify({
      descriptor,
      sessionToken: "live_sess_test123",
      sessionSecret: "sec_secret_456",
      challenges: ["WAITING", "BLINK", "WAITING"],
    });

    expect(result.verified).toBe(true);
    expect(result.match.name).toBe("Alice");

    const [, calledConfig] = mockFetch.mock.calls[0];
    const body = JSON.parse(calledConfig.body);
    expect(body.integrity).toBeDefined();
    expect(typeof body.integrity).toBe("string");
    expect(body.integrity.length).toBe(64);
  });

  it("should validate biometric payload shape strictly", async () => {
    const client = new LivenessApiClient({ apiKey: "key_123" });

    await expect(client.liveness.verify(null)).rejects.toThrow("Biometric payload must be an object");
    await expect(
      client.liveness.verify({ descriptor: [1, 2, 3], sessionToken: "token", challenges: ["WAITING"] }),
    ).rejects.toThrow("Biometric descriptor must be a 128-dimensional array");
    await expect(
      client.liveness.verify({ descriptor: Array.from({ length: 128 }, () => 0.1), sessionToken: "", challenges: ["WAITING"] }),
    ).rejects.toThrow("Session token is required");
    await expect(
      client.liveness.verify({ descriptor: Array.from({ length: 128 }, () => 0.1), sessionToken: "tok", challenges: [] }),
    ).rejects.toThrow("Challenges array is required");
  });

  it("should handle request timeout and network failures gracefully", async () => {
    const mockSlowFetch = vi.fn().mockImplementation(() => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    const client = new LivenessApiClient({
      apiKey: "key_123",
      timeout: 50,
      fetch: mockSlowFetch,
    });

    await expect(client.health()).rejects.toThrow("Request timed out");
  });
});
