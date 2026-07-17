import * as statsRepositories from "../repositories/stats.repository.js";

export async function getStats(adminId) {
  const totalUsers = parseInt(await statsRepositories.getUsersCount(adminId));
  const totalLogs = parseInt(await statsRepositories.getLogsCount(adminId));
  const successLogs = parseInt(await statsRepositories.getSuccessLogsCount(adminId));
  const spoofLogs = parseInt(await statsRepositories.getSpoofLogsCount(adminId));

  return {
    totalUsers,
    totalChecks: totalLogs,
    passRate: totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0,
    spoofAttempts: spoofLogs,
  };
}