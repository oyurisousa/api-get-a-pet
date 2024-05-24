const path = require("node:path")
const fs = require("node:fs")


function verifyIfFolderExistsAndCreate(pathFolder) {
  if (!fs.existsSync(pathFolder)) {
    fs.mkdirSync(pathFolder, { recursive: true });
  }
}

module.exports = {
  verifyIfFolderExistsAndCreate
}