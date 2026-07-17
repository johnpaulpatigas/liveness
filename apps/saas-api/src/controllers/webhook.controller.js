import {z} from "zod";
import * as webhookServices from "../services/webhook.service.js";

const webhookSchema = z.object({
  url: z.string().url("Invalid webhook URL"),
});

export async function getWebhooks(req, res) {
  const adminId = req.user.id;
  try {
    const webhooks = await webhookServices.getWebhooks(adminId);
    res.json(webhooks);
  } catch (error) {
    console.error("Webhooks fetch error:", error);
    res.status(500).json({ error: "Failed to fetch webhooks." });
  }
}

export async function createWebhook(req, res) {
  const validation = webhookSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { url } = validation.data;
  const adminId = req.user.id;
  try {
    const webhook = await webhookServices.createWebhook(adminId, url);
    res.status(201).json(webhook);
  } catch (error) {
    console.error("Webhook creation error:", error);
    if (error.status === 403) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create webhook." });
  }
}

export async function deleteWebhook(req, res) {
  const { id } = req.params;
  const adminId = req.user.id;
  try {
    await webhookServices.deleteWebhook(id, adminId);
    res.status(204).send();
  } catch (error) {
    console.error("Webhook delete error:", error);
    res.status(500).json({ error: "Failed to delete webhook." });
  }
}

export async function getWebhookLogs(req, res) {
  const adminId = req.user.id;
  try {
    const webhookLogs = await webhookServices.getWebhookLogs(adminId);
    res.json(webhookLogs);
  } catch (error) {
    console.error("Webhook logs fetch error:", error);
    res.status(500).json({ error: "Failed to fetch webhook logs." });
  }
}