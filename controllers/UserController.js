const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

class UserController {
  static register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
          });
        }
        res.status(201).json({
          status: "success",
          message: "Berhasil menambahkan user",
          data: {
            userId: result.insertId,
            userName: name,
            userEmail: email,
          },
        });
      }
    );
  }

  static login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Internal Server Error",
          error: err.message,
        });
      }
      if (results.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      const user = results[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Cek jika ada active_token di database, artinya sudah login di perangkat lain
      if (user.active_token) {
        // Hapus token lama
        db.query(
          "UPDATE users SET active_token = NULL WHERE active_token = ?",
          [user.active_token],
          (err) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: "Failed to log out previous device",
                error: err.message,
              });
            }
          }
        );
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      // Simpan token aktif di database
      db.query(
        "UPDATE users SET active_token = ? WHERE id = ?",
        [token, user.id],
        (err) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: "Internal Server Error",
              error: err.message,
            });
          }
          res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
              token: token,
            },
          });
        }
      );
    });
  }

  static logout(req, res) {
    const { userId } = req.user; // Mendapatkan userId dari middleware JWT

    db.query(
      "UPDATE users SET active_token = NULL WHERE id = ?",
      [userId],
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
          });
        }
        res.status(200).json({
          status: "success",
          message: "Logout successful",
        });
      }
    );
  }

  static getAllUsers(req, res) {
    db.query(
      "SELECT id, name, email, created_at FROM users",
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({
          status: "success",
          message: "All users fetched successfully",
          data: results,
        });
      }
    );
  }

  static getUserById(req, res) {
    const { id } = req.params;

    db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
          });
        }
        if (results.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }
        res.status(200).json({
          status: "success",
          message: "User retrieved successfully",
          data: results[0],
        });
      }
    );
  }

  static updateUser(req, res) {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

    db.query(
      "UPDATE users SET name = ?, email = ?, password = IFNULL(?, password) WHERE id = ?",
      [name, email, hashedPassword, id],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
          });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }
        res.status(200).json({
          status: "success",
          message: "User " + id + " berhasil di update",
        });
      }
    );
  }

  static deleteUser(req, res) {
    const { id } = req.params;

    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Internal Server Error",
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
      res.status(200).json({
        status: "success",
        message: "User " + id + " berhasil dihapus",
      });
    });
  }
}

module.exports = UserController;
