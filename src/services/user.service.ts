import * as dao from '../dao/user.dao';
import { User } from '../types/User';

export const createUser = async (user: User) => {
    return await dao.createUser(user);
};

export const getUsers = async () => {
    return await dao.getUsers();
};

export const updateUser = async (id: string, updates: Partial<User>) => {
    return await dao.updateUser(id, updates);
};

export const deleteUser = async (id: string) => {
    return await dao.deleteUser(id);
};
