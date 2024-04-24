import User from "../models/User.js"
import { generateUserToken } from "../services/jwt.js"

export async function loginController(req, res) {
    const { username, password } = req.body

    // Trouver l'utilisateur avec ce mot de passe et username
    const user = await User.findByUsernameAndPassword(username, password)
    if(user) {
        const token = generateUserToken(user)
        res.json({ token: token })
    } else {
        res.status(401).json({ error: true, message: 'Invalid credentials' })
    }
}

export async function signinController(req, res) {
    const { name, username, password } = req.body

    if(!username || !password){
        return res.status(400).json({error: true, message: 'You must specify a "username" and a "password" : {"username: "test", "name": "Test", "password": "test#123"}'})
    }
    const user = new User(username, name, password)
    const newUser = await user.save()
        .catch(error => {
            console.error(error)
            res.status(422).json({ error: true, message: error.message })
        })

    console.log(newUser)
    if(newUser) {
        const token = generateUserToken(newUser)
        res.json({ token: token })
    }
}