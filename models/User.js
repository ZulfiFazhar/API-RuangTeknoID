const db = require("../config/db");

class User {
  constructor(id, name, email, password, createdAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  static async findByEmail(email) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    return results.length > 0 ? results[0] : null;
  }

  static async findById(id) {
    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(user) {
    const { name, email, password, otpCode, isVerified } = user;
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password, otp_code, is_verified) VALUES (?, ?, ?, ?, ?)",
        [name, email, password, otpCode, isVerified]
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

  static async deleteById(id) {
    const [result] = await db
      .promise()
      .query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getAllUsers() {
    const [results] = await db
      .promise()
      .query("SELECT id, name, email, created_at FROM users");
    return results;
  }

  static async updateTokens(id, accessToken, refreshToken) {
    await db
      .promise()
      .query(
        "UPDATE users SET active_token = ?, refresh_token = ? WHERE id = ?",
        [accessToken, refreshToken, id]
      );
  }

  static async clearToken(id) {
    await db
      .promise()
      .query("UPDATE users SET active_token = NULL WHERE id = ?", [id]);
  }
}

module.exports = User;
