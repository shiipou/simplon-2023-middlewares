import { User } from "../models/User.js"
import { verifyUserToken } from "../services/jwt.js"

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {Function} next 
 */
export async function requireAuthToken(req, res, next) {
    const token = req.headers.authorization
    const userPayload = await verifyUserToken(token)
    console.log('UserPayload', userPayload)

    req.user = User.findById(userPayload.id)

    next()
}