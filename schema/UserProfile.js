import { Entity, Schema } from 'redis-om';
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

export async function addUserProfileData(dataList, userId, idField = 'userId') {
    const newDataList = await Promise.all(dataList.map(async (data) => {
        // Convert to object if it's an entity
        const dataObj = data.schemaDef != null ? data.toJSON() : data;
        const userProfile = await fetchUserProfileByUserId(userId != null ? userId : dataObj[idField]);
        return { ...dataObj, userProfile: userProfile.toJSON() }
    }))

    return newDataList;
}

export async function updateUserProfileDisplayPicture(userId, displayPicture) {
    const repo = await getUserProfileRepo();
    const userProfile = await fetchUserProfileByUserId(userId);
    userProfile.displayPicture = displayPicture;
    try {
        await repo.save(userProfile);
        return userProfile;
    } catch (e) {
        console.log(e)
        throw e;
    }
}
