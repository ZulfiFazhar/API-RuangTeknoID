const imagekit = require("../config/imagekit.config");
const path = require("path");
const uuid = require("uuid");
const Imagekit = require("../models/Imagekit");

class ImagekitController {
  static async uploadImage(req, res) {
    if (req.file) {
      // responseData = await imagekit.upload({
      //     file : strFile,
      //     fileName : fileName,
      //     // checks: {file.size :  "1mb"}, // To run server side checks before uploading files. Notice the quotes around file.size and 1mb.
      // }, function(error, result) {
      //     if(error) console.log(error);
      //     else console.log(result);
      // });

      const response = await Imagekit.uploadImage(req.file);

      if (response) {
        return res.status(200).json({
          status: "success",
          message: "Image uploaded successfully",
          data: response,
        });
      }

      return res.status(400).json({
        status: "error",
        message: "Error uploading image",
      });
    }

    return res.status(400).json({
      status: "error",
      message: "Image not found",
    });
  }

  static async deleteImage(req, res) {
    const fileId = req.params.fileId;

    const response = await Imagekit.deleteImage(fileId);

    if (response) {
      return res.status(200).json({
        status: "success",
        message: "Image deleted successfully",
        data: response,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Error deleting image",
      error: error,
    });
  }
}

module.exports = ImagekitController;
