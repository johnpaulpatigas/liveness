import pool from "../db.js";

export async function changePassword(adminId, newPasswordHashed) {
  const result = await pool.query(
    "UPDATE admins SET password_hash = $1 WHERE id = $2",
    [newPasswordHashed, adminId],
  );
  return result.rowCount;
}

export async function findAdminById(adminId) {
  const result = await pool.query(
    "SELECT id, password_hash FROM admins WHERE id = $1",
    [adminId],
  );
  return result.rows[0];
}
