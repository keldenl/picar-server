import { Client, Entity, Schema, Repository } from 'redis-om';

class User extends Entity { }
export let userSchema = new Schema(
    User,
    {
        sub: { type: 'string' },
        email: { type: 'string', textSearch: true },
        username: { type: 'string', textSearch: true },
    },
    {
        dataStructure: 'JSON',
    }
);

export async function createUser(data) {
    await connect();

    const repository = client.fetchRepository(userSchema)
    const user = repository.createEntity(data);

    const id = await repository.save(user);
    return id;
}