import pool from "../db.js";

export async function getWebhooks(adminId) {
  const result = await pool.query(
    'SELECT id, url, secret, is_active as "isActive", created_at as "createdAt" FROM webhooks WHERE admin_id = $1 ORDER BY created_at DESC',
    [adminId],
  );
  return result.rows;
}

export async function addWebhook(adminId, url, secret) {
  const result = await pool.query(
    'INSERT INTO webhooks (admin_id, url, secret) VALUES ($1, $2, $3) RETURNING id, url, secret, is_active as "isActive", created_at as "createdAt"',
    [adminId, url, secret],
  );
  return result.rows[0];
}

export async function deleteWebhook(id, adminId) {
  const result = await pool.query(
    "DELETE FROM webhooks WHERE id = $1 AND admin_id = $2",
    [id, adminId],
  );
  return result.rowCount;
}

export async function getWebhookLogs(adminId) {
  const result = await pool.query(
    'SELECT id, event, url, status_code as "statusCode", response_body as "responseBody", error_message as "errorMessage", latency_ms as "latencyMs", timestamp FROM webhook_logs WHERE admin_id = $1 ORDER BY timestamp DESC LIMIT 100',
    [adminId],
  );
  return result.rows;
}

export async function getActiveWebhooks(adminId) {
  const webhooks = await pool.query(
    "SELECT id, url, secret FROM webhooks WHERE admin_id = $1 AND is_active = TRUE",
    [adminId],
  );
  return webhooks.rows;
}

export async function addWebhookLog(webhookId, adminId, event, webhookUrl, status, bodyText, latency) {
  await pool.query(
    "INSERT INTO webhook_logs (webhook_id, admin_id, event, url, status_code, response_body, latency_ms) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [webhookId, adminId, event, webhookUrl, status, bodyText, latency],
  );
}

export async function addWebhookErrorLog(webhookId, adminId, event, webhookUrl, errMessage, latency) {
  await pool.query(
    "INSERT INTO webhook_logs (webhook_id, admin_id, event, url, error_message, latency_ms) VALUES ($1, $2, $3, $4, $5, $6)",
    [webhookId, adminId, event, webhookUrl, errMessage, latency],
  );
}