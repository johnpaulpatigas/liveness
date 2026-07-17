import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepositories from "../repositories/auth.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-for-dev-only";

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
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: "24h" },
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
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: "24h" },
  );

  return {
    id: admin.id,
    username: admin.username,
    firstName: admin.first_name,
    lastName: admin.last_name,
    email: admin.email,
    subscriptionTier: admin.subscription_tier,
    token: token,
  };
}