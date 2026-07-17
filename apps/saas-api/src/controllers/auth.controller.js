import { z } from "zod";
import * as authServices from "../services/auth.service.js";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signup(req, res) {
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { username, password, firstName, lastName, email } = validation.data;

  try {
    const result = await authServices.signup(
      username,
      password,
      firstName,
      lastName,
      email,
    );
    res.status(201).json(result);
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

  const { username, password } = validation.data;

  try {
    const result = await authServices.login(username, password);

    res.json({
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.status === 401) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred during login" });
  }
}
