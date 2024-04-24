import express from 'express'

import { getTrendingPostsController, getNewestPostsController, getPostByIdController, createNewPostController } from '../controllers/posts.js'
import { requireAuthToken } from '../middlewares/authToken.js'

const router = express.Router()

router.get('/posts/trending', getTrendingPostsController)
router.get('/posts/newest', getNewestPostsController)
router.get('/post/:id', getPostByIdController)
router.post('/post', requireAuthToken, createNewPostController)

export default router
