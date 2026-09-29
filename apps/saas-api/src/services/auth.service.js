import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepositories from "../repositories/auth.repository.js";
import crypto from "crypto";
import { sendResetPasswordEmail } from "./email.service.js";

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

export async function signup(username, password, firstName, lastName, email) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = await authRepositories.createAdmin(
    username,
    passwordHash,
    firstName,
    lastName,
    email,
  );
  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      tokenVersion: admin.tokenVersion || 1,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" },
  );
  return { ...admin, token };
}

export async function login(username, password) {
  const admin = await authRepositories.findAdminByUsername(username);

  if (!admin) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
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
    token: token,
  };
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
  const resetLink = cleanAppUrl.includes("#")
    ? `${cleanAppUrl}/reset-password?token=${token}`
    : `${cleanAppUrl}/#/reset-password?token=${token}`;

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

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await authRepositories.updateAdminPassword(resetToken.admin_id, passwordHash);
  await authRepositories.markTokenUsed(resetToken.id);
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
  };
}
