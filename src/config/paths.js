const path = require("path");

const ROOT_DIR = path.join(__dirname, "..", "..");

module.exports = {
  ROOT_DIR,
  PUBLIC_DIR: path.join(ROOT_DIR, "public"),
  MEDIA_DIR: path.join(ROOT_DIR, "media"),
  DATA_FILE: process.env.DATA_FILE || path.join(ROOT_DIR, "data", "store.json")
};
