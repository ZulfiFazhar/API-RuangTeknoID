const db = require("../config/db");

class Discussion {
  constructor(
    postId,
    userId,
    answerTo,
    title,
    content,
    views,
    votes,
    createdAt,
    updatedAt
  ) {
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
      .query("SELECT * FROM Discussions WHERE discussionId = ?", [
        discussionId,
      ]);
    return results.length > 0 ? results[0] : null;
  }

  static async findDiscussionHashtags(discussionId) {
    const [results] = await db.promise().query(
      `SELECT Discussions.*, GROUP_CONCAT(Hashtags.hashtagId) as hashtags
              FROM Discussions 
              LEFT JOIN DiscussionHashtags using(discussionId)
              LEFT JOIN Hashtags using(hashtagId)
              WHERE discussionId = ?
              GROUP BY Discussions.discussionId`,
      [discussionId]
    );

    return results.length > 0 ? results[0] : null;
  }

  // Find discusson with it author record
  static async findDiscussionAuthor(discussionId) {
    const [results] = await db.promise().query(
      `SELECT Discussions.*, Users.name as authorName, UserProfiles.profile_image_url, group_concat(Distinct Hashtags.name) as hashtags_name, count(Distinct Answers.discussionId) as answer_count
              FROM Discussions 
              JOIN Users ON Discussions.userId = Users.id
              JOIN UserProfiles ON Users.id = UserProfiles.userId
              LEFT JOIN DiscussionHashtags DH using(discussionId)
              LEFT JOIN Hashtags using(hashtagId)
              LEFT JOIN Discussions AS Answers ON Answers.answerTo = Discussions.discussionId
              WHERE Discussions.discussionId = ?
              GROUP BY Discussions.discussionId`,
      [discussionId]
    );

    return results.length > 0 ? results[0] : null;
  }

  // Find discussion with it user discussion and author record
  static async findDiscussionUD(discussionId, userId) {
    // Create UD record incase it doesn't exist
    const [res] = await db.promise().query(
      `INSERT INTO UserDiscussions (userId, discussionId)
              SELECT ?, ?
              WHERE NOT EXISTS (
                SELECT * FROM UserDiscussions WHERE userId = ? AND discussionId = ?
              )`,
      [userId, discussionId, userId, discussionId]
    );

    const [results] = await db.promise().query(
      `SELECT Discussions.*, UD.*, UserProfiles.profile_image_url, group_concat(Distinct Hashtags.name) as hashtags_name, Users.id as authorId, Users.name as authorName, count(Distinct Answers.discussionId) as answer_count
              FROM Discussions 
              JOIN UserDiscussions UD using(discussionId)
              JOIN Users ON Discussions.userId = Users.id
              JOIN UserProfiles ON Users.id = UserProfiles.userId
              LEFT JOIN DiscussionHashtags DH using(discussionId)
              LEFT JOIN Hashtags using(hashtagId)
              LEFT JOIN Discussions AS Answers ON Answers.answerTo = Discussions.discussionId
              WHERE Discussions.discussionId = ? and UD.userId = ?
              GROUP BY Discussions.discussionId`,
      [discussionId, userId]
    );

    return results.length > 0 ? results[0] : null;
  }

  static async findDiscussionsByUserId(userId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE userId = ?", [userId]);
    return results;
  }

  static async findAllQuestions() {
    const [results] = await db.promise()
      .query(`SELECT Discussions.*, Users.name AS author_name, 
              UserProfiles.profile_image_url, 
              GROUP_CONCAT(DISTINCT Hashtags.name) AS hashtags_name,
              COUNT(DISTINCT Answers.discussionId) AS answer_count
              FROM Discussions
              JOIN Users ON Discussions.userId = Users.id
              JOIN UserProfiles ON Users.id = UserProfiles.userId
              LEFT JOIN DiscussionHashtags ON Discussions.discussionId = DiscussionHashtags.discussionId
              LEFT JOIN Hashtags ON DiscussionHashtags.hashtagId = Hashtags.hashtagId
              LEFT JOIN Discussions AS Answers ON Answers.answerTo = Discussions.discussionId
              WHERE Discussions.answerTo IS NULL
              GROUP BY Discussions.discussionId`);

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

    const [results] = await db.promise().query(
      `SELECT 
            Discussions.*, UserDiscussions.*, Users.name AS author_name,
            UserProfiles.profile_image_url,
            GROUP_CONCAT(DISTINCT Hashtags.name) AS hashtags_name,
            COUNT(DISTINCT Answers.discussionId) AS answer_count
        FROM 
            Discussions
        JOIN 
            UserDiscussions ON Discussions.discussionId = UserDiscussions.discussionId
        JOIN 
            Users ON Discussions.userId = Users.id
        JOIN 
            UserProfiles ON Users.id = UserProfiles.userId
        LEFT JOIN 
            DiscussionHashtags ON Discussions.discussionId = DiscussionHashtags.discussionId
        LEFT JOIN 
            Hashtags ON DiscussionHashtags.hashtagId = Hashtags.hashtagId
        LEFT JOIN 
            Discussions AS Answers ON Answers.answerTo = Discussions.discussionId
        WHERE 
            Discussions.answerTo IS NULL 
            AND UserDiscussions.userId = ?
        GROUP BY 
            Discussions.discussionId;`,
      [userId]
    );

    return results;
  }

  // Find all questions with it user discussion record
  static async findAllQuestionsWithUDBookmarked(userId) {
    // Create UD records for all questions for the logged in user
    const [res] = await db.promise().query(
      `INSERT INTO UserDiscussions (userId, discussionId)
       SELECT ?, d.discussionId
       FROM Discussions d
       LEFT JOIN UserDiscussions ud ON d.discussionId = ud.discussionId AND ud.userId = ?
       WHERE ud.discussionId IS NULL AND d.answerTo IS NULL`,
      [userId, userId]
    );

    const [results] = await db.promise().query(
      `SELECT 
            Discussions.*, UserDiscussions.*, Users.name AS author_name,
            UserProfiles.profile_image_url,
            GROUP_CONCAT(DISTINCT Hashtags.name) AS hashtags_name,
            COUNT(DISTINCT Answers.discussionId) AS answer_count
        FROM 
            Discussions
        JOIN 
            UserDiscussions ON Discussions.discussionId = UserDiscussions.discussionId
        JOIN 
            Users ON Discussions.userId = Users.id
        JOIN 
            UserProfiles ON Users.id = UserProfiles.userId
        LEFT JOIN 
            DiscussionHashtags ON Discussions.discussionId = DiscussionHashtags.discussionId
        LEFT JOIN 
            Hashtags ON DiscussionHashtags.hashtagId = Hashtags.hashtagId
        LEFT JOIN 
            Discussions AS Answers ON Answers.answerTo = Discussions.discussionId
        WHERE 
            Discussions.answerTo IS NULL 
            AND UserDiscussions.userId = ?
            AND UserDiscussions.isBookmarked = 1
        GROUP BY 
            Discussions.discussionId;`,
      [userId]
    );

    return results;
  }

  static async toggleBookmark(userId, discussionId) {
    const [result] = await db
      .promise()
      .query(
        "UPDATE UserDiscussions SET isBookmarked = NOT isBookmarked WHERE userId = ? AND discussionId = ?",
        [userId, discussionId]
      );
    return result.affectedRows > 0;
  }

  static async countNumberOfAnswers(discussionIds) {
    const values = discussionIds.map((id) => "?").join(",");
    const [results] = await db.promise().query(
      `SELECT answerTo, COUNT(*) as count
              FROM Discussions
              WHERE answerTo IN (${values})
              GROUP BY answerTo`,
      discussionIds
    );
    return results;
  }

  static async findAnswersByDiscussionId(discussionId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Discussions WHERE answerTo = ?", [discussionId]);
    return results;
  }

  static async findAnswersWithItUser(discussionId) {
    const [results] = await db.promise().query(
      `
        SELECT Discussions.*, Users.name as author_name, Users.id as authorId, UserProfiles.profile_image_url
        FROM Discussions 
        JOIN Users ON Discussions.userId = Users.id 
        JOIN UserProfiles ON Users.id = UserProfiles.userId
        WHERE Discussions.answerTo = ?
      `,
      [discussionId]
    );

    return results;
  }

  static async findAnswersUserUD(discussionId, userId) {
    // Create UD records for all answers for the logged in user of this question
    await db.promise().query(
      `INSERT INTO UserDiscussions (userId, discussionId)
              SELECT ?, d.discussionId
              FROM Discussions d
              LEFT JOIN UserDiscussions ud ON d.discussionId = ud.discussionId AND ud.userId = ?
              WHERE d.answerTo = ? AND ud.discussionId IS NULL`,
      [userId, userId, discussionId]
    );

    const [results] = await db.promise().query(
      `
        SELECT Discussions.*, Users.id as authorId, Users.name as author_name, UserDiscussions.userId as user_discussionId, UserDiscussions.userVote as user_vote, UserDiscussions.userViews as user_views, UserProfiles.profile_image_url
        FROM Discussions 
        JOIN Users ON Discussions.userId = Users.id 
        JOIN UserProfiles ON Users.id = UserProfiles.userId
        JOIN UserDiscussions USING(discussionId)
        WHERE Discussions.answerTo = ? and UserDiscussions.userId = ?`,
      [discussionId, userId]
    );

    return results;
  }

  static async createDiscussion(userId, title, content) {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO Discussions (userId, title, content) VALUES (?, ?, ?)",
        [userId, title, content]
      );
    return result.insertId;
  }

  static async createAnswer(userId, answerTo, content) {
    const [insertAnswerRes] = await db
      .promise()
      .query(
        "INSERT INTO Discussions (userId, answerTo, content) VALUES (?, ?, ?)",
        [userId, answerTo, content]
      );

    // Create userdiscussion record for the answer
    const [insertUDRes] = await db.promise().query(
      `INSERT INTO UserDiscussions (userId, discussionId)
              SELECT ?, ?`,
      [userId, insertAnswerRes.insertId]
    );

    if (insertAnswerRes.affectedRows <= 0) {
      return null;
    } else {
      // Return new answer data
      const [newAnswer] = await db.promise().query(
        `SELECT Discussions.*, Users.id as authorId, Users.name as author_name, UserDiscussions.userId as user_discussionId, UserDiscussions.userVote as user_vote, UserDiscussions.userViews as user_views 
                FROM Discussions 
                JOIN Users ON Discussions.userId = Users.id 
                JOIN UserDiscussions USING(discussionId)
                WHERE Discussions.discussionId = ? and UserDiscussions.userId = ?`,
        [insertAnswerRes.insertId, userId]
      );
      return newAnswer[0];
    }
  }

  static async createBotAnswer(answerTo, content) {
    // ID pengguna bot (pastikan ini sesuai dengan user ID bot di database)
    const botUserId = 1;

    const [insertAnswerRes] = await db
      .promise()
      .query(
        "INSERT INTO Discussions (userId, answerTo, content, isBot) VALUES (?, ?, ?, ?)",
        [botUserId, answerTo, content, true]
      );

    // Buat entri dalam UserDiscussions
    await db
      .promise()
      .query(
        `INSERT INTO UserDiscussions (userId, discussionId) VALUES (?, ?)`,
        [botUserId, insertAnswerRes.insertId]
      );

    if (insertAnswerRes.affectedRows <= 0) {
      return null;
    }

    // Ambil jawaban yang baru dibuat
    const [newAnswer] = await db.promise().query(
      `SELECT Discussions.*, 
                    Users.id as authorId, 
                    Users.name as author_name, 
                    UserDiscussions.userId as user_discussionId, 
                    UserDiscussions.userVote as user_vote, 
                    UserDiscussions.userViews as user_views 
            FROM Discussions 
            JOIN Users ON Discussions.userId = Users.id 
            JOIN UserDiscussions USING(discussionId)
            WHERE Discussions.discussionId = ? AND UserDiscussions.userId = ?`,
      [insertAnswerRes.insertId, botUserId]
    );

    return newAnswer[0];
  }

  static async updateDiscussion(discussionId, title, content, newHashtags) {
    // Delete all existing hashtags
    const [res] = await db
      .promise()
      .query("DELETE FROM DiscussionHashtags WHERE discussionId = ?", [
        discussionId,
      ]);

    // Add new hashtags
    if (Array.isArray(newHashtags) && newHashtags.length > 0) {
      const values = newHashtags.map((hashtagId) => "(? , ?)").join(",");
      const params = newHashtags.flatMap((hashtagId) => [
        discussionId,
        hashtagId,
      ]);
      const [insertHashtagsRes] = await db
        .promise()
        .query(
          `INSERT INTO DiscussionHashtags (discussionId, hashtagId) VALUES ${values}`,
          params
        );
    }

    const [result] = await db
      .promise()
      .query(
        "UPDATE Discussions SET title = ?, content = ? WHERE discussionId = ?",
        [title, content, discussionId]
      );

    return result.affectedRows > 0;
  }

  static async votes(discussionId, userId, vote) {
    if (vote !== 1 && vote !== -1 && vote !== 0) {
      return null;
    }

    // Get the current userdiscussion value
    const [currentUserDiscussion] = await db.promise().query(
      `SELECT userVote 
        FROM UserDiscussions
        WHERE discussionId = ? AND userId = ?`,
      [discussionId, userId]
    );

    if (currentUserDiscussion.length === 0) {
      return null;
    }

    // Update the votes count in the userdiscussion table
    const [userDiscussionResult] = await db
      .promise()
      .query(
        "UPDATE UserDiscussions SET userVote = ? WHERE discussionId = ? AND userId = ?",
        [vote, discussionId, userId]
      );

    // New votes increment
    const newVotesIncrement = vote - currentUserDiscussion[0].userVote;

    const [result] = await db
      .promise()
      .query(
        "UPDATE Discussions SET votes = votes + ? WHERE discussionId = ?",
        [newVotesIncrement, discussionId]
      );
    return result.affectedRows > 0;
  }

  static async incrementViews(discussionId, userId) {
    if (userId) {
      // Increase the userView count
      const [res] = await db
        .promise()
        .query(
          "UPDATE UserDiscussions SET userViews = userViews + 1 WHERE discussionId = ? AND userId = ?",
          [discussionId, userId]
        );
    }

    const [result] = await db
      .promise()
      .query(
        "UPDATE Discussions SET views = views + 1 WHERE discussionId = ?",
        [discussionId]
      );
    return result.affectedRows > 0;
  }

  static async deleteDiscussionById(discussionId) {
    const [result] = await db
      .promise()
      .query("DELETE FROM Discussions WHERE discussionId = ?", [discussionId]);
    return result.affectedRows > 0;
  }

  static async addHashtags(discussionId, hashtagIds) {
    if (!Array.isArray(hashtagIds) || hashtagIds.length === 0) {
      return false;
    }

    const values = hashtagIds.map((hashtagId) => "(? , ?)").join(",");
    const params = hashtagIds.flatMap((hashtagId) => [discussionId, hashtagId]);

    const [result] = await db
      .promise()
      .query(
        `INSERT IGNORE INTO DiscussionHashtags (discussionId, hashtagId) VALUES ${values}`,
        params
      );
    return result.affectedRows > 0;
  }
}

module.exports = Discussion;
