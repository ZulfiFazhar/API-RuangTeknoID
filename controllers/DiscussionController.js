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

  static async getDiscussionHashtags(req, res) {
    const { discussionId } = req.params;

    try {
      const discussion = await Discussion.findDiscussionHashtags(discussionId);
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

  // Get discussion with it author record
  static async getDiscussionAuthor(req, res) {
    const { discussionId } = req.params;

    try {
      const discussionRes = await Discussion.findDiscussionAuthor(discussionId);
      if (!discussionRes) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      const discussion = {
        discussion : {
          discussionId: discussionRes.discussionId,
          userId: discussionRes.userId,
          title: discussionRes.title,
          content: discussionRes.content,
          views: discussionRes.views,
          votes: discussionRes.votes,
          createdAt: discussionRes.createdAt,
          updatedAt: discussionRes.updatedAt
        },
        author: {
          userId: discussionRes.userId,
          name: discussionRes.authorName,
        }
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

  // Get discussion with it user discussion and author record
  static async getDiscussionUDAuthor(req, res) {
    const { discussionId } = req.params;
    const { userId } = req.user;

    try {
      const discussionRes = await Discussion.findDiscussionUD(discussionId, userId);
      if (!discussionRes) {
        return res.status(404).json({ 
            status: "error",
            message: "Discussion not found",
            error: "Discussion not found" 
        });
      }

      const discussion = {
        discussion : {
          discussionId: discussionRes.discussionId,
          userId: discussionRes.authorId,
          title: discussionRes.title,
          content: discussionRes.content,
          views: discussionRes.views,
          votes: discussionRes.votes,
          createdAt: discussionRes.createdAt,
          updatedAt: discussionRes.updatedAt
        },
        userDiscussion: {
          postId: discussionRes.postId,
          userId: discussionRes.userId,
          discussionId: discussionRes.discussionId,
          userVote: discussionRes.userVote,
        },
        author: {
          userId: discussionRes.authorId,
          name: discussionRes.authorName,
        }
      }

      if(discussionRes.hashtags_name) {
        discussion.hashtags = discussionRes.hashtags_name.split(',');
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
      const results = await Discussion.findAnswersWithItUser(discussionId);

      const answers = results.map(res => {
        return (
          { discussion : {
            discussionId: res.discussionId,
            userId: res.userId,
            title: res.title,
            content: res.content,
            views: res.views,
            votes: res.votes,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt
          },
            author : {
              userId: res.authorId,
              name: res.author_name
            }
        })
      });

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

  static async getAnswersUserUD(req, res) {
    const { discussionId } = req.params;
    const { userId } = req.user;

    try {
      const results = await Discussion.findAnswersUserUD(discussionId, userId);

      const answers = results.map(res => {
        return ({ discussion : {
            discussionId: res.discussionId,
            userId: res.authorId,
            title: res.title,
            content: res.content,
            views: res.views,
            votes: res.votes,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt
          },
          author: {
            userId: res.authorId,
            name: res.author_name,
          },
          userDiscussion: {
            userId: res.user_discussionId,
            userVote: res.user_vote,
            userViews: res.user_views
          }
        })
      });

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

  static async createDiscussionWithHashtags(req, res) {
    const { userId } = req.user;
    const { title, content, hashtags } = req.body;

    try {
      const discussionId = await Discussion.createDiscussion(userId, title, content);

      if(Array.isArray(hashtags) && hashtags.length > 0) {
        await Discussion.addHashtags(discussionId, hashtags);
      }

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

    try {
      const result = await Discussion.createAnswer(userId, answerTo, content);

      const newAnswer = { 
        discussion : {
          discussionId: result.discussionId,
          userId: result.authorId,
          title: result.title,
          content: result.content,
          views: result.views,
          votes: result.votes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt
        },
        author: {
          userId: result.authorId,
          name: result.author_name,
        },
        userDiscussion: {
          userId: result.user_discussionId,
          userVote: result.user_vote,
          userViews: result.user_views
        }
      }

      res.status(201).json({
        status: "success",
        message: "Answer created successfully",
        data: { newAnswer },
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
    const { title, content, hashtags } = req.body;

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
      
      const result = await Discussion.updateDiscussion(discussionId, title, content, hashtags);
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

  static async votes(req, res) {
    const { discussionId } = req.params;
    const { userId } = req.user;
    const { vote } = req.body;
    // cast vote to integer
    const intVote = parseInt(vote);

    try {
      const updated = await Discussion.votes(discussionId, userId, intVote);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Discussion / UserDiscussion not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Votes for discussion: ${discussionId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async incrementViews(req, res) {
    const { discussionId } = req.params;
    const { userId } = req.body;

    try {
      const updated = await Discussion.incrementViews(discussionId, userId);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Discussion not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Views for discussion: ${discussionId} incremented successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
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
