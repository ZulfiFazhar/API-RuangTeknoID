const db = require("../config/db");

class Post {
  constructor(
    postId,
    userId,
    title,
    content,
    views,
    votes,
    createdAt,
    updatedAt
  ) {
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

  static async findPostDetailById(postId) {
    const [results] = await db
      .promise()
      .query(`SELECT posts.*, users.name, users.email, GROUP_CONCAT(hashtags.name) AS hashtags
              FROM posts
              JOIN users ON users.id = posts.userId
              LEFT JOIN posthashtags USING(postId)
              LEFT JOIN hashtags USING(hashtagId)
              WHERE posts.postId = ?
              GROUP BY posts.postId`, [postId]);
    return results.length > 0 ? results[0] : null;
  }

  static async findPostWithHashtagsById(postId) {
    const [results] = await db
      .promise()
      .query(`SELECT posts.*, GROUP_CONCAT(hashtags.hashtagId) AS hashtags
              FROM posts
              LEFT JOIN posthashtags USING(postId)
              LEFT JOIN hashtags USING(hashtagId)
              WHERE posts.postId = ?
              GROUP BY posts.postId`, [postId]);
    return results.length > 0 ? results[0] : null;
  }

  static async findAllPosts() {
    const [results] = await db.promise().query("SELECT * FROM Posts");
    return results;
  }

  // find all posts with userpost records detail
  static async findAllPostsUPDetails(userId) {
    // Create userposts record of all posts for this user
    await db
    .promise()
    .query(`INSERT INTO userposts (userId, postId)
            SELECT p.userId, p.postId
            FROM posts p
            LEFT JOIN userposts up ON p.postId = up.postId AND up.userId = ?
            WHERE up.postId IS NULL;`, [userId]);

    // Get all posts with userposts records
    const [results] = await db
    .promise()
    .query(`SELECT posts.*, up.* 
            FROM posts
            join userposts up using(postId)
            where up.userId = ?`, [userId]);
    return results;
  }

    // find all bookmarked posts with userpost records detail
    static async findAllBookmarkedPostsUPDetails(userId) {
      // Get all posts with userposts records
      const [results] = await db
      .promise()
      .query(`SELECT posts.*, up.* 
              FROM posts
              join userposts up using(postId)
              where up.isBookmarked = True AND up.userId = ?`, [userId]);
      return results;
    }


  static async createPost(newPost) {
    const { userId, title, content } = newPost;
    const [result] = await db
      .promise()
      .query("INSERT INTO Posts (userId, title, content) VALUES (?, ?, ?)", [
        userId,
        title,
        content,
      ]);
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
      .query("UPDATE Posts SET title = ?, content = ? WHERE PostId = ?", [
        title,
        content,
        postId,
      ]);
    return result.affectedRows > 0;
  }

  static async deletePostById(postId) {
    const [result] = await db
      .promise()
      .query("DELETE FROM Posts WHERE PostId = ?", [postId]);
    return result.affectedRows > 0;
  }

  static async votes(postId, userId, vote) {
    if (vote !== 1 && vote !== -1 && vote !== 0) {
      return null;
    }

    // Get the current uservote value
    const [currentUserVote] = await db
      .promise()  
      .query(`SELECT userVote 
              FROM userposts 
              WHERE postId = ? AND userId = ?`, [
        postId,
        userId,
      ]);

    if (currentUserVote.length === 0) {
      return null;
    }

    // Update the votes count in the userposts table
    const [userpostsResult] = await db
      .promise()
      .query("UPDATE userposts SET userVote = ? WHERE postId = ? AND userId = ?", [
          vote,
          postId,
          userId
      ]);

    // New votes increment
    const newVotesIncrement = vote - currentUserVote[0].userVote;

    const [result] = await db
      .promise()
      .query("UPDATE Posts SET votes = votes + ? WHERE PostId = ?", [
        newVotesIncrement,
        postId,
      ]);
    return result.affectedRows > 0;
  }

  static async addView(postId, userId) {
    const [result] = await db
      .promise()
      .query("UPDATE Posts SET views = views + 1 WHERE PostId = ?", [postId]);

    // Update the views count in the userposts table
    if(userId) {
      const [userpostsResult] = await db
        .promise()
        .query("UPDATE UserPosts SET userViews = userViews + 1 WHERE postId = ? and userId = ?", [postId, userId]);
    }

    return result.affectedRows > 0;
  }

  static async addHashtag(postId, hashtagId) {
    // Check if the hashtag is already added to the post
    const [existing] = await db
      .promise()
      .query("SELECT * FROM PostHashtags WHERE postId = ? AND hashtagId = ?", [
        postId,
        hashtagId,
      ]);

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

  static async updateHashtags(postId, hashtagIds) {
    // Delete all existing hashtags for the post
    await db
      .promise()
      .query("DELETE FROM PostHashtags WHERE postId = ?", [postId]);

    const newPostHashtagsRecord = hashtagIds.map((hashtagId) => [
      postId,
      hashtagId,
    ]);

    // Add new hashtags if hashtagIds is not empty
    if (hashtagIds.length <= 0) {
      return null;
    }

    const [result] = await db
      .promise()
      .query("INSERT INTO PostHashtags (postId, hashtagId) VALUES ?", [
        newPostHashtagsRecord,
      ]);

    return result.affectedRows > 0;

  }

  static async toggleBookmarkPost(userId, postId) {
    // Find userposts record to check if already exist
    const [upExist] = await db
      .promise()
      .query("SELECT * FROM UserPosts WHERE userId = ? AND postId = ?", [
        userId,
        postId,
      ]);

    if (upExist.length > 0) {
      // If exist, update it
      const [result] = await db
        .promise()
        .query("UPDATE UserPosts SET isBookmarked = NOT isBookmarked WHERE userId = ? AND postId = ?", [
          userId,
          postId,
        ]);
      return result.affectedRows > 0;
    } else {
      // If not exist, create it
      const [result] = await db
        .promise()
        .query("INSERT INTO UserPosts (userId, postId, isBookmarked) VALUES (?, ?, TRUE)", [
          userId,
          postId,
        ]);
      return result.affectedRows > 0;
    }
  }

  // Logika pencarian artikel berdasarkan keyword
  static async searchByKeyword(keyword) {
    const searchKeyword = `%${keyword}%`;
    const [results] = await db
      .promise()
      .query(
        "SELECT p.postId, p.title, u.name as author, p.content, p.votes, p.createdAt FROM Posts p INNER JOIN users u ON p.userId = u.id WHERE title LIKE ? OR content LIKE ?",
        [searchKeyword, searchKeyword]
      );
    return results;
  }
}

module.exports = Post;
