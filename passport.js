import dotenv from 'dotenv';
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { createUser, getUserRepo } from './schema/User.js';

let callbackURL = 'https://picar.onrender.com/google/callback/';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    callbackURL = "http://localhost:9000/google/callback";
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
    callbackURL,
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
            // REMOVE THIS | temp: testing adding userProfile. 
            // console.log('passing this into the update user profile', user.entityId, {
            //     userId: user.entityId,
            //     username: user.username
            // })
            // await createUserProfile({
            //     userId: user.entityId,
            //     username: user.username
            // }).then(() => {
            // there should be only one user
            const existingUser = user.toJSON();
            console.log('entity: ', user)
            console.log('user exists: ', existingUser)
            return done(null, existingUser)
            // })

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
                const newUser = await createUser(newUserData);
                console.log('created new user: ' + newUser);
                return done(null, newUser)
            } catch (e) {
                console.log(e);
                throw done(e, ...newUserData);
            }
        }

    }
));