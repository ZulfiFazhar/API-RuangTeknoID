const db = require("../config/db");

class UserLogActivity {
  constructor(logId, userId, searchQuery, searchDate) {
    this.logId = logId;
    this.userId = userId;
    this.searchQuery = searchQuery;
    this.searchDate = searchDate;
  }

  static async create(log) {
    const { userId, searchQuery } = log;
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO UserLogActivity (userId, searchQuery) VALUES (?, ?)",
        [userId, searchQuery]
      );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [results] = await db.promise().query(
      `SELECT searchQuery 
       FROM (
         SELECT searchQuery, MAX(searchDate) as latestDate
         FROM UserLogActivity 
         WHERE userId = ?
         GROUP BY searchQuery
       ) as subquery
       ORDER BY latestDate DESC
       LIMIT 6`,
      [userId]
    );
    return results;
  }
  static async findAllByUserId(userId) {
    const [results] = await db
      .promise()
      .query(`SELECT * FROM UserLogActivity WHERE userId = ?`, [userId]);
    return results;
  }

  static async findById(logId) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM UserLogActivity WHERE logId = ?", [logId]);
    return results.length > 0 ? results[0] : null;
  }

  static async deleteById(logId) {
    const [result] = await db
      .promise()
      .query("DELETE FROM UserLogActivity WHERE logId = ?", [logId]);
    return result.affectedRows > 0;
  }

  static async getAllLogs() {
    const [results] = await db.promise().query("SELECT * FROM UserLogActivity");
    return results;
  }
}

module.exports = UserLogActivity;
