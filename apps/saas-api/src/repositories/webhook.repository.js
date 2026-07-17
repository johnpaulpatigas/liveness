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


export async function deleteWebhook(id, adminId){
      const result = await pool.query("DELETE FROM webhooks WHERE id = $1 AND admin_id = $2", [
      id,
      adminId,
    ]);
    return result.rowCount;
}

export async function getWebhookLogs(adminId) {
  const result = await pool.query(
    'SELECT id, event, url, status_code as "statusCode", response_body as "responseBody", error_message as "errorMessage", latency_ms as "latencyMs", timestamp FROM webhook_logs WHERE admin_id = $1 ORDER BY timestamp DESC LIMIT 100',
    [adminId],
  );
  return result.rows;
}
