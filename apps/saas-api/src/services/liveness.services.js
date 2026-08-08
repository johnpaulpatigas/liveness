import * as livenessRepository from "../repositories/liveness.repository.js";
import { triggerWebhooks } from "../services/webhook.service.js";
import { ScoreCalibrator } from "./ScoreCalibrator.js";

export async function enrollUser(adminId, name, descriptor, antiSpoofing) {
  const enrolledUser = await livenessRepository.addUser(
    adminId,
    name,
    descriptor,
  );

  await livenessRepository.addVerificationLog(
    adminId,
    enrolledUser.id,
    enrolledUser.name,
    1.0,
    "ENROLLED",
    antiSpoofing,
  );

  triggerWebhooks(adminId, "user.enrolled", enrolledUser);
  return enrolledUser;
}

export async function verifyUser(descriptor, threshold, antiSpoofing, identityContinuity, adminId) {
  const calibrator = new ScoreCalibrator(threshold !== undefined ? threshold : 0.85);
  const effectiveThreshold = calibrator.calculateAdaptiveThreshold({
    antiSpoofing: antiSpoofing,
    identityContinuity: identityContinuity,
  });


    const closestMatch = await livenessRepository.findClosestMatch(
      descriptor,
      adminId,
    );

    let status = "FAILURE";
    let match = null;
    let confidence = "NONE";

    if (closestMatch.length > 0) {
      match = closestMatch[0];
      const evalResult = calibrator.evaluateConfidence(match.similarity, effectiveThreshold);
      if (evalResult.verified){
        status = "SUCCESS";
        confidence = evalResult.confidence;
      }
    }


    await livenessRepository.addVerificationLog(
      adminId,
      match?.id || null,
      match?.name || "Unknown",
      match?.similarity || 0,
      status,
      antiSpoofing ? JSON.stringify(antiSpoofing) : null,
    );

    const responsePayload = {
        verified: status === "SUCCESS",
        confidence,
        effectiveThreshold,
        match: match
          ? { name: match.name, similarity: match.similarity }
          : null,
        status,
      };
    triggerWebhooks(adminId, "liveness.verified", responsePayload);
    return responsePayload;
}

export async function verifyUserById(descriptor, targetId, threshold, antiSpoofing, identityContinuity, adminId) {
  const calibrator = new ScoreCalibrator(threshold !== undefined ? threshold : 0.65);
  const effectiveThreshold = calibrator.calculateAdaptiveThreshold({ antiSpoofing, identityContinuity });

  const user = await livenessRepository.findMatchById(descriptor, targetId, adminId);

  let status = "FAILURE";
  let match = null;
  let confidence = "NONE";

  if (user.length > 0) {
    match = user[0];
    const evalResult = calibrator.evaluateConfidence(match.similarity, effectiveThreshold);
    if (evalResult.verified) {
      status = "SUCCESS";
      confidence = evalResult.confidence;
    }
  }

  await livenessRepository.addVerificationLog(
    adminId,
    match?.id || null,
    match?.name || "Unknown",
    match?.similarity || 0,
    status,
    antiSpoofing ? JSON.stringify(antiSpoofing) : null,
  );

  const responsePayload = {
    verified: status === "SUCCESS",
    confidence,
    effectiveThreshold,
    match: match ? { id: match.id, name: match.name, similarity: match.similarity } : null,
    status,
  };
  triggerWebhooks(adminId, "liveness.verified", responsePayload);
  return responsePayload;
}
