
const mongoose = require("mongoose")
const env = require("../env")

async function main() {
    await mongoose.connect(env.DATABASE_URL)
    console.log("connected to mongoose")
}
main().catch((err) => console.log(err))

module.exports = mongoose