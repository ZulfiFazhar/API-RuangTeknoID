// controllers/HashtagController.js
const Hashtag = require("../models/Hashtag");

class HashtagController {
  static async createHashtag(req, res) {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Hashtag name is required" });
    }

    try {
      const hashtagId = await Hashtag.createHashtag(name);
      res.status(201).json({
        status: "success",
        message: "Hashtag created successfully",
        data: { hashtagId },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getAllHashtags(req, res) {
    try {
      const hashtags = await Hashtag.findAllHashtags();
      res.status(200).json({
        status: "success",
        message: "All hashtags fetched successfully",
        data: hashtags,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getHashtagsByPostId(req, res) {
    const { postId } = req.params;

    try {
      const hashtags = await Hashtag.findHashtagByPostId(postId);
      res.status(200).json({
        status: "success",
        message: "All post hashtags fetched successfully",
        data: hashtags,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = HashtagController;
