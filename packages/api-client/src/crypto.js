/**
 * Cryptographic helper to generate HMAC-SHA256 signature or SHA-256 fallback hash.
 * Works uniformly in Node.js (>=16) and Modern Browsers with Web Crypto API.
 */
export async function computeIntegrity(
  descriptor,
  sessionToken,
  timestamp,
  sessionSecret = null,
) {
  const data = JSON.stringify(descriptor) + sessionToken + timestamp;

  // Modern browsers and Node >= 15 have globalThis.crypto.subtle
  if (
    sessionSecret &&
    typeof globalThis.crypto !== "undefined" &&
    globalThis.crypto.subtle
  ) {
    const enc = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      enc.encode(sessionSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(data),
    );
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Fallback to plain SHA-256 digest if no secret is provided
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const enc = new TextEncoder();
    const hashBuffer = await globalThis.crypto.subtle.digest(
      "SHA-256",
      enc.encode(data),
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Node.js crypto module fallback for environments where globalThis.crypto is absent
  try {
    const nodeCrypto = await import("crypto");
    if (sessionSecret) {
      return nodeCrypto
        .createHmac("sha256", sessionSecret)
        .update(data)
        .digest("hex");
    }
    return nodeCrypto.createHash("sha256").update(data).digest("hex");
  } catch {
    throw new Error(
      "No cryptographic implementation available in current environment",
    );
  }
}
