import * as webhooksRepository from "../repositories/webhook.repository.js";
import { getSubscriptionTier } from "../repositories/api-key.repository.js";

export async function getWebhooks(adminId) {
  const webhooks = await webhooksRepository.getWebhooks(adminId);
  return webhooks;
}

export async function createWebhook(adminId, url) {
  const tier = (await getSubscriptionTier(adminId)) || "free";
  if (tier === "free") {
    const error = new Error(
      "Webhook integration is a Pro feature. Please upgrade to Pro to create webhooks.",
    );
    error.status = 403;
    throw error;
  }
  const secret = `whsec_${Math.random().toString(36).substr(2, 24)}`;
  const webhook = await webhooksRepository.addWebhook(adminId, url, secret);
  return webhook;
}

export async function deleteWebhook(id, adminId) {
  const deleteCount = await webhooksRepository.deleteWebhook(id, adminId);
  return deleteCount;
}

export async function getWebhookLogs(adminId){
    const webhookLogs = await webhooksRepository.getWebhookLogs(adminId);
    return webhookLogs;
}

