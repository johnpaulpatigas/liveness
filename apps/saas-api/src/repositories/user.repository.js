import pool from "../db.js";

export async function getUsers(adminId) {
  const result = await pool.query(
    'SELECT id, name, enrolled_at as "enrolledAt" FROM users WHERE admin_id = $1 ORDER BY enrolled_at DESC',
    [adminId],
  );
  return result.rows;
}

export async function deleteUser(id, adminId){
    const result = await pool.query("DELETE FROM users WHERE id = $1 AND admin_id = $2", [id, adminId]);
    return result.rowCount;
}