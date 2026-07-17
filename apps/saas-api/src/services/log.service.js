import * as logsRepositories from "../repositories/log.repository.js";

export async function getLogs(adminId){
    const logs = await logsRepositories.getLogs(adminId);
    return logs;
}