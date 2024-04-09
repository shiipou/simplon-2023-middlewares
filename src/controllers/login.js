import { User } from "../models/User.js"
import { generateUserToken } from "../services/jwt.js"

export function loginController(req, res) {
    console.log('Recieved', req.body)
    const { username, password } = req.body

    // Trouver l'utilisateur avec ce mot de passe et username
    const user = User.findByUsernameAndPassword(username, password)
    if(user) {
        const token = generateUserToken(user)
        res.json({ token: token })
    } else {
        res.status(401).json({ error: true, message: 'Invalid credentials' })
    }
}
