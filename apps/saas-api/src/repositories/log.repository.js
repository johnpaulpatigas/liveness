import pool from "../db.js";

export async function getLogs(adminId) {
  const result = await pool.query(
    'SELECT id, user_name as "userName", score,status,anti_spoofing as "antiSpoofing", timestamp FROM verification_logs WHERE admin_id = $1 ORDER BY timestamp DESC LIMIT 100',
    [adminId],
  );

  return result.rows;
}
