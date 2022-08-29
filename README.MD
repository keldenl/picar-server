# Picar

Photo sharing social media with friends reimagined, combining privacy and flexibility. See photos from friends, not from advertisers or influencers.

![ariana profile page example](./docs/ariana-profile.png)
*Example Ariana Grande profile page*

**NOTE: FRONT END CODE LIVES [HERE](https://github.com/keldenl/picar)**

# Overview video (Optional)

Here's a short video that explains the project and how it uses Redis:

[![Embed your YouTube video](https://i.ytimg.com/vi/vyxdC1qK4NE/maxresdefault.jpg)](https://www.youtube.com/watch?v=vyxdC1qK4NE)

## How it works

### How the data is stored:
There are several different schemas of entites that we store. They are all available in more detail at `/schema/<ENTITY_HERE>`. 

*Note: The app only supports logging in with Google.*

1. `User`: Main user entity
    - Fields
        - `sub (string)`: The unique idenfier for each user Google gives
        - `email (string)`: Email of the user. Also provided by Google.
        - `username (string)`: Username that represents the user. This is by default first name + last name's initial (provided by Google). This can be changed afterwards.
        - `friendIds (string[])`: String array of friends (by userId) that this user has.
2. `UserProfile`: Additional user information quickly accessed to display profile information by userId (such as username, display picture)
    - Fields
        - `userId (string)`: The id of the user associated
        - `username (string)`: Username that represents the user. This is by default first name + last name's initial (provided by Google). This can be changed afterwards.
        - `displayPicture (string)`: Display picture shown next to the user's username. Stored in base64.
3. `Post`: Represents a picture post by a user
    - Fields
        - `userId (string)`: The id of the user associated
        - `data (string)`: Picture data for the post. Stored in base64.
        - `datePosted (date)`: The date the picture was posted.
        - `description (string, optional)`: A string description of the post.
        - `likers (string[])`:  String array of users (by userId) who have liked this post.
4. `Request`: Represents a friend request made by one user to another
    - Fields
        - `userFromId (string)`: The id of the user who sent the friend request.
        - `userToId (string)`: The id of the user who received the friend request.
        - `dateRequested (date)`: The date the friend request was sent.
### How the data is accessed:
We used `redis-om` to implement the schemas, entities, and the searches. Here are 2 examples of the core data accessing we did.

- Get a user's posts
    - Line 180 on `/index.js`
    - ```
      const userId = await fetchUserIdByUsername(username);

      // Pasting fetchUserIdByUsername implementation
      // userRepo.search()
      //      .where('username').eq(username)
      //      .return.first();


      const posts = await fetchPostByUserId(userId);

      // Pasting fetchPostByUserId implementation
      // const posts = await postRepo.search()
      //     .where('userId').eq(userId)
      //     .sortBy('datePosted', 'DESC')
      //     .returnPage(page, offset);
      // const postsWithProfile = await addUserProfileData(posts)
      // return postsWithProfile;

      return posts; // all the user's posts

- Adding user profile data to any object
    -  One tricky thing that we had to do is to get user profile data (username, display picture) whenever we retrieved other entites, like posts or friend requests (which only have userId)
    - **Solution:** Append the `UserProfile` entity to each entity that requires it by querying for the userId in the `UserProfile` schema
        - ```
          // First, fetch the UserProfile from userId
          const userProfile = await userProfileRepo.search()
            .where('userId').eq(userId)
            .return.first();

          // (Simplified)
          // Fetch userProfile and return the original data appended with the UserProfile
          const userProfile = await fetchUserProfileByUserId(data.userId);
          return { ...data, userProfile }
        
### Performance Benchmarks
N/A

## How to run it locally?

[Make sure you test this with a fresh clone of your repo, these instructions will be used to judge your app.]
1. Set up all your environment variables locally (create a `.env` file with all these keys with proper values)
    - REDIS setup: These should be self explanatory, connect to the Redis Cloud Stack with these
        - REDIS_HOST
        - REDIS_PORT
        - REDIS_PASSWORD
    - Google OAuth Setup: You'll need to set up a new Google App project and get the OAuth credentials
        - GOOGLE_CLIENT_ID
        - GOOGLE_SECRET
    - Since the FRONT END ([git repo here](https://github.com/keldenl/picar)) is hosted separately from the server (this repo), we must allow CORS for specifically the FE domain. Do so with the following env variable.
        - ALLOW_ORIGIN
2. Install all your dependencies with `yarn`
3. `git clone` [the frontend as well](https://github.com/keldenl/picar)
4. Run `yarn start` for `picar-server`
5. Run `yarn start` for `picar`
6. Go to `localhost` to test it out!

### Prerequisites

N/A

### Local installation

Similar steps to above's `How to run it locally?`, but run `yarn deploy` for the [front end](https://github.com/keldenl/picar).

## Deployment

To make deploys work, you need to create free account on [Redis Cloud](https://redis.info/try-free-dev-to)

### Google Cloud Run

[Insert Run on Google button](https://cloud.google.com/blog/products/serverless/introducing-cloud-run-button-click-to-deploy-your-git-repos-to-google-cloud)

### Heroku

[Insert Deploy on Heroku button](https://devcenter.heroku.com/articles/heroku-button)

### Netlify

[Insert Deploy on Netlify button](https://www.netlify.com/blog/2016/11/29/introducing-the-deploy-to-netlify-button/)

### Vercel

[Insert Deploy on Vercel button](https://vercel.com/docs/deploy-button)

## More Information about Redis Stack

Here some resources to help you quickly get started using Redis Stack. If you still have questions, feel free to ask them in the [Redis Discord](https://discord.gg/redis) or on [Twitter](https://twitter.com/redisinc).

### Getting Started

1. Sign up for a [free Redis Cloud account using this link](https://redis.info/try-free-dev-to) and use the [Redis Stack database in the cloud](https://developer.redis.com/create/rediscloud).
1. Based on the language/framework you want to use, you will find the following client libraries:
    - [Redis OM .NET (C#)](https://github.com/redis/redis-om-dotnet)
        - Watch this [getting started video](https://www.youtube.com/watch?v=ZHPXKrJCYNA)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-dotnet/)
    - [Redis OM Node (JS)](https://github.com/redis/redis-om-node)
        - Watch this [getting started video](https://www.youtube.com/watch?v=KUfufrwpBkM)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-node/)
    - [Redis OM Python](https://github.com/redis/redis-om-python)
        - Watch this [getting started video](https://www.youtube.com/watch?v=PPT1FElAS84)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-python/)
    - [Redis OM Spring (Java)](https://github.com/redis/redis-om-spring)
        - Watch this [getting started video](https://www.youtube.com/watch?v=YhQX8pHy3hk)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-spring/)

The above videos and guides should be enough to get you started in your desired language/framework. From there you can expand and develop your app. Use the resources below to help guide you further:

1. [Developer Hub](https://redis.info/devhub) - The main developer page for Redis, where you can find information on building using Redis with sample projects, guides, and tutorials.
1. [Redis Stack getting started page](https://redis.io/docs/stack/) - Lists all the Redis Stack features. From there you can find relevant docs and tutorials for all the capabilities of Redis Stack.
1. [Redis Rediscover](https://redis.com/rediscover/) - Provides use-cases for Redis as well as real-world examples and educational material
1. [RedisInsight - Desktop GUI tool](https://redis.info/redisinsight) - Use this to connect to Redis to visually see the data. It also has a CLI inside it that lets you send Redis CLI commands. It also has a profiler so you can see commands that are run on your Redis instance in real-time
1. Youtube Videos
    - [Official Redis Youtube channel](https://redis.info/youtube)
    - [Redis Stack videos](https://www.youtube.com/watch?v=LaiQFZ5bXaM&list=PL83Wfqi-zYZFIQyTMUU6X7rPW2kVV-Ppb) - Help you get started modeling data, using Redis OM, and exploring Redis Stack
    - [Redis Stack Real-Time Stock App](https://www.youtube.com/watch?v=mUNFvyrsl8Q) from Ahmad Bazzi
    - [Build a Fullstack Next.js app](https://www.youtube.com/watch?v=DOIWQddRD5M) with Fireship.io
    - [Microservices with Redis Course](https://www.youtube.com/watch?v=Cy9fAvsXGZA) by Scalable Scripts on freeCodeCamp