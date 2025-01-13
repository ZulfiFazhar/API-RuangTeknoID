const db = require("../config/db");

class Hashtag {
  constructor(hashtagId, name, createdAt, updatedAt) {
    this.hashtagId = hashtagId;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async findAllHashtags() {
    const [results] = await db
      .promise()
      .query("SELECT * FROM Hashtags ORDER BY name ASC");
    return results;
  }

  static async findHashtagByPostId(postId) {
    const [results] = await db
      .promise()
      .query(
        "SELECT hashtags.* FROM Hashtags JOIN PostHashtags ON Hashtags.hashtagId = PostHashtags.hashtagId WHERE PostHashtags.postId = ?",
        [postId]
      );
    return results;
  }

  static async createHashtag(name) {
    const [result] = await db
      .promise()
      .query("INSERT INTO Hashtags (name) VALUES (?)", [name]);
    return result.insertId;
  }
}

module.exports = Hashtag;
