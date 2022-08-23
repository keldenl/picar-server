import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from "passport";
import dotenv from 'dotenv';
import { Client, Entity, Schema, Repository } from 'redis-om';


import "./passport.js"
import { getUserRepo, fetchUserById } from './schema/user.js';
import { createIndex } from './createIndex.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const PORT = process.env.PORT || 9000;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// allow cross origin cookies
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
});

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


app.get("/profile", isLoggedIn, (req, res) => {
    res.json({ message: "You are  logged in", user: req.user })
})

app.get("/failed", (req, res) => {
    res.send("Failed")
})
app.get("/success", isLoggedIn, (req, res) => {
    res.redirect('http://localhost:3000/picar/profile')
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
        successRedirect: '/success',
        session: true
    }),
    function (req, res) {
        user = req.user;
        res.redirect('/success')
    }
);

app.get("/logout", (req, res, next) => {
    // req.session = null;
    req.logout(function (err) {
        if (err) { return next(err); }
        // res.json({ message: 'Logged out' })
        res.redirect('http://localhost:3000/picar')
    });
})


// admin only
app.get("/createIndex", (req, res) => {
    createIndex().then(() => {
        res.send('Indexes created');
    })
})

app.get("/users", async (req, res) => {
    const userRepo = await getUserRepo();
    const users = await userRepo.search()
        .return.all();
    return res.status(202).json({ users });
})

app.get("/updateUser", isLoggedIn, async (req, res) => {
    const { entityId: userId } = req.user
    const { repo, user } = await fetchUserById(userId);
    user.username = 'swaglord'
    console.log(user);
    await repo.save(user);
    return res.status(202).json({ user });
})

app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`);
});