import crypto from "crypto";
import * as apiKeyRepositories from "../repositories/api-key.repository.js";

export async function getApiKeys(adminId) {
  const apiKeys = await apiKeyRepositories.getApiKeys(adminId);
  return apiKeys;
}

export async function createApiKey(name, adminId) {
  const tier =
    (await apiKeyRepositories.getSubscriptionTier(adminId)) || "free";
  if (tier === "free") {
    const keyCount = parseInt(await apiKeyRepositories.getKeysCount(adminId));
    if (keyCount >= 1) {
      const error = new Error(
        "Starter plan is limited to 1 API key. Please upgrade to Pro to issue more keys.",
      );
      error.status = 403;
      throw error;
    }
  }
  const rawKey = `live_pk_${crypto.randomBytes(24).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const maskedKey = `live_pk_••••${rawKey.slice(-4)}`;

  const newKeyRecord = await apiKeyRepositories.addApiKey(
    adminId,
    name,
    hash,
    maskedKey,
  );

  return { ...newKeyRecord, key: rawKey, isNew: true };
}

export async function deleteApiKey(id, adminId) {
  const deleteCount = await apiKeyRepositories.deleteApiKey(id, adminId);
  return deleteCount;
}


