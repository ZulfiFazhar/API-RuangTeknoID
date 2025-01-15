// controllers/DiscussionController.js
const Discussion = require("../models/Discussions");

class DiscussionController {
  static async getAllDiscussions(req, res) {
    try {
      const discussions = await Discussion.findAllDiscussions();
      res.status(200).json({
        status: "success",
        message: "All discussions fetched successfully",
        data: discussions,
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async getDiscussionById(req, res) {
    const { discussionId } = req.params;

    try {
      const discussion = await Discussion.findDiscussionById(discussionId);
      if (!discussion) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Discussion fetched successfully",
        data: discussion,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async getAllQuestions(req, res) {
    try {
      const questions = await Discussion.findAllQuestions();
      res.status(200).json({
        status: "success",
        message: "All questions fetched successfully",
        data: questions,
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async getQuestionsWithUD(req, res) {
    const { userId } = req.user;

    try {
      const questions = await Discussion.findAllQuestionsWithUD(userId);
      if(!questions) {
        return res.status(404).json({ 
            status: "error",
            message: "Invalid request",
            error: "Invalid request" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "All questions fetched successfully",
        data: questions,
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async getAnswersByDiscussionId(req, res) {
    const { discussionId } = req.params;

    try {
      const answers = await Discussion.findAnswersByDiscussionId(discussionId);
      res.status(200).json({
        status: "success",
        message: "Answers fetched successfully",
        data: answers,
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async getAnswersWithItUser(req, res) {
    const { discussionId } = req.params;

    try {
      const answers = await Discussion.findAnswersWithItUser(discussionId);
      res.status(200).json({
        status: "success",
        message: "Answers fetched successfully",
        data: answers,
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async createDiscussion(req, res) {
    const { userId } = req.user;
    const { title, content } = req.body;

    try {
      const discussionId = await Discussion.createDiscussion(userId, title, content);
      res.status(201).json({
        status: "success",
        message: "Discussion created successfully",
        data: { discussionId },
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async createAnswer(req, res) {
    const { userId } = req.user;
    const { answerTo, content } = req.body;

    console.log(answerTo, content)

    try {
      const answerId = await Discussion.createAnswer(userId, answerTo, content);
      res.status(201).json({
        status: "success",
        message: "Answer created successfully",
        data: { answerId },
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async updateDiscussion(req, res) {
    const { userId } = req.user;
    const { discussionId } = req.params;
    const { title, content } = req.body;

    console.log("tes")

    try {
      const discussion = await Discussion.findDiscussionById(discussionId);
      if (!discussion) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      if (discussion.userId !== userId) {
        return res.status(403).json({ 
            status: "error",
            message: "Forbidden",
            error: "You are not allowed to update this discussion" 
        });
      }
      
      const result = await Discussion.updateDiscussion(discussionId, title, content);
      if (!result) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Discussion updated successfully",
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }

  static async deleteDiscussion(req, res) {
    const { userId } = req.user;
    const { discussionId } = req.params;

    try {
      const discussion = await Discussion.findDiscussionById(discussionId);
      if (!discussion) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      if (discussion.userId !== userId) {
        return res.status(403).json({ 
            status: "error",
            message: "Forbidden",
            error: "You are not allowed to delete this discussion" 
        });
      }

      const result = await Discussion.deleteDiscussionById(discussionId);
      if (!result) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Discussion deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        error: err.message 
      });
    }
  }
}

module.exports = DiscussionController;
