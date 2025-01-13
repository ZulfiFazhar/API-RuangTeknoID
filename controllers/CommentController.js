// controllers/CommentController.js
const Comment = require("../models/Comment");

class CommentController {
  static async createComment(req, res) {
    const { userId } = req.user;
    const { postId } = req.params;
    const { replyTo, content } = req.body;

    if(!userId || !postId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newComment = await Comment.createCommentOrReply({
        userId,
        postId,
        replyTo,
        content,
      });
      return res.status(201).json({
        status: "success",
        message: "Comment or reply created successfully",
        data: newComment,
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getTopLevelCommentsByPostId(req, res) {
    const { postId } = req.params;

    try {
      const comments = await Comment.findTopLevelCommentsByPostId(postId);
      res.status(200).json({
        status: "success",
        message: "All top level comments fetched successfully",
        data: comments,
      });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
        });
    }
  }

  static async getRepliesByCommentId(req, res) {
    const { commentId } = req.params;

    try {
      const replies = await Comment.findReplyOfCommentByCommentId(commentId);
      return res.status(200).json({
        status: "success",
        message: "Replies fetched successfully",
        data: replies,
      });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
        });
    }
  }

  static async deleteComment(req, res) {
    const { commentId } = req.params;
    try {
      const commentDeleted = await Comment.deleteCommentByCommentId(commentId);
      if (!commentDeleted) {
        return res.status(404).json({ 
            status: "error",
            message: "Comment not found" 
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Comment deleted successfully",
      });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
        });
    }
  }
}

module.exports = CommentController;
