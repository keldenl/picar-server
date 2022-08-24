import { Client, Entity, Schema, Repository } from 'redis-om';
import { clientConnect } from '../redisUtil.js';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';


class User extends Entity { }
export let userSchema = new Schema(
    User,
    {
        sub: { type: 'string', textSearch: true },
        email: { type: 'string', textSearch: true },
        username: { type: 'string', textSearch: true },
    },
    {
        dataStructure: 'JSON',
    }
);


export async function createUser(data) {
    return await createEntity(userSchema, data);
}

export async function getUserRepo() {
    return await getEntityRepo(userSchema);
}

export async function fetchUserById(userId) {
    return await fetchEntityById(userSchema, userId);
}

export async function fetchUserIdByUsername(username) {
    try {
        const userRepo = await getUserRepo();
        const users = await userRepo.search()
            .where('username').eq(username)
            .return.all();
        return users[0].entityId;
    } catch (error) {
        throw error;
    }
}
