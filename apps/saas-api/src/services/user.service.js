import * as usersRepository from "../repositories/user.repository.js";

export async function getUsers(adminId){
    const users = await usersRepository.getUsers(adminId);
    return users;
}

export async function deleteUser(id, adminId){
    const deleteCount = await usersRepository.deleteUser(id, adminId);
    return deleteCount;
}