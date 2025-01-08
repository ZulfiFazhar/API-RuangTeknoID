// controllers/PostController.js
const Post = require("../models/Post");

class PostController {
  static async createPost(req, res) {
    const { userId } = req.user;
    const { title, content } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const postId = await Post.createPost({ userId, title, content });
      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: { postId },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async createPostWithHashtags(req, res) {
    const { userId } = req.user;
    const { title, content, hashtags } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const postId = await Post.createPost({ userId, title, content });

      if (hashtags.length > 0) {
        hashtags.forEach(async (hashtag) => {
          await Post.addHashtag(postId, hashtag);
        });
      }

      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: { postId },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getPostById(req, res) {
    const { postId } = req.params;

    try {
      const post = await Post.findPostById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(200).json({
        status: "success",
        message: "Post retrieved successfully",
        data: post,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getAllPosts(req, res) {
    try {
      const posts = await Post.findAllPosts();
      res.status(200).json({
        status: "success",
        message: "All posts fetched successfully",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updatePostById(req, res) {
    const { postId } = req.params;
    const { title, content } = req.body;

    try {
      const updated = await Post.editPostById(postId, { title, content });
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async deletePostById(req, res) {
    const { postId } = req.params;

    try {
      const deleted = await Post.deletePostById(postId);
      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Post ${postId} deleted successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async votes(req, res) {
    const { postId } = req.params;
    let { vote } = req.body;

    // cast vote to integer
    let intVote = parseInt(vote);

    try {
      const updated = await Post.votes(postId, intVote);
      if (!updated) {
        console.log("tes");
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Votes for post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async addView(req, res) {
    const { postId } = req.params;

    try {
      const updated = await Post.addView(postId);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Views for post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async addHashtag(req, res) {
    const { postId } = req.params;
    const hashtagId = parseInt(req.body.hashtagId);
    const { userId } = req.user;

    // Check if user is the owner of the post
    const post = await Post.findPostById(postId);
    if (post.userId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to add hashtag to this post",
      });
    }

    try {
      const updated = await Post.addHashtag(postId, hashtagId);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found / Hashtag already added to post",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Hashtag added to post",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async searchPostsByKeyword(req, res) {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Keyword is required for searching posts",
      });
    }

    try {
      const posts = await Post.searchByKeyword(keyword);
      if (posts.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No article found matching the keyword",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Articles found",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
}

module.exports = PostController;
