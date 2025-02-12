// config/db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const envFile = process.env.NODE_ENV === "development" ? ".env.local" : ".env";
dotenv.config({ path: envFile });

const tempDb = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createDatabase = () => {
  const sqlFilePath = path.join(__dirname, "ruang_tekno_id.sql");
  fs.readFile(sqlFilePath, "utf8", (err, sql) => {
    if (err) {
      console.error("Error reading SQL file:", err.message);
      return;
    }
    tempDb.query(sql, (err, results) => {
      if (err) {
        console.error("Error executing SQL script:", err.message);
      } else {
        console.log("Database and tables have been created successfully.");
      }
      tempDb.end((err) => {
        if (err) {
          console.error(
            "Error closing temporary connection pool:",
            err.message
          );
        }
        initMainDbPool();
      });
    });
  });
};

let db;
const initMainDbPool = () => {
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection failed:", err.message);
    } else {
      console.log("Connected to the main database", process.env.DB_NAME);
      connection.release();
    }
  });

  seedDatabase();
};

const seedDatabase = () => {
  const checkQuery = "SELECT COUNT(*) AS count FROM Users WHERE id = ?";
  db.query(checkQuery, [1], (err, results) => {
    if (err) {
      console.error("Error checking if seed data exists:", err.message);
      return;
    }
    const count = results[0].count;
    if (count === 0) {
      const seedFilePath = path.join(__dirname, "data.sql");
      fs.readFile(seedFilePath, "utf8", (err, seedSql) => {
        if (err) {
          console.error("Error reading seed SQL file:", err.message);
          return;
        }
        db.query(seedSql, (err, result) => {
          if (err) {
            console.error("Error executing seed SQL script:", err.message);
          } else {
            console.log("Seed data inserted successfully.");
          }
        });
      });
    } else {
      console.log("Seed data already exists, skipping seeding process.");
    }
  });
};

createDatabase();

module.exports = db;
