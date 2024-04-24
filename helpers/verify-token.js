const jwt = require("jsonwebtoken")
const getToken = require("./get-token")
const env = require("../env")
const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({
            message: "not authorized!"
        })
    }
    const token = getToken(req)
    if (!token) {
        return res.status(401).json({
            message: "acess denied!"
        })
    }

    try {
        const verified = jwt.verify(token, env.WORD_SECRET)
        req.user = verified
        next()
    } catch (error) {
        return res.status(400).json({
            message: "invalid token"
        })
    }


}
module.exports = verifyToken