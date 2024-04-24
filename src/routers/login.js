import express from 'express'

import { loginController, signinController } from '../controllers/login.js'

const router = express.Router()

router.post('/login', loginController)
router.post('/register', signinController)

export default router
