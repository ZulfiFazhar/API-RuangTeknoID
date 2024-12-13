// controllers/UserController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");

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

  static async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal Server Error", message: err.message });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const user = results[0];
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });

        const resetLink = `${req.protocol}://${req.get(
          "host"
        )}/user/reset-password/${token}`;

        try {
          await sendEmail({
            to: email,
            subject: "Password Reset Request",
            message: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link will expire in 15 minutes.</p>`,
          });

          res.status(200).json({
            status: "success",
            message: "Password reset link has been sent to your email",
          });
        } catch (error) {
          res.status(500).json({
            error: "Failed to send email",
            message: error.message,
          });
        }
      }
    );
  }

  static resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, decoded.userId],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal Server Error", message: err.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
          }

          res.status(200).json({
            status: "success",
            message: "Password has been updated successfully",
          });
        }
      );
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  }
}

module.exports = UserController;
