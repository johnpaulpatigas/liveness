import pool from "../db.js";

export async function createAdmin(username, passwordHash, firstName, lastName, email){
  const result = await pool.query(
    'INSERT INTO admins (username, password_hash, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, first_name as "firstName", last_name as "lastName", email, subscription_tier as "subscriptionTier", created_at',
    [username, passwordHash, firstName, lastName, email],
  );
  return result.rows[0];
}

export async function findAdminByUsername(username){
    const result = await pool.query('SELECT * from admins WHERE username = $1', [username]);
    return result.rows[0];
}

