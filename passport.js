import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { clientConnect } from './redisUtil.js';
import { createUser, getUserRepo } from './schema/user.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

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
    async function (request, accessToken, refreshToken, profile, done) {
        const { email, sub, given_name, family_name } = profile;

        const userRepo = await getUserRepo();
        const user = await userRepo.search()
            .where('sub').eq(sub)
            .and('email').eq(email)
            .return.first();

        // user already exists
        if (user != null) {
            // there should be only one user
            const existingUser = user.toJSON();
            console.log('user exists: ', existingUser)
            return done(null, existingUser)
        }
        // create a new user in the database
        else {
            const newUserData = {
                email,
                sub,
                username: `${given_name}${family_name.length ? family_name[0] : ''}`
            }
            console.log(newUserData);
            try {
                const entityId = await createUser(newUserData);
                console.log('created new user at ' + entityId);
                return done(null, { entityId, ...newUserData })
            } catch (e) {
                return done(e, ...newUserData);
            }
        }

    }
));