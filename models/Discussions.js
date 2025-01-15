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

  // Find all questions with it user discussion record
  static async findAllQuestionsWithUD(userId) {
    // Create UD records for all questions for the logged in user
    const [res] = await db.promise().query(
      `INSERT INTO UserDiscussions (userId, discussionId)
       SELECT ?, d.discussionId
       FROM Discussions d
       LEFT JOIN UserDiscussions ud ON d.discussionId = ud.discussionId AND ud.userId = ?
       WHERE ud.discussionId IS NULL AND d.answerTo IS NULL`,
      [userId, userId]
    );

    const [results] = await db
      .promise()
      .query(`SELECT Discussions.*, UserDiscussions.* 
              FROM Discussions 
              JOIN UserDiscussions ON Discussions.discussionId = UserDiscussions.discussionId 
              WHERE Discussions.answerTo IS NULL AND UserDiscussions.userId = ?`, [userId]);

    return results;
            
  } 

  static async findAnswersByDiscussionId(discussionId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE answerTo = ?", [discussionId]);
    return results;
  }

  static async findAnswersWithItUser(discussionId) {
    const [results] = await db
      .promise()
      .query(`
        SELECT Discussions.*, Users.name 
        FROM Discussions 
        JOIN Users ON Discussions.userId = Users.id 
        WHERE Discussions.answerTo = ?
      `, [discussionId]);

    return results;
  }

  static async createDiscussion(userId, title, content) {
    const [result] = await db
    .promise()
    .query("INSERT INTO Discussions (userId, title, content) VALUES (?, ?, ?)", [userId, title, content]);
    return result.insertId;
  }

  static async createAnswer(userId, answerTo, content) {
    const [result] = await db
    .promise()
    .query("INSERT INTO Discussions (userId, answerTo, content) VALUES (?, ?, ?)", [userId, answerTo, content]);
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
