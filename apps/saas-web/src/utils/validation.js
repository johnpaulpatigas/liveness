import { z } from "zod";

export const BANNED_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "bastard",
  "damn",
  "cunt",
  "dick",
  "cock",
  "piss",
  "slut",
  "whore",
  "nigger",
  "faggot",
];

export const containsBannedWord = (val) =>
  typeof val === "string" &&
  BANNED_WORDS.some((w) => val.toLowerCase().includes(w));

export const nameRule = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be 50 characters or fewer")
  .regex(
    /^[a-zA-Z\s\-']+$/,
    "Only letters, spaces, hyphens, and apostrophes allowed",
  )
  .refine((val) => val.toLowerCase() !== val, {
    message: "Name must not be all lowercase",
  })
  .refine((val) => /^[A-Z]/.test(val), {
    message: "First letter must be capitalized",
  })
  .refine((val) => !containsBannedWord(val), {
    message: "Name contains inappropriate language",
  });

export const usernameRule = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be 30 characters or fewer")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Username may only contain letters, numbers, underscores, dots, or hyphens",
  )
  .refine((val) => !containsBannedWord(val), {
    message: "Username contains inappropriate language",
  });

export const passwordComplexityRule = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[A-Z]/, "Password must have at least 1 upper case letter.")
  .regex(/[a-z]/, "Password must have at least 1 lower case letter.")
  .regex(/[0-9]/, "Password must have at least 1 number.");

export const emailRule = z
  .string()
  .email("Invalid email address")
  .refine((val) => !/[A-Z]/.test(val), {
    message: "Email must not contain capital letters",
  });

export const isAtLeast13YearsOld = (dateStr, refDate = new Date()) => {
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

  const nowY = refDate.getFullYear();
  const nowM = refDate.getMonth();
  const nowD = refDate.getDate();

  // Exactly 13 years ago today
  const minEligibleBirthDate = new Date(Date.UTC(nowY - 13, nowM, nowD));
  return birthDate <= minEligibleBirthDate;
};

export const getMaxBirthDateString = (refDate = new Date()) => {
  const d = new Date(refDate.getFullYear() - 13, refDate.getMonth(), refDate.getDate());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const dateOfBirthRule = z
  .string()
  .min(1, "Date of birth is required")
  .refine(
    (val) => isAtLeast13YearsOld(val),
    "You must be at least 13 years old to register",
  );

export const signupSchema = z
  .object({
    username: usernameRule,
    password: passwordComplexityRule,
    confirmPassword: z.string(),
    firstName: nameRule,
    lastName: nameRule,
    email: emailRule,
    dateOfBirth: dateOfBirthRule,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: nameRule,
  lastName: nameRule,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(72, "Password must not exceed 72 characters"),
    newPassword: passwordComplexityRule,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .min(3, "Username or email must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(/[A-Z]/, "Password must have at least 1 upper case.")
      .regex(/[a-z]/, "Password must have at least 1 lower case.")
      .regex(/[0-9]/, "Password must have at least 1 number."),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const apiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Key name is required")
    .max(255, "Key name must not exceed 255 characters"),
});
