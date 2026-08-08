import pool from "../db.js";

const formatVector = (vector) => `[${vector.join(",")}]`;

export async function addUser(adminId, name, descriptor) {
  const result = await pool.query(
    "INSERT INTO users (admin_id, name, descriptor) VALUES($1, $2, $3) RETURNING id, name, enrolled_at",
    [adminId, name, formatVector(descriptor)],
  );
  return result.rows[0];
}

export async function addVerificationLog(adminId, enrolledUserId, enrolledUserName, similarity, status, antiSpoofing) {
  await pool.query(
    "INSERT INTO verification_logs (admin_id, user_id, user_name, score, status, anti_spoofing) VALUES ($1, $2, $3, $4, $5, $6)",
    [adminId, enrolledUserId, enrolledUserName, similarity, status, antiSpoofing],
  );
}

export async function findClosestMatch(descriptor, adminId) {
  const result = await pool.query(
    "SELECT id, name, 1 - (descriptor <=> $1) AS similarity FROM users WHERE admin_id = $2 ORDER BY descriptor <=> $1 LIMIT 1",
    [formatVector(descriptor), adminId],
  );
  return result.rows;
}

export async function findMatchById(descriptor, userId, adminId) {
  const result = await pool.query(
    "SELECT id, name, 1 - (descriptor <=> $1) AS similarity FROM users WHERE id = $2 AND admin_id = $3",
    [formatVector(descriptor), userId, adminId],
  );
  return result.rows;
}