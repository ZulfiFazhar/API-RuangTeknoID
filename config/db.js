// config/db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");

const envFile = process.env.NODE_ENV === "development" ? ".env.local" : ".env";
dotenv.config({ path: envFile });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to the database.");
    connection.release();
  }
});

const createDatabase = () => {
  const createDatabaseQueries = [
    [
      "Users",
      `CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        active_token TEXT DEFAULT NULL,
        refresh_token TEXT DEFAULT NULL,
        otp_code VARCHAR(6) DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    ],
    [
      "Posts",
      `CREATE TABLE IF NOT EXISTS Posts (
        postId INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        title VARCHAR(50) NOT NULL,
        image_cover TEXT,
        content TEXT,
        views INT DEFAULT 0,
        votes INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      );`,
    ],
    [
      "Hashtags",
      `CREATE TABLE IF NOT EXISTS Hashtags (
        hashtagId INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(35) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );`,
    ],
    [
      "PostHashtags",
      `CREATE TABLE IF NOT EXISTS PostHashtags (
        postId INT NOT NULL,
        hashtagId INT NOT NULL,
        PRIMARY KEY (postId, hashtagId),
        FOREIGN KEY (postId) REFERENCES Posts(PostId) ON DELETE CASCADE,
        FOREIGN KEY (hashtagId) REFERENCES Hashtags(hashtagId) ON DELETE CASCADE
      );`,
    ],
    [
      "UserPosts",
      `CREATE TABLE IF NOT EXISTS UserPosts (
        userId INT NOT NULL,
        postId INT NOT NULL,
        PRIMARY KEY (userId, postId),
        userVote TINYINT DEFAULT 0,
        userViews INT DEFAULT 0,
        isBookmarked BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (postId) REFERENCES Posts(postId) ON DELETE CASCADE
      );`,
    ],
    [
      "Comments",
      `CREATE TABLE IF NOT EXISTS Comments (
        commentId INT AUTO_INCREMENT PRIMARY KEY,
        postId INT NOT NULL,
        userId INT NOT NULL,
        replyTo INT DEFAULT NULL,
        content TEXT NOT NULL,
        votes INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES Posts(postId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (replyTo) REFERENCES Comments(commentId) ON DELETE CASCADE
      );`,
    ],
    [
      "Discussions",
      `CREATE TABLE IF NOT EXISTS Discussions (
        discussionId INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        answerTo INT DEFAULT NULL,
        title VARCHAR(50) DEFAULT NULL,
        content TEXT NOT NULL,
        views INT DEFAULT 0,
        votes INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isBot TINYINT DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (answerTo) REFERENCES Discussions(discussionId) ON DELETE CASCADE
      );`,
    ],
    [
      "UserDiscussions",
      `CREATE TABLE IF NOT EXISTS UserDiscussions (
        discussionId INT NOT NULL,
        userId INT NOT NULL,
        PRIMARY KEY (discussionId, userId),
        userVote TINYINT DEFAULT 0,
        userViews INT DEFAULT 0,
        isBot TINYINT DEFAULT 0,
        FOREIGN KEY (discussionId) REFERENCES Discussions(discussionId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      );`,
    ],
    [
      "DiscussionHashtags",
      `CREATE TABLE IF NOT EXISTS DiscussionHashtags (
        discussionId INT NOT NULL,
        hashtagId INT NOT NULL,
        PRIMARY KEY (discussionId, hashtagId),
        FOREIGN KEY (discussionId) REFERENCES Discussions(discussionId) ON DELETE CASCADE,
        FOREIGN KEY (hashtagId) REFERENCES Hashtags(hashtagId) ON DELETE CASCADE
      );`,
    ],
    [
      "UserLogActivity",
      `CREATE TABLE IF NOT EXISTS UserLogActivity (
        logId INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        searchQuery VARCHAR(255) NOT NULL,
        searchDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      );`,
    ],
    [
      "UserProfiles",
      `CREATE TABLE IF NOT EXISTS UserProfiles (
        userId INT NOT NULL PRIMARY KEY,
        username VARCHAR(50) DEFAULT NULL,
        full_name VARCHAR(50) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        profile_image_id VARCHAR(255) DEFAULT NULL,
        profile_image_url VARCHAR(255) DEFAULT NULL,
        location VARCHAR(50) DEFAULT NULL,
        personal_url VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      );`,
    ],
  ];

  createDatabaseQueries.map(async (query) => {
    db.query(query[1], (err, result) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        // console.log(`Table ${query[0]} is ready.`);
      }
    });
  });
};

// createDatabase();

module.exports = db;
