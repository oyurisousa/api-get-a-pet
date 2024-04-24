const jwt = require("jsonwebtoken")

const User = require("../models/User")
const env = require("../env")


const getUserByToken = async (token) => {
    if (!token) {
        return res.status(401).json({ message: "acess denied!" })
    }
    const decoded = jwt.verify(token, env.WORD_SECRET)
    const userId = decoded.id
    const user = await User.findOne({ _id: userId })
    return user
}

module.exports = getUserByToken