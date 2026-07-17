import * as billingServices from "../services/billing.service.js";

export async function getBillingInfo(req, res) {
  const adminId = req.user.id;
  try {
    const tier = await billingServices.getBillingInfo(adminId);
    res.json(tier);
  } catch (error) {
    console.error("Billing fetch error:", error);
    if (error.status === 404) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch billing info." });
  }
}

export async function upgradeSubscriptionTier(req, res) {
  const adminId = req.user.id;
  try {
    const tier = await billingServices.upgradeSubscriptionTier(adminId);
    res.json(tier);
  } catch (error) {
    console.error("Billing upgrade error:", error);
    if (error.status === 404) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to upgrade subscription." });
  }
}
