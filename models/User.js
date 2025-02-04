const db = require("../config/db");
const Imagekit = require("./Imagekit");

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
      .query(`SELECT Users.* 
              FROM Users
              WHERE email = ?`, [email]);

    return results.length > 0 ? results[0] : null;
  }

  static async findById(id) {
    // Create user profile if not exists
    await db.promise().query(
      `INSERT INTO UserProfiles (userId)
              SELECT ?
              FROM Users u
              LEFT JOIN UserProfiles up ON u.id = up.userId
              WHERE up.userId IS NULL AND u.id = ?;`,
      [id, id]
    );

    const [results] = await db.promise().query(
      `SELECT u.*, up.*
              FROM Users u
              LEFT JOIN UserProfiles up ON u.id = up.userId 
              WHERE id = ?`,
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  // Find user with profile details
  static async findDetailed(id) {
    // Create user profile if not exists
    await db.promise().query(
      `INSERT INTO UserProfiles (userId)
              SELECT ?
              FROM Users u
              LEFT JOIN UserProfiles up ON u.id = up.userId
			        WHERE up.userId IS NULL AND u.id = ?;`,
      [id, id]
    );

    const [results] = await db.promise().query(
      `SELECT u.*, up.*
              FROM Users u
              LEFT JOIN UserProfiles up ON u.id = up.userId 
              WHERE id = ?`,
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  static async findUserProfiles(userId) {
    const [results] = await db
      .promise()
      .query(
        `SELECT UserProfiles.*
          FROM UserProfiles
          WHERE userId = ?`,
        [userId]
      );
    return results.length > 0 ? results[0] : null;
  }

  static async create(user) {
    console.log("tes")
    const { name, email, password, otpCode, isVerified } = user;
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO Users (name, email, password, otp_code, is_verified) VALUES (?, ?, ?, ?, ?)",
        [name, email, password, otpCode, isVerified]
      );


    // Insert blank / default user profile record
    await db
      .promise()
      .query(
        "INSERT INTO UserProfiles (userId) VALUES (?)",
        result.insertId
      );

      console.log("tes")

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

  static async updateProfile(userId, data, file) {
    if (file) {
      // Delete previous image if new image is uploaded & previous image exists
      const [prevImageId] = await db
        .promise()
        .query("SELECT profile_image_id FROM UserProfiles WHERE userId = ?", [
          userId,
        ]);

      if (prevImageId[0].profile_image_id) {
        const deleteImageRes = await Imagekit.deleteImage(
          prevImageId[0].profile_image_id
        );
        if (!deleteImageRes) {
          return false;
        }
      }

      // Upload new profile image
      const uploadImageRes = await Imagekit.uploadImage(file);
      if (!uploadImageRes) {
        return false;
      }

      // Update profile image data
      await db
        .promise()
        .query(
          "UPDATE UserProfiles SET profile_image_id = ?, profile_image_url = ? WHERE userId = ?",
          [uploadImageRes.fileId, uploadImageRes.url, userId]
        );
    }

    // Update user data
    const [updateUserRes] = await db
      .promise()
      .query("UPDATE Users SET name = ? WHERE id = ?", [data.name, userId]);

    // Update user profile data
    const [updateUserProfileRes] = await db
      .promise()
      .query(
        "UPDATE UserProfiles SET username = ?, full_name = ?, bio = ?, location = ?, personal_url = ? WHERE userId = ?",
        [
          data.username,
          data.full_name,
          data.bio,
          data.location,
          data.personal_url,
          userId,
        ]
      );

    return (
      updateUserRes.affectedRows > 0 && updateUserProfileRes.affectedRows > 0
    );
  }

  static async deleteById(id) {
    const [result] = await db
      .promise()
      .query("DELETE FROM Users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getAllUsers() {
    const [results] = await db
      .promise()
      .query("SELECT id, name, email, created_at FROM Users");
    return results;
  }

  static async updateTokens(id, accessToken, refreshToken) {
    await db
      .promise()
      .query(
        "UPDATE Users SET active_token = ?, refresh_token = ? WHERE id = ?",
        [accessToken, refreshToken, id]
      );
  }

  static async clearToken(id) {
    await db
      .promise()
      .query("UPDATE Users SET active_token = NULL WHERE id = ?", [id]);
  }
}

module.exports = User;
