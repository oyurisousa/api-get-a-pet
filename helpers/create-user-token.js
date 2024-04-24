const jwt = require("jsonwebtoken")
const env = require("../env")
const creatUserToken = async (user, req, res) => {
    //create a token
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, env.WORD_SECRET)

    //return token
    res.status(200).json({
        message: "You are authenticated!",
        token: token,
        userId: user._id
    })
}


module.exports = creatUserToken