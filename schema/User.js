import { Entity, Schema } from 'redis-om';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';
import { addUserProfileData, createUserProfile } from './UserProfile.js';


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
    const { entity: userProfile } = await createUserProfile({
        userId: newUser.id,
        username: newUser.username
    })
    return { ...newUser, userProfile }
}

export async function getUserRepo() {
    return await getEntityRepo(userSchema);
}

export async function fetchUserById(userId) {
    return await fetchEntityById(userSchema, userId);
}

export async function fetchUserByUsername(username) {
    try {
        const userRepo = await getUserRepo();
        const user = await userRepo.search()
            .where('username').eq(username)
            .return.first();

        const userWithProfile = await addUserProfileData([user], user.entityId);
        return userWithProfile[0];
    } catch (error) {
        throw error;
    }
}

export async function fetchUserIdByUsername(username) {
    try {
        const userRepo = await getUserRepo();
        const user = await userRepo.search()
            .where('username').eq(username)
            .return.first();

        return user.entityId;
    } catch (error) {
        throw error;
    }
}

export async function fetchFriendListByUserId(userId) {
    try {
        const { entity: user } = await fetchUserById(userId);
        const friendIds = user.toJSON().friendIds.map(id => {
            return { userId: id }
        })
        const friendIdsWithProfile = await addUserProfileData(friendIds);
        return friendIdsWithProfile;
    } catch (error) {
        throw error;
    }
}