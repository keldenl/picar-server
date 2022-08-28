import { Entity, Schema } from 'redis-om';
import { createEntity, fetchEntityById, getEntityRepo } from './schemaUtils.js';
import { addUserProfileData } from './UserProfile.js';

class Post extends Entity { }
export let postSchema = new Schema(
    Post,
    {
        userId: { type: 'string' },
        data: { type: 'string' },
        datePosted: { type: 'date', sortable: true },
        description: { type: 'string', textSearch: true },
        likers: { type: 'string[]' }
    },
    {
        dataStructure: 'JSON',
    }
);

export async function createPost(data) {
    const currentDate = new Date();
    const defaultValues = {
        datePosted: currentDate,
        description: '',
        likers: []
    }
    return await createEntity(postSchema, { ...defaultValues, ...data });
}

export async function getPostRepo() {
    return await getEntityRepo(postSchema);
}

export async function fetchPostById(postId) {
    return await fetchEntityById(postSchema, postId);
}

export async function fetchPostByUserId(userId, page = 0, offset = 10) {
    try {
        const postRepo = await getPostRepo();
        const posts = await postRepo.search()
            .where('userId').eq(userId)
            .sortBy('datePosted', 'DESC')
            .returnPage(page, offset);
        const postsWithProfile = await addUserProfileData(posts)
        return postsWithProfile;
    } catch (error) {
        throw error;
    }
}
