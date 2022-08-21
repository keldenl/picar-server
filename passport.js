

import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import dotenv from 'dotenv';
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
    function (request, accessToken, refreshToken, profile, done) {
        console.log(profile)
        return done(null, profile);
    }
));


// client id: 
// 585814122874-0r98jj6bhtgdiasvljepern1p41j5ntl.apps.googleusercontent.com
// secret: 
// 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