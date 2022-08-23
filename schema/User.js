import { Client, Entity, Schema, Repository } from 'redis-om';
import { clientConnect } from '../redisUtil.js';

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
    const client = await clientConnect();

    const repository = client.fetchRepository(userSchema)
    const user = repository.createEntity(data);

    const id = await repository.save(user);
    return id;
}

export async function getUserRepo() {
    const client = await clientConnect();
    const repository = new Repository(userSchema, client);
    return repository;
}

export async function fetchUserById(userId) {
    const client = await clientConnect();
    const repo = client.fetchRepository(userSchema);
    const user = await repo.fetch(userId);
    return { repo, user };
}

