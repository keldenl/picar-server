import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';
import { userSchema } from './schema/User.js';
import { clientConnect } from './redisUtil.js';
import { postSchema } from './schema/Post.js';


if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export async function createIndex() {
    const client = await clientConnect();

    const repository = new Repository(postSchema, client);
    await repository.createIndex()
}