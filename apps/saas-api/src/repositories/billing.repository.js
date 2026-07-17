import pool from "../db.js";

export async function getSubscriptionTier(adminId){
    const result = await pool.query(
      'SELECT subscription_tier as "subscriptionTier" FROM admins WHERE id = $1',
      [adminId],
    );
    return result.rows;
}

export async function upgradeSubscriptionTier(adminId) {
  const result = await pool.query(
    "UPDATE admins SET subscription_tier = 'pro' WHERE id = $1 RETURNING subscription_tier as \"subscriptionTier\"",
    [adminId],
  );
  return result.rows;
}