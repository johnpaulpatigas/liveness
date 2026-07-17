import * as statsServices from "../services/stats.service.js";

export async function getStats(req, res) {
  const adminId = req.user.id;
  try {
    const stats = await statsServices.getStats(adminId);
    return res.json({ ...stats });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
}