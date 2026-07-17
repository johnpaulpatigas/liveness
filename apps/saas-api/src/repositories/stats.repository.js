import pool from '../db.js';

export async function getUsersCount(adminId) {
  const usersCount = await pool.query(
    "SELECT COUNT(*) FROM users WHERE admin_id = $1",
    [adminId],
  );
  return usersCount.rows[0].count;
}

export async function getLogsCount(adminId) {
  const logsCount = await pool.query(
    "SELECT COUNT(*) FROM verification_logs WHERE admin_id = $1",
    [adminId],
  );
  return logsCount.rows[0].count;
}

export async function getSuccessLogsCount(adminId) {
  const successLogsCount = await pool.query(
    "SELECT COUNT(*) FROM verification_logs WHERE admin_id = $1 AND status = 'SUCCESS'",
    [adminId],
  );
  return successLogsCount.rows[0].count;
}

export async function getSpoofLogsCount(adminId) {
  const spoofLogsCount = await pool.query(
    "SELECT COUNT(*) FROM verification_logs WHERE admin_id = $1 AND status = 'SPOOF_DETECTED'",
    [adminId],
  );
  return spoofLogsCount.rows[0].count;
}