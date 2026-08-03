import { getSubscriptionTier } from "../repositories/api-key.repository.js";
import * as webhooksRepository from "../repositories/webhook.repository.js";
import crypto from "crypto";

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

export async function getWebhookLogs(adminId) {
  const webhookLogs = await webhooksRepository.getWebhookLogs(adminId);
  return webhookLogs;
}

export async function triggerWebhooks(adminId, event, data) {
  try {
    const webhooks = await webhooksRepository.getActiveWebhooks(adminId);
    const payload = JSON.stringify({ event, timestamp: Date.now(), data });
    for (const webhook of webhooks) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(payload)
        .digest("hex");

      const startTime = Date.now();

      fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-liveness-signature": signature,
        },
        body: payload,
      })
        .then(async (res) => {
          const latency = Date.now() - startTime;
          let bodyText = "";
          try {
            bodyText = await res.text();
            if (bodyText.length > 2000) {
              bodyText = bodyText.substring(0, 2000) + "... (truncated)";
            }
          } catch (err) {
            void err;
          }
          await webhooksRepository.addWebhookLog(webhook.id, adminId, event, webhook.url, res.status, bodyText, latency);
        })
        .catch(async (err) => {
          const latency = Date.now() - startTime;
          await webhooksRepository.addWebhookErrorLog(webhook.id, adminId, event, webhook.url, err.message, latency);
          console.error(
            `Webhook delivery failed to ${webhook.url}:`,
            err.message,
          );
        });
    }
  } catch (error) {
    console.error("Failed to trigger webhooks:", error);
  }
}