import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from "passport";
import dotenv from 'dotenv';
import "./passport.js"

import { getUserRepo, fetchUserById, fetchUserIdByUsername, fetchUserByUsername, fetchFriendListByUserId } from './schema/User.js';
import { createIndex } from './createIndex.js';
import { createPost, fetchFriendPostsByUserId, fetchPostByUserId } from './schema/Post.js';
import { acceptRequest, createRequest, fetchRequestsByUserFromId, fetchRequestsByUserToId, removeRequestById } from './schema/Request.js';
import { fetchUserProfileByUserId, updateUserProfileDisplayPicture } from './schema/UserProfile.js';
import { clientConnect } from './redisUtil.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

await clientConnect()

const PORT = process.env.PORT || 9000;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// allow cross origin cookies
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
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


app.get("/profile", isLoggedIn, async (req, res) => {
    res.json({ message: "You are  logged in", user: req.user })
})

app.get("/failed", (req, res) => {
    res.send("Failed")
})
app.get("/success", isLoggedIn, (req, res) => {
    res.redirect(`${process.env.ALLOW_ORIGIN}/picar/`)
    // go to home for now profile/${req.user.username}
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
        res.redirect(`${process.env.ALLOW_ORIGIN}/picar`)
    });
})


// admin only
app.get("/createIndex", (req, res) => {
    createIndex().then(() => {
        res.send('Indexes created');
    })
})

// user routes
// app.get("/users", async (req, res) => {
//     const userRepo = await getUserRepo();
//     const users = await userRepo.search()
//         .return.all();
//     return res.status(202).json({ message: error.message });
// })

app.get('/users/:username', async (req, res) => {
    const { username } = req.params
    try {
        const user = await fetchUserByUsername(username);
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.get('/users/friends/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const friendList = await fetchFriendListByUserId(userId);
        return res.status(200).json(friendList);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.get('/users/id/:username', async (req, res) => {
    const { username } = req.params
    try {
        const userId = await fetchUserIdByUsername(username);
        return res.status(200).json({ userId });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.post("/updateUsername", isLoggedIn, async (req, res) => {
    const { username: newUsername } = req.body
    const { entityId: userId } = req.user

    const { repo, entity: user } = await fetchUserById(userId);
    user.username = newUsername;
    await repo.save(user);

    const userProfile = await fetchUserProfileByUserId(userId);
    userProfile.username = newUsername;
    await repo.save(userProfile);

    req.session.passport.user.username = newUsername
    return res.status(202).json({ user, userProfile });
})

// posts routes
app.post("/upload", isLoggedIn, async (req, res) => {
    const { uploadImg: data, description } = req.body
    const { entityId: userId } = req.user
    try {
        const newPost = await createPost({ data, userId, ...(description ? { description } : {}) });
        return res.status(201).json(newPost)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.get('/posts/:username', async (req, res) => {
    const { username } = req.params
    try {
        const userId = await fetchUserIdByUsername(username);
        const posts = await fetchPostByUserId(userId);
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.get('/feed', isLoggedIn, async (req, res) => {
    const { entityId: userId } = req.user

    try {
        const posts = await fetchFriendPostsByUserId(userId);
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// friend requests routes
app.get('/requests/sent', isLoggedIn, async (req, res) => {
    const { entityId: userFromId } = req.user
    try {
        const requests = await fetchRequestsByUserFromId(userFromId);
        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.get('/requests/received', isLoggedIn, async (req, res) => {
    const { entityId: userFromId } = req.user
    try {
        const requests = await fetchRequestsByUserToId(userFromId);
        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.post("/sendRequest", isLoggedIn, async (req, res) => {
    const { reqUserId, reqUsername } = req.body
    const { entityId: userFromId } = req.user
    try {
        if (reqUserId == null && reqUsername == null) {
            throw new Error("There is no user that's being friend requested")
        }
        // if we only passed the username, get the user id first
        const userToId = reqUserId != null ? reqUserId : await fetchUserIdByUsername(reqUsername);
        const newRequest = await createRequest({ userFromId, userToId });
        return res.status(201).json(newRequest)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.post('/requests/accept', isLoggedIn, async (req, res) => {
    const { entityId: userId } = req.user;
    const { requestId } = req.body;
    try {
        if (requestId == null) {
            throw new Error("Missing requestId to accept");
        }
        const response = await acceptRequest(requestId, userId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

app.post('/requests/delete', isLoggedIn, async (req, res) => {
    const { entityId: userId } = req.user;
    const { requestId } = req.body;
    try {
        if (requestId == null) {
            throw new Error("Missing requestId to accept");
        }
        // TODO: Make separate routes from "reject" and "cancel" and do better validation on the user to/from
        const response = await removeRequestById(requestId, userId);
        return res.status(200).json({ ...response, message: 'Successfully deleted the request' });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// user profile routes
app.post("/updateDisplayPicture", isLoggedIn, async (req, res) => {
    const { uploadImg: displayPicture } = req.body
    const { entityId: userId } = req.user
    try {
        const newUserProfile = await updateUserProfileDisplayPicture(userId, displayPicture);
        return res.status(201).json(newUserProfile)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})


app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`);
});