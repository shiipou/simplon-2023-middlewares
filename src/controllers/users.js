import { User } from "../models/User.js";

export function getUserByIdController(req, res) {
    const requestedId = req.params.id
    const user = User.findById(requestedId)
    if(user) {
        res.json({ id: user.id, username: user.username })
    } else {
        res.status(404).json({ error: 'User not found' })
    }
}

export function getCurrentUser(req, res) {
    const user = req.user
    if(user) {
        res.json({ id: user.id, username: user.username })
    }
}
