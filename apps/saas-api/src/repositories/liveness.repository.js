import pool from "../db.js";

const formatVector = (vector) => `[${vector.join(",")}]`;

export async function addUser(
  adminId,
  name,
  descriptor,
  apiKeyId = null,
  client = null,
) {
  const db = client || pool;
  const result = await db.query(
    "INSERT INTO users (admin_id, name, descriptor, api_key_id) VALUES($1, $2, $3, $4) RETURNING id, name, enrolled_at",
    [adminId, name, formatVector(descriptor), apiKeyId],
  );
  return result.rows[0];
}

export async function addVerificationLog(
  adminId,
  enrolledUserId,
  enrolledUserName,
  similarity,
  status,
  apiKeyId = null,
  client = null,
) {
  const db = client || pool;
  await db.query(
    "INSERT INTO verification_logs (admin_id, user_id, user_name, score, status, api_key_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [adminId, enrolledUserId, enrolledUserName, similarity, status, apiKeyId],
  );
}

export async function findClosestMatch(descriptor, adminId, metric = "cosine") {
  const isEuclidean = metric === "euclidean";
  const query = isEuclidean
    ? "SELECT id, name, descriptor <-> $1 AS distance, 1 - (descriptor <=> $1) AS similarity FROM users WHERE admin_id = $2 ORDER BY descriptor <-> $1 LIMIT 1"
    : "SELECT id, name, descriptor <-> $1 AS distance, 1 - (descriptor <=> $1) AS similarity FROM users WHERE admin_id = $2 ORDER BY descriptor <=> $1 LIMIT 1";

  const result = await pool.query(query, [formatVector(descriptor), adminId]);
  return result.rows;
}

export async function findMatchById(descriptor, userId, adminId) {
  const result = await pool.query(
    "SELECT id, name, descriptor <-> $1 AS distance, 1 - (descriptor <=> $1) AS similarity FROM users WHERE id = $2 AND admin_id = $3",
    [formatVector(descriptor), userId, adminId],
  );
  return result.rows;
}
