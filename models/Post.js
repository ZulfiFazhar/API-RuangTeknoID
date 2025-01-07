const db = require("../config/db");

class Post {
  constructor(postId, userId, title, content, views, votes, createdAt, updatedAt) {
    this.postId = postId;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.views = views;
    this.votes = votes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async findPostById(postId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM posts WHERE postId = ?", [postId]);
    return results.length > 0 ? results[0] : null;
  }

  static async findAllPosts() {
    const [results] = await db.promise().query("SELECT * FROM Posts");
    return results;
  }

  static async createPost(newPost) {
    const { userId, title, content } = newPost;
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO Posts (userId, title, content) VALUES (?, ?, ?)",
        [userId, title, content]
      );
    return result.insertId;
  }

  static async updateById(id, data) {
    const { name, email, password, otpCode, isVerified } = data;
    const [result] = await db
      .promise()
      .query(
        "UPDATE users SET name = ?, email = ?, password = ?, otp_code = ?, is_verified = ? WHERE id = ?",
        [name, email, password, otpCode, isVerified, id]
      );
    return result.affectedRows > 0;
  }

  static async editPostById(postId, data) {
    const { title, content } = data;
    const [result] = await db
      .promise()
      .query(
        "UPDATE Posts SET title = ?, content = ? WHERE PostId = ?",
        [title, content, postId]
      );
    return result.affectedRows > 0;
  }

  static async deletePostById(postId) {
    const [result] = await db
      .promise()
      .query("DELETE FROM Posts WHERE PostId = ?", [postId]);
    return result.affectedRows > 0;
  }

  static async votes(postId, vote) {
    if(vote !== 1 && vote !== -1) {
      return null;
    }

    const [result] = await db
      .promise()
      .query("UPDATE Posts SET votes = votes + ? WHERE PostId = ?", [
        vote,
        postId,
      ]);
    return result.affectedRows > 0;
  }

  static async addView(postId) {
    const [result] = await db
      .promise()
      .query("UPDATE Posts SET views = views + 1 WHERE PostId = ?", [postId]);
    return result.affectedRows > 0;
  }

  static async addHashtag(postId, hashtagId) {
    // Check if the hashtag is already added to the post
    const [existing] = await db
      .promise()
      .query(
        "SELECT * FROM PostHashtags WHERE postId = ? AND hashtagId = ?",
        [postId, hashtagId]
      );
    
    if (existing.length > 0) {
      return null;
    }

    const [result] = await db
      .promise()
      .query("INSERT INTO PostHashtags (postId, hashtagId) VALUES (?, ?)", [
        postId,
        hashtagId,
      ]);
    return result.affectedRows > 0;
  }

}

module.exports = Post;
