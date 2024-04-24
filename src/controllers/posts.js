import Post from "../models/Post.js";

export async function getPostByIdController(req, res) {
    const requestedId = Number(req.params.id)
    const post = await Post.findById(requestedId)
    if(post) {
        res.json(post)
    } else {
        res.status(404).json({ error: 'Post not found' })
    }
}

export async function getCurrentUserPostsController(req, res) {
    const requestedId = req.user.id
    const posts = await Post.findByOwner(requestedId)
    if(posts) {
        res.json(posts)
    } else {
        res.status(404).json({ error: 'Post not found' })
    }
}

export async function getTrendingPostsController(req, res) {
    const posts = await Post.findTrending()
    if(posts) {
        res.json(posts)
    }
}
export async function getNewestPostsController(req, res) {
    const posts = await Post.findNewest()
    if(posts) {
        res.json(posts)
    }
}

export async function createNewPostController(req, res) {
    const user = req.user
    const data = req.body
    const post = new Post(user.id, data.content)
    const savedPost = await post.save()
    if(savedPost){
        res.json(savedPost)
    }
}