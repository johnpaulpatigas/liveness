import pool from "../db.js";

export async function getApiKeys(adminId) {
  const result = await pool.query(
    'SELECT id, name, masked_key as "key", created_at as "createdAt" FROM api_keys WHERE admin_id = $1 ORDER BY created_at DESC',
    [adminId],
  );
  return result.rows;
}

export async function getSubscriptionTier(adminId) {
  const result = await pool.query(
    'SELECT subscription_tier as "subscriptionTier" FROM admins WHERE id = $1',
    [adminId],
  );
  return result.rows[0]?.subscriptionTier;
}

export async function getKeysCount(adminId) {
  const result = await pool.query(
    "SELECT COUNT(*) FROM api_keys WHERE admin_id = $1",
    [adminId],
  );
  return result.rows[0].count;
}

export async function addApiKey(adminId, name, hash, maskedKey) {
  const result = await pool.query(
    'INSERT INTO api_keys (admin_id, name, key_hash, masked_key) VALUES ($1, $2, $3, $4) RETURNING id, name, created_at as "createdAt"',
    [adminId, name, hash, maskedKey],
  );
  return result.rows[0];
}

export async function deleteApiKey(id, adminId) {
  const result = await pool.query(
    "DELETE FROM api_keys WHERE id = $1 AND admin_id = $2",
    [id, adminId],
  );
  return result.rowCount;
}

export async function findByKeyHash(hash) {
  const result = await pool.query(
    `SELECT k.admin_id as "adminId", a.subscription_tier as "subscriptionTier"
       FROM api_keys k
       JOIN admins a ON k.admin_id = a.id
       WHERE k.key_hash = $1`,
    [hash],
  );
  return result.rows;
}

export async function countVerificationsSince(adminId, startOfMonth) {
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM verification_logs WHERE admin_id = $1 AND timestamp >= $2",
    [adminId, startOfMonth],
  );
  return countResult.rows[0];
}