import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set in environment variables.");
}

const isLocalDb =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

// Allow explicit override via DB_SSL_REJECT_UNAUTHORIZED if using custom/self-signed certificates
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";

if (!rejectUnauthorized) {
  console.warn(
    "SECURITY WARNING: Database TLS certificate verification is disabled (rejectUnauthorized: false).",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb
    ? false
    : {
        rejectUnauthorized,
      },
});

export const query = (text, params) => pool.query(text, params);

/**
 * Execute a callback within an atomic PostgreSQL transaction (BEGIN ... COMMIT / ROLLBACK)
 * @param {Function} callback - Function receiving (client) and returning a promise
 * @returns {Promise<any>} Result returned by the callback
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to rollback transaction:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
