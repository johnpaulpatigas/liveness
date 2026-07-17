import * as billingRepository from "../repositories/billing.repository.js";

export async function getBillingInfo(adminId){
    const tier = await billingRepository.getSubscriptionTier(adminId);
    if(tier.length === 0){
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }
    return tier[0];
}

export async function upgradeSubscriptionTier(adminId) {
  const tier = await billingRepository.upgradeSubscriptionTier(adminId);
  if (tier.length === 0) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return tier[0];
}
