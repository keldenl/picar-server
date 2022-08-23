import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';

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

const client = await clientConnect();

async function redisJSONDemo() {
    try {
        const TEST_KEY = 'test_node';

        // RedisJSON uses JSON Path syntax. '.' is the root.
        // await client.json.set(TEST_KEY, '.', { node: 4303 });
        const value = await client.execute(['GET', TEST_KEY]);

        console.log(`value of node: ${value}`);

        // const searchResults = await redis.performSearch(
        //     redis.getKeyName('usersidx'),
        //     '@name:foo',
        // );

        await client.close();
    } catch (e) {
        console.error(e);
    }
}

redisJSONDemo();

// Passport setup
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:9000/google/callback",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, profile);
    }
));