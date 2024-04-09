/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} _res
 * @param {Function} next
 */
export function accesslogMiddleware(req, _res, next) {
    const datetime = new Date().toISOString()
    console.log(`${datetime} - [${req.method}] ${req.path} - from ${req.ip}`)
    next()
}