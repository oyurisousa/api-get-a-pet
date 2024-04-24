const { match } = require("assert")
const multer  = require("multer")
const path = require("path")

//destination to store the images

const imageStorage = multer.diskStorage({
    destination: function(req,file, cb){
        let folder = ''

        if(req.baseUrl.includes("users")){
            folder = "users"
        }else if(req.baseUrl.includes("pets")){
            folder = "pets"
        }

        cb(null, `public/images/${folder}`)
    },
    filename: function(req, file, cb){
        cb(null, Date.now() +String(Math.floor(Math.random() * 1000))+ path.extname(file.originalname)) //34985839475984.jpg
    }
})

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error("please, only send images with jpg or png!"))
        }
        cb(undefined, true)
    }
})

module.exports = {imageUpload} 