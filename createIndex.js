import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';
import { userSchema } from './schema/User.js';
import { clientConnect } from './redisUtil.js';
import { requestSchema } from './schema/Request.js';
import { userProfileSchema } from './schema/UserProfile.js';
import { postSchema } from './schema/Post.js';


if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export async function createIndex() {
    const client = await clientConnect();

    const repository = new Repository(userSchema, client);
    await repository.createIndex()
}