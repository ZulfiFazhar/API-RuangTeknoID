const db = require("../config/db");
const natural = require("natural");
const UserLogActivity = require("./UserLogActivity");

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
      .query("SELECT * FROM Posts WHERE postId = ?", [postId]);
    return results.length > 0 ? results[0] : null;
  }

  static async findPostDetailById(postId) {
    const [results] = await db.promise().query(
      `SELECT Posts.*, Users.name, Users.email, upr.profile_image_url, GROUP_CONCAT(Hashtags.name) AS hashtags
              FROM Posts
              JOIN Users ON Users.id = Posts.userId
              LEFT JOIN UserProfiles upr ON Users.id = upr.userId
              LEFT JOIN PostHashtags USING(postId)
              LEFT JOIN Hashtags USING(hashtagId)
              WHERE Posts.postId = ?
              GROUP BY Posts.postId`,
      [postId]
    );
    return results.length > 0 ? results[0] : null;
  }

  // find UserPosts record of a post by postId & userId
  static async findUPById(userId, postId) {
    // Create UserPosts record if not exist
    await db.promise().query(
      `INSERT IGNORE INTO UserPosts (userId, postId)
            VALUES (?, ?);`,
      [userId, postId]
    );

    // Get userpost record
    const [results] = await db.promise().query(
      `SELECT * 
            FROM UserPosts up
            WHERE up.userId = ? AND up.postId = ?`,
      [userId, postId]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async findPostWithHashtagsById(postId) {
    const [results] = await db.promise().query(
      `SELECT Posts.*, GROUP_CONCAT(Hashtags.hashtagId) AS hashtags
              FROM Posts
              LEFT JOIN PostHashtags USING(postId)
              LEFT JOIN Hashtags USING(hashtagId)
              WHERE Posts.postId = ?
              GROUP BY Posts.postId`,
      [postId]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async findAllPosts() {
    const [results] = await db
      .promise()
      .query(
        "SELECT postId, p.title, p.image_cover, u.name as author, p.content, p.votes, p.createdAt, GROUP_CONCAT(Hashtags.name) AS hashtags FROM Posts p JOIN Users u on u.id = p.userId LEFT JOIN PostHashtags USING(postId) LEFT JOIN Hashtags USING(hashtagId) GROUP BY postId;"
      );
    return results;
  }

  // find all Posts with userpost records detail
  static async findAllPostsUPDetails(userId) {
    // Create UserPosts record if not exist
    await db.promise().query(
      `INSERT INTO UserPosts (userId, postId)
            SELECT ?, p.postId
            FROM Posts p
            LEFT JOIN UserPosts up ON p.postId = up.postId AND up.userId = ?
            WHERE up.postId IS NULL;`,
      [userId, userId]
    );

    // Get all Posts with UserPosts records
    const [results] = await db.promise().query(
      `SELECT Posts.*, up.* 
            FROM Posts
            join UserPosts up using(postId)
            where up.userId = ?`,
      [userId]
    );
    return results;
  }

  // find all Posts detailed for unauthenticated user
  static async findPostsDetailsUnauthenticated(userId) {
    // Create user profile if not exists
    await db.promise().query(`INSERT INTO UserProfiles (userId)
            SELECT u.id
            FROM Users u
            LEFT JOIN UserProfiles up ON u.id = up.userId
            WHERE up.userId IS NULL`);

    // Get all Posts detailed
    const [articles] = await db.promise().query(
      `SELECT Posts.*, u.name as author, upr.profile_image_url, count(c.commentId) as commentsCount, GROUP_CONCAT(distinct h.name) as hashtags
          FROM Posts
          left join UserPosts up using(postId)
          join Users u on Posts.userId = u.id
          join UserProfiles upr on u.id = upr.userId
          left join PostHashtags ph using(postId)
          left join Hashtags h using(hashtagId)
          left join Comments c using(postId)
          group by Posts.postId`,
      [userId]
    );

    // console.log(articles);

    return articles;
  }

  // find all bookmarked Posts with userpost records detail
  static async findAllBookmarkedPostsUPDetails(userId) {
    // Get all Posts with UserPosts records
    const [results] = await db.promise().query(
      `SELECT Posts.*, up.*, u.name as author, count(c.commentId) as commentsCount, GROUP_CONCAT(distinct h.name) as hashtags
              FROM Posts
              join UserPosts up using(postId)
              join Users u on Posts.userId = u.id
              left join PostHashtags ph using(postId)
              left join Hashtags h using(hashtagId)
              left join Comments c using(postId)
              where up.userId = ? and up.isBookmarked = TRUE
              group by Posts.postId`,
      [userId]
    );
    return results;
  }

  static async createPost(newPost) {
    const { userId, title, image_cover, content } = newPost;
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO Posts (userId, title, image_cover, content) VALUES (?, ?, ?, ?)",
        [userId, title, image_cover, content]
      );
    return result.insertId;
  }

  static async updateById(id, data) {
    const { name, email, password, otpCode, isVerified } = data;
    const [result] = await db
      .promise()
      .query(
        "UPDATE Users SET name = ?, email = ?, password = ?, otp_code = ?, is_verified = ? WHERE id = ?",
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
    const [currentUserVote] = await db.promise().query(
      `SELECT userVote 
              FROM UserPosts 
              WHERE postId = ? AND userId = ?`,
      [postId, userId]
    );

    if (currentUserVote.length === 0) {
      return null;
    }

    // Update the votes count in the UserPosts table
    const [UserPostsResult] = await db
      .promise()
      .query(
        "UPDATE UserPosts SET userVote = ? WHERE postId = ? AND userId = ?",
        [vote, postId, userId]
      );

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

    // Update the views count in the UserPosts table
    if (userId) {
      const [UserPostsResult] = await db
        .promise()
        .query(
          "UPDATE UserPosts SET userViews = userViews + 1 WHERE postId = ? and userId = ?",
          [postId, userId]
        );
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
    // Delete all existing Hashtags for the post
    await db
      .promise()
      .query("DELETE FROM PostHashtags WHERE postId = ?", [postId]);

    const newPostHashtagsRecord = hashtagIds.map((hashtagId) => [
      postId,
      hashtagId,
    ]);

    // Add new Hashtags if hashtagIds is not empty
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
    // Find UserPosts record to check if already exist
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
        .query(
          "UPDATE UserPosts SET isBookmarked = NOT isBookmarked WHERE userId = ? AND postId = ?",
          [userId, postId]
        );
      return result.affectedRows > 0;
    } else {
      // If not exist, create it
      const [result] = await db
        .promise()
        .query(
          "INSERT INTO UserPosts (userId, postId, isBookmarked) VALUES (?, ?, TRUE)",
          [userId, postId]
        );
      return result.affectedRows > 0;
    }
  }

  static async authSearchByKeyword(userId, keyword) {
    const searchKeyword = `%${keyword}%`;

    // Create UserPosts record if not exist
    await db.promise().query(
      `INSERT INTO UserPosts (userId, postId)
            SELECT ?, p.postId
            FROM Posts p
            LEFT JOIN UserPosts up ON p.postId = up.postId AND up.userId = ?
            WHERE up.postId IS NULL;`,
      [userId, userId]
    );

    const [results] = await db.promise().query(
      `SELECT Posts.postId, Posts.title, Posts.image_cover, Posts.content, Posts.views, Posts.votes, Posts.userId, Posts.createdAt, up.*, u.name as author, count(c.commentId) as commentsCount, GROUP_CONCAT(distinct h.name) as hashtags
      FROM Posts
      JOIN UserPosts up USING(postId) 
      JOIN Users u ON Posts.userId = u.id 
      LEFT JOIN PostHashtags ph USING(postId) 
      LEFT JOIN Hashtags h USING(hashtagId) 
      LEFT JOIN Comments c USING(postId)
      WHERE up.userId = ? AND (Posts.title LIKE ? OR Posts.content LIKE ?)
      GROUP BY Posts.postId, Posts.title, Posts.content, Posts.userId, Posts.createdAt, up.userId, up.postId, u.name`,
      [userId, searchKeyword, searchKeyword]
    );
    return results;
  }

  static async searchByKeyword(keyword) {
    const searchKeyword = `%${keyword}%`;

    const [results] = await db.promise().query(
      `SELECT Posts.postId, Posts.title, Posts.image_cover, Posts.content, Posts.views, Posts.votes, Posts.userId, Posts.createdAt, up.*, u.name as author, count(c.commentId) as commentsCount, GROUP_CONCAT(distinct h.name) as hashtags
      FROM Posts
      JOIN UserPosts up USING(postId) 
      JOIN Users u ON Posts.userId = u.id 
      LEFT JOIN PostHashtags ph USING(postId) 
      LEFT JOIN Hashtags h USING(hashtagId) 
      LEFT JOIN Comments c USING(postId)
      WHERE (Posts.title LIKE ? OR Posts.content LIKE ?)
      GROUP BY Posts.postId, Posts.title, Posts.content, Posts.userId, Posts.createdAt, up.userId, up.postId, u.name`,
      [searchKeyword, searchKeyword]
    );
    return results;
  }

  static async recommendArticlesByUserLog(userId) {
    try {
      const userLogs = await UserLogActivity.findAllByUserId(userId);
      if (!userLogs || userLogs.length === 0) {
        return [];
      }

      // Step 1: Tokenisasi dan stemming dari user log
      const searchQueries = userLogs.map((log) => log.searchQuery).join(", ");
      const tokenizer = new natural.WordTokenizer();
      const stemmer = natural.PorterStemmer;
      let tokens = tokenizer
        .tokenize(searchQueries)
        .map((token) => stemmer.stem(token.toLowerCase()));
      tokens = [...new Set(tokens)]; // Remove duplicates

      if (tokens.length === 0) {
        return [];
      }

      // Step 2: Ambil semua artikel dari database
      //   const [articles] = await db.promise().query(`
      //   SELECT p.postId, p.title, u.name as author, p.content, p.votes, p.createdAt FROM Posts p INNER JOIN Users u ON p.userId = u.id
      // `);

      // Create user profile if not exists
      await db.promise().query(`INSERT INTO UserProfiles (userId)
              SELECT u.id
              FROM Users u
              LEFT JOIN UserProfiles up ON u.id = up.userId
              WHERE up.userId IS NULL`);

      // Create UserPosts record if not exist
      await db.promise().query(
        `INSERT INTO UserPosts (userId, postId)
              SELECT ?, p.postId
              FROM Posts p
              LEFT JOIN UserPosts up ON p.postId = up.postId AND up.userId = ?
              WHERE up.postId IS NULL;`,
        [userId, userId]
      );

      // Get all Posts with detailed information
      const [articles] = await db.promise().query(
        `SELECT Posts.*, up.*, u.name as author, upr.profile_image_url, count(c.commentId) as commentsCount, GROUP_CONCAT(distinct h.name) as hashtags
              FROM Posts
              join UserPosts up using(postId)
              join Users u on Posts.userId = u.id
              join UserProfiles upr on u.id = upr.userId
              left join PostHashtags ph using(postId)
              left join Hashtags h using(hashtagId)
              left join Comments c using(postId)
              where up.userId = ?
              group by Posts.postId`,
        [userId]
      );

      if (!articles || articles.length === 0) {
        return [];
      }

      // Step 3: Ekstraksi fitur artikel dengan TF-IDF
      const tfidf = new natural.TfIdf();
      articles.forEach((article) =>
        tfidf.addDocument(`${article.title} ${article.content}`)
      );

      // Representasikan artikel sebagai vektor
      const articleScores = articles.map((article, index) => {
        let score = 0;
        tokens.forEach((token) => {
          score += tfidf.tfidf(token, index); // Hitung skor TF-IDF untuk setiap token
        });
        return { ...article, score };
      });

      // Step 4: Filter artikel dengan skor 0
      const filteredArticles = articleScores.filter(
        (article) => article.score > 0
      );

      // Step 5: Urutkan artikel berdasarkan skor TF-IDF
      filteredArticles.sort((a, b) => b.score - a.score);

      // Step 6: Ambil artikel terbaik (Top 10)
      // return filteredArticles.slice(0, 10);
      return filteredArticles;
    } catch (error) {
      console.error("Error in recommendArticlesByUserLog:", error);
      throw new Error("Failed to fetch recommended articles");
    }
  }
}

module.exports = Post;
