import { Entity, Schema } from 'redis-om';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';
import { createUserProfile } from './UserProfile.js';


class User extends Entity { }
export let userSchema = new Schema(
    User,
    {
        sub: { type: 'string' },
        email: { type: 'string', textSearch: true },
        username: { type: 'string', textSearch: true },
        friendIds: { type: 'string[]' }
    },
    {
        dataStructure: 'JSON',
    }
);


export async function createUser(data) {
    const defaultValues = {
        friendIds: []
    }
    const newUser = await createEntity(userSchema, { ...defaultValues, ...data });
    console.log(newUser)
    createUserProfile({
        userId: newUser.id,
        username: newUser.username
    }).then(() => {
        return newUser;
    }).catch((e) => { throw e; })
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