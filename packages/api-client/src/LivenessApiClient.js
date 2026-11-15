import { computeIntegrity } from "./crypto.js";
import { LivenessApiError } from "./errors.js";

/**
 * LivenessApiClient
 * Official JavaScript SDK for interacting with Liveness Cloud SaaS API.
 */
export class LivenessApiClient {
  /**
   * @param {Object} options
   * @param {string} [options.baseUrl] - Base URL of the API (e.g. 'https://api.liveness.cloud/api' or 'http://localhost:3000/api')
   * @param {string} [options.apiKey] - API key provided via 'x-api-key' header for server-to-server endpoints
   * @param {string} [options.token] - Bearer JWT token for admin/dashboard endpoints
   * @param {number} [options.timeout] - Request timeout in milliseconds (default: 30000ms, set to 0 to disable)
   * @param {Object} [options.headers] - Additional custom HTTP headers
   * @param {Function} [options.fetch] - Custom fetch implementation (defaults to globalThis.fetch)
   */
  constructor(options = {}) {
    this.baseUrl = (
      options.baseUrl || "https://api.liveness.cloud/api"
    ).replace(/\/+$/, "");
    this.apiKey = options.apiKey || null;
    this.token = options.token || null;
    this.timeout = typeof options.timeout === "number" ? options.timeout : 30000;
    this.customHeaders = options.headers || {};
    this.fetch = options.fetch || globalThis.fetch?.bind(globalThis);

    if (!this.fetch) {
      throw new Error(
        "No fetch implementation found. Pass a custom fetch function to options.fetch or ensure globalThis.fetch exists.",
      );
    }

    // Sub-resources
    this.liveness = {
      /**
       * Create a server-orchestrated verification session
       * @param {Object} [params]
       * @param {Array<"WAITING" | "BLINK" | "TURN_LEFT" | "TURN_RIGHT">} [params.challenges]
       * @returns {Promise<{ sessionToken: string, sessionSecret: string, challenges: string[], expiresAt: number }>}
       */
      createSession: (params = {}) => {
        return this.request("/liveness/session", {
          method: "POST",
          body: params,
          requiresApiKey: true,
        });
      },

      /**
       * Enroll a new user biometric identity with a 128D descriptor vector
       * @param {Object} payload
       * @param {string} payload.name - Name of the user to enroll
       * @param {number[]} payload.descriptor - 128-dimensional numerical vector
       * @param {string} payload.sessionToken - Server verification session token
       * @param {number} [payload.timestamp] - Millisecond timestamp (defaults to Date.now())
       * @param {string[]} payload.challenges - Challenge list performed
       * @param {string} [payload.integrity] - HMAC or SHA-256 hash (automatically generated if omitted and sessionSecret is provided)
       * @param {string} [payload.sessionSecret] - Session secret used to compute integrity HMAC
       */
      enroll: async (payload) => {
        const body = await this._prepareBiometricPayload(payload, {
          name: payload.name,
        });
        return this.request("/liveness/enroll", {
          method: "POST",
          body,
          requiresApiKey: true,
        });
      },

      /**
       * Verify an unknown user against all enrolled identities (1:N verification)
       * @param {Object} payload
       * @param {number[]} payload.descriptor - 128-dimensional numerical vector
       * @param {string} payload.sessionToken - Server verification session token
       * @param {number} [payload.timestamp] - Millisecond timestamp (defaults to Date.now())
       * @param {string[]} payload.challenges - Challenge list performed
       * @param {"cosine" | "euclidean"} [payload.metric] - Biometric distance metric (defaults to both)
       * @param {string} [payload.integrity] - Integrity hash
       * @param {string} [payload.sessionSecret] - Session secret to compute HMAC
       */
      verify: async (payload) => {
        const extra = payload?.metric ? { metric: payload.metric } : {};
        const body = await this._prepareBiometricPayload(payload, extra);
        return this.request("/liveness/verify", {
          method: "POST",
          body,
          requiresApiKey: true,
        });
      },

      /**
       * Verify user against a specific enrolled target ID (1:1 verification)
       * @param {Object} payload
       * @param {string} payload.targetId - UUID of the enrolled target user
       * @param {number[]} payload.descriptor - 128-dimensional numerical vector
       * @param {string} payload.sessionToken - Server verification session token
       * @param {number} [payload.timestamp] - Millisecond timestamp (defaults to Date.now())
       * @param {string[]} payload.challenges - Challenge list performed
       * @param {"cosine" | "euclidean"} [payload.metric] - Biometric distance metric
       * @param {string} [payload.integrity] - Integrity hash
       * @param {string} [payload.sessionSecret] - Session secret to compute HMAC
       */
      verifyOne: async (payload) => {
        if (!payload || !payload.targetId) {
          throw new LivenessApiError("Target ID (targetId) is required for 1:1 verification", 400);
        }
        const extra = {
          targetId: payload.targetId,
          ...(payload.metric ? { metric: payload.metric } : {}),
        };
        const body = await this._prepareBiometricPayload(payload, extra);
        return this.request("/liveness/verify-one", {
          method: "POST",
          body,
          requiresApiKey: true,
        });
      },
    };

    this.apiKeys = {
      list: () => this.request("/dashboard/api-keys", { requiresAuth: true }),
      create: (name) =>
        this.request("/dashboard/api-keys", {
          method: "POST",
          body: { name },
          requiresAuth: true,
        }),
      revoke: (id) =>
        this.request(`/dashboard/api-keys/${id}/revoke`, {
          method: "PATCH",
          requiresAuth: true,
        }),
      delete: (id) =>
        this.request(`/dashboard/api-keys/${id}`, {
          method: "DELETE",
          requiresAuth: true,
        }),
    };

    this.users = {
      list: () => this.request("/dashboard/users", { requiresAuth: true }),
      delete: (id) =>
        this.request(`/dashboard/users/${id}`, {
          method: "DELETE",
          requiresAuth: true,
        }),
    };

    this.logs = {
      list: (limit) =>
        this.request(
          `/dashboard/logs${limit ? `?limit=${encodeURIComponent(limit)}` : ""}`,
          {
            requiresAuth: true,
          },
        ),
    };

    this.stats = {
      getOverview: (days = 7) =>
        this.request(`/dashboard/stats?days=${encodeURIComponent(days)}`, {
          requiresAuth: true,
        }),
    };
  }

  /**
   * Set or update API Key
   * @param {string} apiKey
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Set or update Bearer Auth Token
   * @param {string} token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Check system health
   */
  async health() {
    return this.request("/health");
  }

  /**
   * Internal helper to normalize and auto-compute integrity hash if missing
   * @private
   */
  async _prepareBiometricPayload(payload, extra = {}) {
    if (!payload || typeof payload !== "object") {
      throw new LivenessApiError("Biometric payload must be an object", 400);
    }
    if (!Array.isArray(payload.descriptor) || payload.descriptor.length !== 128) {
      throw new LivenessApiError("Biometric descriptor must be a 128-dimensional array", 400);
    }
    if (!payload.sessionToken || typeof payload.sessionToken !== "string") {
      throw new LivenessApiError("Session token is required", 400);
    }
    if (!Array.isArray(payload.challenges) || payload.challenges.length === 0) {
      throw new LivenessApiError("Challenges array is required", 400);
    }

    const timestamp = payload.timestamp || Date.now();
    let integrity = payload.integrity;

    if (!integrity) {
      integrity = await computeIntegrity(
        payload.descriptor,
        payload.sessionToken,
        timestamp,
        payload.sessionSecret || null,
      );
    }

    return {
      descriptor: payload.descriptor,
      sessionToken: payload.sessionToken,
      timestamp,
      challenges: payload.challenges,
      integrity,
      ...extra,
    };
  }

  /**
   * Generic request wrapper
   */
  async request(endpoint, options = {}) {
    const {
      method = "GET",
      body,
      headers = {},
      requiresApiKey,
      requiresAuth,
      timeout,
    } = options;

    let path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Health endpoint is mounted at /health or /api/health
    let fullUrl;
    if (path === "/health" || path === "/api/health") {
      const rootUrl = this.baseUrl.endsWith("/api")
        ? this.baseUrl.slice(0, -4)
        : this.baseUrl;
      fullUrl = `${rootUrl}/health`;
    } else {
      fullUrl = `${this.baseUrl}${path}`;
    }

    const requestHeaders = {
      "Content-Type": "application/json",
      ...this.customHeaders,
      ...headers,
    };

    if (this.apiKey) {
      requestHeaders["x-api-key"] = this.apiKey;
    } else if (requiresApiKey) {
      console.warn(
        "[LivenessApiClient] Warning: Endpoint requires an API key, but none is set.",
      );
    }

    if (this.token) {
      requestHeaders["Authorization"] = `Bearer ${this.token}`;
    } else if (requiresAuth && !this.apiKey) {
      console.warn(
        "[LivenessApiClient] Warning: Endpoint requires authentication, but no token is set.",
      );
    }

    const requestTimeout = typeof timeout === "number" ? timeout : this.timeout;
    let signal = options.signal;
    let timerId = null;

    if (!signal && requestTimeout > 0 && typeof AbortController !== "undefined") {
      const controller = new AbortController();
      signal = controller.signal;
      timerId = setTimeout(() => {
        controller.abort(new Error(`Request timed out after ${requestTimeout}ms`));
      }, requestTimeout);
    }

    const reqConfig = {
      method,
      headers: requestHeaders,
    };

    if (signal) {
      reqConfig.signal = signal;
    }

    if (body !== undefined && method !== "GET" && method !== "HEAD") {
      reqConfig.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    let response;
    try {
      response = await this.fetch(fullUrl, reqConfig);
    } catch (networkErr) {
      if (timerId) clearTimeout(timerId);
      if (networkErr.name === "AbortError") {
        throw new LivenessApiError(`Request timed out after ${requestTimeout}ms`, 408);
      }
      throw new LivenessApiError(networkErr.message || "Network request failed", 0, networkErr);
    } finally {
      if (timerId) clearTimeout(timerId);
    }

    if (response.status === 204) {
      return null;
    }

    let responseData = null;
    const contentType = response.headers?.get?.("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      try {
        responseData = await response.text();
      } catch {
        responseData = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        responseData && typeof responseData === "object" && responseData.error
          ? responseData.error
          : responseData && typeof responseData === "string"
            ? responseData
            : `API request failed with status ${response.status}`;
      throw new LivenessApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  }
}
