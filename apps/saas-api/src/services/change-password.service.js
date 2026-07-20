import bcrypt from "bcrypt";
import * as changePasswordRepository from "../repositories/change-password.repository.js";

export async function changePassword(adminId, currentPassword, newPassword) {
  const existingUser = await changePasswordRepository.findAdminById(adminId);
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
  const updatePassword = await changePasswordRepository.changePassword(
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
