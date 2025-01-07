// config/db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");

const envFile = process.env.NODE_ENV === "development" ? ".env.local" : ".env";
dotenv.config({ path: envFile });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});

const createDatabase = () => {
  const createDatabaseQueries = [
      ["Users",
        `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          active_token VARCHAR(255) DEFAULT NULL,
          refresh_token VARCHAR(255) DEFAULT NULL,
          otp_code VARCHAR(6) DEFAULT NULL,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ]
    ,
      ["Posts",
        `CREATE TABLE IF NOT EXISTS Posts (
          PostId INT PRIMARY KEY AUTO_INCREMENT,
          userId INT NOT NULL,
          title VARCHAR(50) NOT NULL,
          content TEXT,
          views INT DEFAULT 0,
          votes INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
        )`
      ]
    ,
      ["Hashtags",
        `CREATE TABLE IF NOT EXISTS Hashtags (
          hashtagId INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(35) NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );`
      ]
    ,
      ["PostHashtags",
        `CREATE TABLE IF NOT EXISTS PostHashtags (
          postId INT NOT NULL,
          hashtagId INT NOT NULL,
          PRIMARY KEY (postId, hashtagId),
          FOREIGN KEY (postId) REFERENCES Posts(PostId) ON DELETE CASCADE,
          FOREIGN KEY (hashtagId) REFERENCES Hashtags(hashtagId) ON DELETE CASCADE
        );`
      ]
  ];

  createDatabaseQueries.map((query) => {
    db.query(query[1], (err, result) => {  
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log(`Table ${query[0]} is ready.`);
      }
    });
  })
};

createDatabase();

module.exports = db;
