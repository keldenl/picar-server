import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';
import { userSchema } from './schemas/User.js';
import { clientConnect } from './passport.js';


if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export async function createIndex() {
    const client = await clientConnect();


    const repository = new Repository(userSchema, client);
    await repository.createIndex()
}