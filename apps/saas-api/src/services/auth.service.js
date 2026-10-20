import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepositories from "../repositories/auth.repository.js";
import crypto from "crypto";
import {
  sendResetPasswordEmail,
  sendVerificationOtpEmail,
} from "./email.service.js";

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is required in production mode.",
    );
  }
  console.warn(
    "SECURITY WARNING: Using fallback JWT secret for local development. Set JWT_SECRET in production.",
  );
  return "your-fallback-secret-for-dev-only";
};

const JWT_SECRET = getJwtSecret();
const APP_URL = process.env.APP_URL || "http://localhost:5173";

function generateSecureOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function sendOtpForAdmin(adminId, email) {
  const otp = generateSecureOtp();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await authRepositories.createOtp(adminId, otpHash, expiresAt);

  return sendVerificationOtpEmail(email, otp);
}

export async function signup(username, password, firstName, lastName, email) {
  if (
    typeof firstName === "string" &&
    (firstName.toLowerCase() === firstName || !/^[A-Z]/.test(firstName))
  ) {
    const error = new Error(
      firstName.toLowerCase() === firstName
        ? "First name must not be all lowercase"
        : "First letter of first name must be capitalized",
    );
    error.status = 400;
    throw error;
  }
  if (
    typeof lastName === "string" &&
    (lastName.toLowerCase() === lastName || !/^[A-Z]/.test(lastName))
  ) {
    const error = new Error(
      lastName.toLowerCase() === lastName
        ? "Last name must not be all lowercase"
        : "First letter of last name must be capitalized",
    );
    error.status = 400;
    throw error;
  }
  if (/[A-Z]/.test(email)) {
    const error = new Error("Email must not contain capital letters");
    error.status = 400;
    throw error;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = await authRepositories.createAdmin(
    username,
    passwordHash,
    firstName,
    lastName,
    email,
  );

  // Automatically dispatch verification OTP on signup
  await sendOtpForAdmin(admin.id, admin.email);

  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      tokenVersion: admin.tokenVersion || 1,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" },
  );

  return {
    ...admin,
    emailVerified: false,
    token,
  };
}

// Pre-computed bcrypt cost-10 hash used to mitigate account enumeration timing attacks
const DUMMY_BCRYPT_HASH =
  "$2b$10$e8/N5L4qK5jL7iO8yV9M6.8vU0c5B6e7f8g9h0i1j2k3l4m5n6o7p";

export async function login(identifier, password) {
  let cleanIdentifier =
    typeof identifier === "string" ? identifier.trim() : identifier;
  if (typeof cleanIdentifier === "string" && cleanIdentifier.includes("@")) {
    cleanIdentifier = cleanIdentifier.toLowerCase();
  }
  const admin = await authRepositories.findAdminByUsernameOrEmail(cleanIdentifier);

  const passwordHashToCompare = admin
    ? admin.password_hash
    : DUMMY_BCRYPT_HASH;
  const isMatch = await bcrypt.compare(password, passwordHashToCompare);

  if (!admin || !isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isVerified = Boolean(admin.email_verified);

  // If not verified, trigger OTP send on login so user can immediately verify
  if (!isVerified) {
    await sendOtpForAdmin(admin.id, admin.email);
  }

  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      tokenVersion: admin.token_version || 1,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" },
  );

  return {
    id: admin.id,
    username: admin.username,
    firstName: admin.first_name,
    lastName: admin.last_name,
    email: admin.email,
    emailVerified: isVerified,
    token: token,
  };
}

export async function verifyEmailOtp(adminId, otp) {
  const cleanOtp = String(otp).trim();
  const activeOtp = await authRepositories.findLatestActiveOtp(adminId);

  if (!activeOtp) {
    const error = new Error("No active verification code found. Please request a new one.");
    error.status = 400;
    throw error;
  }

  if (new Date(activeOtp.expires_at) < new Date()) {
    const error = new Error("Verification code has expired. Please request a new code.");
    error.status = 400;
    throw error;
  }

  if (activeOtp.attempts >= 5) {
    const error = new Error("Too many incorrect attempts. Please request a new code.");
    error.status = 429;
    throw error;
  }

  const inputHash = crypto.createHash("sha256").update(cleanOtp).digest("hex");
  const inputBuf = Buffer.from(inputHash, "utf8");
  const targetBuf = Buffer.from(activeOtp.otp_hash, "utf8");
  const isHashMatch =
    inputBuf.length === targetBuf.length &&
    crypto.timingSafeEqual(inputBuf, targetBuf);

  if (!isHashMatch) {
    await authRepositories.incrementOtpAttempts(activeOtp.id);
    const error = new Error("Invalid verification code. Please check and try again.");
    error.status = 400;
    throw error;
  }

  await authRepositories.markOtpUsed(activeOtp.id);
  const updatedAdmin = await authRepositories.verifyAdminEmail(adminId);

  return {
    id: updatedAdmin.id,
    username: updatedAdmin.username,
    firstName: updatedAdmin.firstName,
    lastName: updatedAdmin.lastName,
    email: updatedAdmin.email,
    emailVerified: true,
  };
}

export async function resendVerificationOtp(adminId) {
  const admin = await authRepositories.findAdminById(adminId);
  if (!admin) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (admin.email_verified) {
    const error = new Error("Email is already verified");
    error.status = 400;
    throw error;
  }

  const dispatchResult = await sendOtpForAdmin(admin.id, admin.email);
  if (dispatchResult && dispatchResult.success === false) {
    const error = new Error(
      dispatchResult.error || "Failed to deliver verification email. Please check your email address.",
    );
    error.status = 502;
    throw error;
  }
  return { message: "Verification code sent successfully" };
}

export async function forgotPassword(email) {
  const admin = await authRepositories.findAdminByEmail(email);
  if (!admin) {
    // Perform dummy work to prevent timing side-channels
    crypto.createHash("sha256").update(crypto.randomBytes(24)).digest("hex");
    return;
  }
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await authRepositories.addToken(admin.id, expiresAt, tokenHash);
  const cleanAppUrl = APP_URL.replace(/\/+$/, "");
  const resetLink = `${cleanAppUrl}/reset-password?token=${token}`;

  // Dispatch email asynchronously so SMTP network latency or errors do not leak account existence
  sendResetPasswordEmail(admin.email, resetLink).catch((err) => {
    console.error("Failed to send password reset email:", err);
  });
}

export async function resetPassword(token, newPassword) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await authRepositories.findValidResetToken(tokenHash);

  const isInvalid =
    !resetToken ||
    resetToken.used_at ||
    new Date(resetToken.expires_at) < new Date();

  if (isInvalid) {
    const error = new Error("Invalid or expired reset token");
    error.status = 400;
    throw error;
  }

  // Atomically claim the token to prevent concurrent TOCTOU replay race conditions
  const claimed = await authRepositories.markTokenUsed(resetToken.id);
  if (!claimed) {
    const error = new Error("Invalid or expired reset token");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await authRepositories.updateAdminPassword(resetToken.admin_id, passwordHash);
}

export async function changePassword(adminId, currentPassword, newPassword) {
  const existingUser = await authRepositories.findAdminById(adminId);
  if (!existingUser) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }
  const isMatch = await bcrypt.compare(
    currentPassword,
    existingUser.password_hash,
  );
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.status = 401;
    throw error;
  }
  const isSameAsCurrent = currentPassword === newPassword;
  if (isSameAsCurrent) {
    const error = new Error(
      "New password must not be the same with current password.",
    );
    error.status = 400;
    throw error;
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  const updatePassword = await authRepositories.changePassword(
    adminId,
    newPasswordHash,
  );
  if (updatePassword === 0) {
    const error = new Error("Failed to update password.");
    error.status = 500;
    throw error;
  }
  return updatePassword;
}

export async function updateProfile(adminId, firstName, lastName) {
  const updatedAdmin = await authRepositories.updateAdminProfile(
    adminId,
    firstName,
    lastName,
  );
  if (!updatedAdmin) {
    const error = new Error("Failed to update profile.");
    error.status = 500;
    throw error;
  }
  return updatedAdmin;
}

export async function getCurrentUser(adminId) {
  const admin = await authRepositories.findAdminById(adminId);
  if (!admin) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return {
    id: admin.id,
    username: admin.username,
    firstName: admin.first_name,
    lastName: admin.last_name,
    email: admin.email,
    emailVerified: Boolean(admin.email_verified),
    emailVerifiedAt: admin.email_verified_at || null,
  };
}
