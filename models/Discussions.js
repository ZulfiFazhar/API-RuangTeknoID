const db = require("../config/db");

class Discussion {
  constructor(postId, userId, answerTo, title, content, views, votes, createdAt, updatedAt) {
    this.postId = postId;
    this.userId = userId;
    this.answerTo = answerTo;
    this.title = title;
    this.content = content;
    this.views = views;
    this.votes = votes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async findAllDiscussions() {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions ORDER BY createdAt DESC");
    return results;
  }

  static async findDiscussionById(discussionId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE discussionId = ?", [discussionId]);
    return results.length > 0 ? results[0] : null;
  }

  static async findDiscussionsByUserId(userId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE userId = ?", [userId]);
    return results;
  }

  static async findAllQuestions() {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE answerTo IS NULL");
    return results;
  }

  static async findAnswersByDiscussionId(discussionId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE answerTo = ?", [discussionId]);
    return results;
  }

  static async createDiscussion(userId, title, content) {
    const [result] = await db
    .promise()
    .query("INSERT INTO Discussions (userId, title, content) VALUES (?, ?, ?)", [userId, title, content]);
    return result.insertId;
  }

  static async updateDiscussion(discussionId, title, content) {
    const [result] = await db
    .promise()
    .query("UPDATE Discussions SET title = ?, content = ? WHERE discussionId = ?", [title, content, discussionId]);
    return result.affectedRows > 0;
  }

  static async deleteDiscussionById(discussionId) {
    const [result] = await db
    .promise()
    .query("DELETE FROM Discussions WHERE discussionId = ?", [discussionId]);
    return result.affectedRows > 0;
  }
  
}

module.exports = Discussion;
