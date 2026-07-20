import * as changePasswordServices from "../services/change-password.service.js";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password must not exceed 72 characters"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must have at least 1 upper case.")
    .regex(/[a-z]/, "Password must have at least 1 lower case.")
    .regex(/[0-9]/, "Password must have at least 1 number.")
    .max(72, "Password must not exceed 72 characters"),
});

export async function changePassword(req, res) {
  const adminId = req.user.id;
  const validation = changePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { currentPassword, newPassword } = validation.data;
  try {
    await changePasswordServices.changePassword(
      adminId,
      currentPassword,
      newPassword,
    );
    res.status(204).send();
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to change password." });
  }
}
