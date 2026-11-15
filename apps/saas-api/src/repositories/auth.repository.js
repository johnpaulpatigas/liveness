import pool from "../db.js";

export async function createAdmin(
  username,
  passwordHash,
  firstName,
  lastName,
  email,
  dateOfBirth = null,
  client = null,
) {
  const db = client || pool;
  try {
    await db.query(
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;",
    );
    await db.query(
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;",
    );
    await db.query(
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS date_of_birth DATE;",
    );
  } catch {
    // Ignore schema update errors if columns already exist or concurrent migration
  }

  const result = await db.query(
    'INSERT INTO admins (username, password_hash, first_name, last_name, email, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, first_name as "firstName", last_name as "lastName", email, date_of_birth as "dateOfBirth", email_verified as "emailVerified", token_version as "tokenVersion", created_at',
    [username, passwordHash, firstName, lastName, email, dateOfBirth],
  );
  return result.rows[0];
}

export async function findAdminByUsername(username) {
  const result = await pool.query("SELECT * from admins WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
}

export async function findAdminByEmail(email) {
  const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

export async function findAdminByUsernameOrEmail(identifier) {
  const result = await pool.query(
    "SELECT * FROM admins WHERE username = $1 OR LOWER(email) = LOWER($1)",
    [identifier],
  );
  return result.rows[0];
}

export async function addToken(adminId, expiresAt, token_hash) {
  const result = await pool.query(
    "INSERT INTO password_reset_tokens(admin_id, expires_at, token_hash) VALUES($1, $2, $3)",
    [adminId, expiresAt, token_hash],
  );
  return result;
}

export async function findValidResetToken(tokenHash) {
  const result = await pool.query(
    "SELECT id, admin_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1",
    [tokenHash],
  );
  return result.rows[0];
}

export async function markTokenUsed(tokenId) {
  const result = await pool.query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL RETURNING id",
    [tokenId],
  );
  return result.rowCount > 0;
}

export async function updateAdminProfile(adminId, firstName, lastName) {
  const result = await pool.query(
    'UPDATE admins SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING id, username, first_name as "firstName", last_name as "lastName", email, created_at',
    [firstName, lastName, adminId],
  );
  return result.rows[0];
}

export async function updateAdminPassword(adminId, passwordHash) {
  await pool.query(
    "UPDATE admins SET password_hash = $1, token_version = token_version + 1 WHERE id = $2",
    [passwordHash, adminId],
  );
}

export async function changePassword(adminId, newPasswordHashed) {
  const result = await pool.query(
    "UPDATE admins SET password_hash = $1, token_version = token_version + 1 WHERE id = $2",
    [newPasswordHashed, adminId],
  );
  return result.rowCount;
}

export async function findAdminById(adminId) {
  const result = await pool.query("SELECT * FROM admins WHERE id = $1", [
    adminId,
  ]);
  return result.rows[0];
}

export async function findAdminTokenVersion(adminId) {
  try {
    const result = await pool.query(
      "SELECT token_version FROM admins WHERE id = $1",
      [adminId],
    );
    return result.rows[0]?.token_version ?? null;
  } catch (err) {
    // Postgres error code 42703: undefined_column (token_version not yet migrated)
    if (err.code === "42703") {
      try {
        await pool.query(
          "ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;",
        );
        const retry = await pool.query(
          "SELECT token_version FROM admins WHERE id = $1",
          [adminId],
        );
        return retry.rows[0]?.token_version ?? 1;
      } catch (migrationErr) {
        console.warn(
          "Auto-migration of token_version failed:",
          migrationErr.message,
        );
        // Fall back to version 1 so user authentication is not blocked
        return 1;
      }
    }
    throw err;
  }
}

export async function incrementTokenVersion(adminId) {
  try {
    await pool.query(
      "UPDATE admins SET token_version = token_version + 1 WHERE id = $1",
      [adminId],
    );
  } catch (err) {
    if (err.code === "42703") {
      try {
        await pool.query(
          "ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;",
        );
        await pool.query(
          "UPDATE admins SET token_version = token_version + 1 WHERE id = $1",
          [adminId],
        );
      } catch (migrationErr) {
        console.warn(
          "Auto-migration on incrementTokenVersion failed:",
          migrationErr.message,
        );
      }
    } else {
      throw err;
    }
  }
}

export async function createOtp(adminId, otpHash, expiresAt, client = null) {
  const db = client || pool;
  // Ensure table exists defensively
  try {
    await db.query(
      `CREATE TABLE IF NOT EXISTS email_verification_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    );
  } catch {
    // Ignore schema update errors if table already exists or concurrent migration
  }

  const result = await db.query(
    "INSERT INTO email_verification_otps (admin_id, otp_hash, expires_at) VALUES ($1, $2, $3) RETURNING id, admin_id, expires_at, created_at",
    [adminId, otpHash, expiresAt],
  );
  return result.rows[0];
}

export async function findLatestActiveOtp(adminId) {
  try {
    const result = await pool.query(
      "SELECT id, admin_id, otp_hash, expires_at, attempts, used_at FROM email_verification_otps WHERE admin_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1",
      [adminId],
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "42P01") {
      // relation does not exist
      return null;
    }
    throw err;
  }
}

export async function incrementOtpAttempts(otpId) {
  const result = await pool.query(
    "UPDATE email_verification_otps SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts",
    [otpId],
  );
  return result.rows[0]?.attempts || 0;
}

export async function markOtpUsed(otpId, client = null) {
  const db = client || pool;
  await db.query(
    "UPDATE email_verification_otps SET used_at = NOW() WHERE id = $1",
    [otpId],
  );
}

export async function verifyAdminEmail(adminId, client = null) {
  const db = client || pool;
  try {
    await db.query(
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;",
    );
    await db.query(
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;",
    );
  } catch {
    // Ignore schema update errors if columns already exist or concurrent migration
  }

  const result = await db.query(
    'UPDATE admins SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1 RETURNING id, username, first_name as "firstName", last_name as "lastName", email, email_verified as "emailVerified", email_verified_at as "emailVerifiedAt"',
    [adminId],
  );
  return result.rows[0];
}
