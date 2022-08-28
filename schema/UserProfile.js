import { Client, Entity, Schema, Repository } from 'redis-om';
import { clientConnect } from '../redisUtil.js';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';

class UserProfile extends Entity { }
export let userProfileSchema = new Schema(
    UserProfile,
    {
        userId: { type: 'string' },
        username: { type: 'string' },
        displayPicture: { type: 'string' },
    },
    {
        dataStructure: 'JSON',
    }
);

export async function createUserProfile(data) {
    return await createEntity(userProfileSchema, data);
}

export async function getUserProfileRepo() {
    return await getEntityRepo(userProfileSchema);
}

export async function fetchUserProfileById(userProfileId) {
    return await fetchEntityById(userProfileSchema, userProfileId);
}

export async function fetchUserProfileByUserId(userId) {
    try {
        const userProfileRepo = await getUserProfileRepo();
        const userProfile = await userProfileRepo.search()
            .where('userId').eq(userId)
            .return.first();
        return userProfile;
    } catch (error) {
        throw error;
    }
}

export async function updateUserProfileByUserId(userId, data) {
    const { repo, entity: userProfile } = await fetchUserProfileByUserId(userId);
    const newUserProfile = { ...userProfile, ...data };
    userProfile = newUserProfile;
    await repo.save(userProfile).then(() => {
        return userProfile
    }).catch((e) => {
        throw e;
    })
}

