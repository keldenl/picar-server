import { Entity, Schema } from 'redis-om';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';
import { fetchUserById } from './User.js';
import { addUserProfileData } from './UserProfile.js';

class Request extends Entity { }
export let requestSchema = new Schema(
    Request,
    {
        userFromId: { type: 'string' },
        userToId: { type: 'string' },
        dateRequested: { type: 'date' },
    },
    {
        dataStructure: 'JSON',
    }
);

export async function createRequest(data) {
    const currentDate = new Date();
    const defaultValues = {
        dateRequested: currentDate,
    }
    return await createEntity(requestSchema, { ...defaultValues, ...data });
}

export async function getRequestRepo() {
    return await getEntityRepo(requestSchema);
}

export async function fetchRequestById(requestId) {
    return await fetchEntityById(requestSchema, requestId);
}

// Get requesets that userId sent
export async function fetchRequestsByUserFromId(userFromId) {
    try {
        const requestRepo = await getRequestRepo();
        const requests = await requestRepo.search()
            .where('userFromId').eq(userFromId)
            .return.all();

        const requestWithProfile = await addUserProfileData(requests, undefined, 'userToId');
        return requestWithProfile;
    } catch (error) {
        throw error;
    }
}

// Get requests that are being sent to userId
export async function fetchRequestsByUserToId(userToId) {
    try {
        const requestRepo = await getRequestRepo();
        const requests = await requestRepo.search()
            .where('userToId').eq(userToId)
            .return.all();

        const requestWithProfile = await addUserProfileData(requests, undefined, 'userFromId');
        return requestWithProfile;
    } catch (error) {
        throw error;
    }
}

export async function removeRequestById(requestId, userId) {
    const { repo: requestRepo, entity: requestEntity } = await fetchRequestById(requestId);
    const { userFromId, userToId } = requestEntity;

    // TODO: Make separate routes from "reject" and "cancel" and do better validation on the user to/from
    if (userFromId !== userId && userToId !== userId) {
        throw new Error("User is not authorized to remove this request")
    }

    return await requestRepo.remove(requestId);
}

export async function acceptRequest(requestId, userId) {
    const { repo: requestRepo, entity: requestEntity } = await fetchRequestById(requestId);
    const { userFromId, userToId } = requestEntity;

    if (userFromId == null || userToId == null) {
        console.log('one of them is null')
        throw new Error("The friend request you're trying to accept doesn't exist or is corrupted")
    }


    // only the user who received the requeset can accept the friend request
    if (userToId !== userId) {
        throw new Error("User is not authorized to accept this request");
    }

    // Add to each other's friend list
    const { repo, entity: user } = await fetchUserById(userFromId);
    user.friendIds.push(userToId);
    await repo.save(user);

    const { entity: friend } = await fetchUserById(userToId);
    friend.friendIds.push(userFromId);
    await repo.save(friend);

    // Remove the request from pending
    await requestRepo.remove(requestId);

    return { userFromId, userToId, requestId }
}