const defaultApiUrl =
  typeof window !== "undefined" &&
  (window.location.hostname === "liveness.cloud" ||
    window.location.hostname === "www.liveness.cloud")
    ? "https://api.liveness.cloud/api"
    : "http://localhost:3000/api";

const rawApiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

let inMemoryUser = null;
let isInitialized = false;
let initPromise = null;

// Clean up any legacy tokens from localStorage to prevent persistence
try {
  localStorage.removeItem("liveness_token");
  localStorage.removeItem("liveness_admin");
} catch {
  // Ignore environments without localStorage access
}

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    if (response.status === 204) return null;
    let errorMessage = "Request failed";
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // response wasn't JSON
    }

    // Auto-handle expired or unauthorized session (except endpoints where 401 indicates invalid credentials or inputs)
    if (
      (response.status === 401 || response.status === 403) &&
      !endpoint.includes("/login") &&
      !endpoint.includes("/signup") &&
      !endpoint.includes("/me") &&
      !endpoint.includes("/change-password")
    ) {
      inMemoryUser = null;
      window.dispatchEvent(
        new CustomEvent("auth:expired", { detail: { message: errorMessage } }),
      );
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  auth: {
    init: async () => {
      if (isInitialized) return inMemoryUser;
      if (initPromise) return initPromise;
      initPromise = (async () => {
        try {
          const user = await request("/dashboard/me");
          inMemoryUser = user || null;
        } catch {
          inMemoryUser = null;
        } finally {
          isInitialized = true;
          initPromise = null;
        }
        return inMemoryUser;
      })();
      return initPromise;
    },
    isInitialized: () => isInitialized,
    getCurrentUser: () => inMemoryUser,
    signup: async (username, password, firstName, lastName, email) => {
      const result = await request("/dashboard/signup", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          email,
        }),
      });
      const { token: _token, ...admin } = result || {};
      inMemoryUser = admin;
      isInitialized = true;
      window.dispatchEvent(new CustomEvent("auth:login", { detail: admin }));
      return admin;
    },
    login: async (usernameOrEmail, password) => {
      const cleanIdentifier =
        typeof usernameOrEmail === "string" && usernameOrEmail.includes("@")
          ? usernameOrEmail.trim().toLowerCase()
          : typeof usernameOrEmail === "string"
            ? usernameOrEmail.trim()
            : usernameOrEmail;

      const result = await request("/dashboard/login", {
        method: "POST",
        body: JSON.stringify({ username: cleanIdentifier, password }),
      });
      const { token: _token, ...admin } = result || {};
      inMemoryUser = admin;
      isInitialized = true;
      window.dispatchEvent(new CustomEvent("auth:login", { detail: admin }));
      return admin;
    },
    logout: async () => {
      try {
        await request("/dashboard/logout", { method: "POST" });
      } catch (err) {
        console.warn("Logout request failed:", err);
      } finally {
        inMemoryUser = null;
        isInitialized = true;
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    },
    me: async () => {
      const user = await request("/dashboard/me");
      inMemoryUser = user || null;
      isInitialized = true;
      return inMemoryUser;
    },
    verifyOtp: async (otp) => {
      const updatedUser = await request("/dashboard/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      inMemoryUser = {
        ...(inMemoryUser || {}),
        ...updatedUser,
        emailVerified: true,
      };
      window.dispatchEvent(
        new CustomEvent("auth:user_updated", { detail: inMemoryUser }),
      );
      return inMemoryUser;
    },
    resendOtp: async () => {
      return request("/dashboard/resend-otp", {
        method: "POST",
      });
    },
    forgotPassword: (email) =>
      request("/dashboard/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token, newPassword) =>
      request("/dashboard/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
    changePassword: (currentPassword, newPassword) =>
      request("/dashboard/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    updateProfile: async (firstName, lastName) => {
      const updatedUser = await request("/dashboard/profile", {
        method: "PUT",
        body: JSON.stringify({ firstName, lastName }),
      });
      inMemoryUser = { ...(inMemoryUser || {}), ...updatedUser };
      window.dispatchEvent(
        new CustomEvent("auth:login", { detail: inMemoryUser }),
      );
      return inMemoryUser;
    },
  },

  users: {
    list: () => request("/dashboard/users"),
    delete: (id) =>
      request(`/dashboard/users/${id}`, {
        method: "DELETE",
      }),
  },

  logs: {
    list: (limit) =>
      request(`/dashboard/logs${limit ? `?limit=${limit}` : ""}`),
  },

  apiKeys: {
    list: () => request("/dashboard/api-keys"),
    create: (name) =>
      request("/dashboard/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    revoke: (id) =>
      request(`/dashboard/api-keys/${id}/revoke`, {
        method: "PATCH",
      }),
    delete: (id) =>
      request(`/dashboard/api-keys/${id}`, {
        method: "DELETE",
      }),
  },

  stats: {
    getOverview: (days = 7) => request(`/dashboard/stats?days=${days}`),
  },

  system: {
    getHealth: async () => {
      try {
        return await request("/health");
      } catch {
        const healthUrl = API_BASE_URL.endsWith("/api")
          ? `${API_BASE_URL.slice(0, -4)}/health`
          : `${API_BASE_URL}/health`;
        const res = await fetch(healthUrl, { credentials: "include" });
        if (!res.ok) throw new Error("Health check failed");
        return await res.json();
      }
    },
  },
};
