const multer = require("multer")
const path = require("path")
const fs = require('node:fs')
const { verifyIfFolderExistsAndCreate } = require("./verify-if-folder-exists-and-create")



const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = ''

        if (req.baseUrl.includes("users")) {
            folder = "users"

        } else if (req.baseUrl.includes("pets")) {
            folder = "pets"
        }
        const pathDestination = path.join(__dirname, '..', 'public', 'images', folder)

        verifyIfFolderExistsAndCreate(path.join(pathDestination))

        cb(null, pathDestination)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname))
    }
})

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error("please, only send images with jpg, png or jpeg!"))
        }
        cb(undefined, true)
    }
})

module.exports = { imageUpload } 