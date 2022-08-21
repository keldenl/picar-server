import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from "passport";
import dotenv from 'dotenv';

import "./passport.js"

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const PORT = process.env.PORT || 9000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    name: 'picar-auth-session',
    secret: 'sajfkaj23jikl',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.json({ message: "You are not logged in" })
})

app.get("/failed", (req, res) => {
    res.send("Failed")
})
app.get("/success", isLoggedIn, (req, res) => {
    console.log(req.user);
    res.send(`Welcome ${req.user.email}`)
})

app.get('/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    })
);

app.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failed',
        successRedirect: '/success'
    }),
    function (req, res) {
        user = req.user;
        res.redirect('/success')
    }
);

app.get("/logout", (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`);
});