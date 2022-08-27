import { Entity, Schema } from 'redis-om';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';

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
    return await fetchEntityById(requestSchema, postId);
}

export async function fetchRequestByUserFromId(userFromId) {
    try {
        const requestRepo = await getRequestRepo();
        const requests = await requestRepo.search()
            .where('userFromId').eq(userFromId)
            .return.all();
        return requests;
    } catch (error) {
        throw error;
    }
}

export async function fetchRequestByUserToId(userToId) {
    try {
        const requestRepo = await getRequestRepo();
        const requests = await requestRepo.search()
            .where('userToId').eq(userToId)
            .return.all();
        return requests;
    } catch (error) {
        throw error;
    }
}
