const db = require("../config/db");

class Comment {
  constructor(
    commentId,
    userId,
    postId,
    replyTo,
    content,
    createdAt,
    updatedAt
  ) {
    this.commentId = commentId;
    this.userId = userId;
    this.postId = postId;
    this.replyTo = replyTo;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async createCommentOrReply(comment) {
    const { userId, postId, replyTo, content } = comment;
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO Comments (userId, postId, replyTo, content) VALUES (?, ?, ?, ?)",
        [userId, postId, replyTo, content]
      );
    return result.insertId;
  }

  static async findTopLevelCommentsByPostId(postId) {
    const [results] = await db
      .promise()
      .query(`
        SELECT Comments.*, Users.name
        FROM Comments 
        JOIN Posts USING(postId) 
        JOIN Users ON Comments.userId = Users.id
        WHERE replyTo IS NULL AND Comments.postId = ?`,
        [postId]
      );
    return results;
  }

  static async findReplyOfCommentByCommentId(commentId) {
    const [results] = await db
      .promise()
      .query(`
        SELECT Comments.*, Users.name
        FROM Comments
        JOIN Users ON Comments.userId = Users.id
        WHERE replyTo = ?`,
        [commentId]
      );
    return results;
  }

  static async deleteCommentByCommentId(commentId) {
    const [result] = await db
        .promise()
        .query("DELETE FROM Comments WHERE commentId = ?", [commentId]);
    return result.affectedRows > 0;
  }

}

module.exports = Comment;
