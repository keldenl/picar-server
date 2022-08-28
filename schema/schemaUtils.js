import { Repository } from 'redis-om';
import { clientConnect } from '../redisUtil.js';

export async function createEntity(schema, data) {
    const client = await clientConnect();

    const repository = client.fetchRepository(schema)
    const post = repository.createEntity(data);

    const id = await repository.save(post);
    return { id, ...data };
}

export async function getEntityRepo(schema) {
    const client = await clientConnect();
    return client.fetchRepository(schema);
}

export async function fetchEntityById(schema, id) {
    const client = await clientConnect();
    const repo = client.fetchRepository(schema);
    const entity = await repo.fetch(id);
    return { repo, entity };
}

