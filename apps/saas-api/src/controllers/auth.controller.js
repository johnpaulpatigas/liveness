import { z } from "zod";
import * as authServices from "../services/auth.service.js";
import {
  getAuthCookieOptions,
  getClearCookieOptions,
} from "../utils/cookie.js";

const passwordComplexitySchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[A-Z]/, "Password must have at least 1 upper case.")
  .regex(/[a-z]/, "Password must have at least 1 lower case.")
  .regex(/[0-9]/, "Password must have at least 1 number.");

const isAtLeast13YearsOld = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  const birthDate = new Date(Date.UTC(y, m - 1, d));
  if (
    birthDate.getUTCFullYear() !== y ||
    birthDate.getUTCMonth() !== m - 1 ||
    birthDate.getUTCDate() !== d
  ) {
    return false;
  }

  const now = new Date();
  const nowY = now.getFullYear();
  const nowM = now.getMonth();
  const nowD = now.getDate();

  const minEligibleBirthDate = new Date(Date.UTC(nowY - 13, nowM, nowD));
  return birthDate <= minEligibleBirthDate;
};

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(255, "Username must not exceed 255 characters"),
  password: passwordComplexitySchema,
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(255, "First name must not exceed 255 characters")
    .refine((val) => val.toLowerCase() !== val, {
      message: "First name must not be all lowercase",
    })
    .refine((val) => /^[A-Z]/.test(val), {
      message: "First letter of first name must be capitalized",
    }),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(255, "Last name must not exceed 255 characters")
    .refine((val) => val.toLowerCase() !== val, {
      message: "Last name must not be all lowercase",
    })
    .refine((val) => /^[A-Z]/.test(val), {
      message: "First letter of last name must be capitalized",
    }),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .refine((val) => !/[A-Z]/.test(val), {
      message: "Email must not contain capital letters",
    }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => isAtLeast13YearsOld(val),
      "You must be at least 13 years old to register",
    ),
});

const loginSchema = z
  .object({
    username: z.string().trim().max(255).optional(),
    email: z.string().trim().max(255).optional(),
    identifier: z.string().trim().max(255).optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must not exceed 72 characters"),
  })
  .superRefine((data, ctx) => {
    const id = data.username || data.email || data.identifier;
    if (!id || id.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username or email is required",
        path: ["username"],
      });
      return;
    }
    if (id.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username or email must be at least 3 characters",
        path: ["username"],
      });
    }
  });

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordComplexitySchema,
});

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password must not exceed 72 characters"),
  newPassword: passwordComplexitySchema,
});

export async function signup(req, res) {
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { username, password, firstName, lastName, email, dateOfBirth } =
    validation.data;

  try {
    const result = await authServices.signup(
      username,
      password,
      firstName,
      lastName,
      email,
      dateOfBirth,
    );

    const { token, ...admin } = result;
    res.cookie("token", token, getAuthCookieOptions());
    res.status(201).json({ ...admin, token });
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail.includes("username")) {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (error.detail.includes("email")) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create administrator account" });
  }
}

export async function login(req, res) {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { username, email, identifier, password } = validation.data;
  let loginIdentifier = (username || email || identifier).trim();
  if (email) {
    loginIdentifier = email.trim().toLowerCase();
  } else if (loginIdentifier.includes("@")) {
    loginIdentifier = loginIdentifier.toLowerCase();
  }

  try {
    const result = await authServices.login(loginIdentifier, password);
    const { token, ...admin } = result;
    res.cookie("token", token, getAuthCookieOptions());
    res.json({ ...admin, token });
  } catch (error) {
    console.error("Login error:", error);
    if (error.status === 401) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred during login" });
  }
}

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d+$/, "Verification code must contain digits only"),
});

export async function verifyOtp(req, res) {
  const validation = verifyOtpSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { otp } = validation.data;
  const adminId = req.user.id;

  try {
    const admin = await authServices.verifyEmailOtp(adminId, otp);
    res.json({ ...admin, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to verify email code." });
  }
}

export async function resendOtp(req, res) {
  const adminId = req.user.id;
  try {
    const result = await authServices.resendVerificationOtp(adminId);
    res.json(result);
  } catch (error) {
    console.error("Resend OTP error:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to resend verification code." });
  }
}

export async function forgotPassword(req, res) {
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { email } = validation.data;
  try {
    await authServices.forgotPassword(email);
  } catch (error) {
    console.error("Forgot password error:", error);
  }
  res.json({
    message: "If that email is registered, a reset link has been sent.",
  });
}

export async function resetPassword(req, res) {
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { token, newPassword } = validation.data;
  try {
    await authServices.resetPassword(token, newPassword);
    res.status(204).send();
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to reset password." });
  }
}

export async function changePassword(req, res) {
  const adminId = req.user.id;
  const validation = changePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { currentPassword, newPassword } = validation.data;
  try {
    await authServices.changePassword(adminId, currentPassword, newPassword);
    res.status(204).send();
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to change password." });
  }
}

const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(255, "First name must not exceed 255 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(255, "Last name must not exceed 255 characters"),
});

export async function updateProfile(req, res) {
  const adminId = req.user.id;
  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { firstName, lastName } = validation.data;
  try {
    const updatedAdmin = await authServices.updateProfile(
      adminId,
      firstName,
      lastName,
    );
    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
}

export async function logout(req, res) {
  res.clearCookie("token", getClearCookieOptions());
  res.status(204).send();
}

export async function me(req, res) {
  if (!req.user) {
    return res.status(200).json(null);
  }
  try {
    const admin = await authServices.getCurrentUser(req.user.id);
    res.status(200).json(admin);
  } catch (error) {
    if (error.status === 404) {
      return res.status(200).json(null);
    }
    console.error("Error fetching current user:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch current user." });
  }
}
