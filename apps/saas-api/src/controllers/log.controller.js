import * as logServices from "../services/log.service.js";

export async function getLogs(req, res) {
  const adminId = req.user.id;
  try {
    const logs = await logServices.getLogs(adminId);
    res.json(logs);
  } catch (error) {
    console.error("Logs history error:", error);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
}
