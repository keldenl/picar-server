import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
export async function clientConnect() {
    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;
    const redisEndpointUri = `${REDIS_HOST}:${REDIS_PORT}`;

    const client = new Client()

    if (!client.isOpen()) {
        await client.open(`redis://:${REDIS_PASSWORD}@${redisEndpointUri}`);
    }
    return client;
}