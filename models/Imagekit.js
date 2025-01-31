const db = require("../config/db");
const imagekit = require("../config/imagekit.config");
const path = require("path");
const uuid = require("uuid");

class Imagekit {
  static async uploadImage(file) {
    const strFile = file.buffer.toString("base64");
    const fileName = uuid.v4() + path.extname(file.originalname);

    try {
      const response = await imagekit.upload({
        file: strFile,
        fileName: fileName,
      });
      return response;
    } catch (error) {
      console.error("Image upload error:", error);
      return null;
    }
  }

  static async deleteImage(fileId) {
    try {
      const response = await imagekit.deleteFile(fileId);
      return response;
    } catch (error) {
      console.error("Image delete error:", error);
      return null;
    }
  }
}

module.exports = Imagekit;
