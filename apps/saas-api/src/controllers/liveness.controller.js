import * as livenessServices from "../services/liveness.services.js";
import { z } from "zod";

const commonPayload = {
  descriptor: z
    .array(z.number())
    .length(1792, "Descriptor must be exactly 1792 dimensions"),
  sessionToken: z.string().min(1, "Session token is required"),
  timestamp: z.number(),
  challenges: z.array(z.string()).min(1, "Challenges are required"),
  integrity: z.string().min(1, "Integrity hash is required"),
  antiSpoofing: z.any().optional(),
};

const enrollSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ...commonPayload,
});

const verifySchema = z.object({
  ...commonPayload,
  threshold: z.number().min(0).max(1).optional(),
  identityContinuity: z.any().optional(),
});

const verifyByIdSchema = z.object({
  ...commonPayload,
  targetId: z.string().uuid("targetId must be a valid UUID"),
  threshold: z.number().min(0).max(1).optional(),
  identityContinuity: z.any().optional(),
});

export async function enrollUser(req, res) {
  const validation = enrollSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { name, descriptor } = validation.data;
  const adminId = req.adminId;
  const antiSpoofing = req.body.antiSpoofing ? JSON.stringify(req.body.antiSpoofing) : null;
  try {
    const enrolledUser = await livenessServices.enrollUser(adminId, name, descriptor, antiSpoofing);
    res.status(201).json(enrolledUser);
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({error: "Failed to enroll user."});
  }
}

export async function verifyUser(req, res) {
  const validation = verifySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const adminId = req.adminId;
  const { descriptor, threshold, antiSpoofing, identityContinuity } =
    validation.data;
  try {
    const responsePayload = await livenessServices.verifyUser(
      descriptor,
      threshold,
      antiSpoofing,
      identityContinuity,
      adminId,
    );
    res.json(responsePayload);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to verify identity." });
  }
}

export async function verifyUserById(req, res) {
  const validation = verifyByIdSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const adminId = req.adminId;
  const { descriptor, targetId, threshold, antiSpoofing, identityContinuity } = validation.data;
  try {
    const responsePayload = await livenessServices.verifyUserById(
      descriptor, targetId, threshold, antiSpoofing, identityContinuity, adminId,
    );
    res.json(responsePayload);
  } catch (error) {
    console.error("1:1 verification error:", error);
    res.status(500).json({ error: "Failed to verify identity." });
  }
}
