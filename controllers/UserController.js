// controllers/UserController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");

class UserController {
  static async register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const [existingUser] = await db
        .promise()
        .query("SELECT id FROM users WHERE email = ?", [email]);

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ error: "Email is already registered. Please log in." });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const otp = Math.floor(100000 + Math.random() * 900000);

      const [result] = await db
        .promise()
        .query(
          "INSERT INTO users (name, email, password, otp_code, is_verified) VALUES (?, ?, ?, ?, ?)",
          [name, email, hashedPassword, otp, false]
        );

      await sendEmail({
        to: email,
        subject: "Your Registration OTP Code",
        message: `<p>Hello ${name},</p>
                  <p>Use the OTP code below to verify your account:</p>
                  <h2>${otp}</h2>
                  <p>This code will expire in 10 minutes.</p>`,
      });

      res.status(201).json({
        status: "success",
        message: "User registered successfully. Check your email for the OTP.",
        data: {
          userId: result.insertId,
          userName: name,
          userEmail: email,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
      const [user] = await db
        .promise()
        .query("SELECT id, otp_code, is_verified FROM users WHERE email = ?", [
          email,
        ]);

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const { id, otp_code, is_verified } = user[0];

      if (is_verified) {
        return res
          .status(400)
          .json({ error: "Account is already verified. Please log in." });
      }

      if (otp_code !== otp) {
        return res
          .status(400)
          .json({ error: "Invalid OTP. Please try again." });
      }

      await db
        .promise()
        .query(
          "UPDATE users SET is_verified = ?, otp_code = NULL WHERE id = ?",
          [true, id]
        );

      res.status(200).json({
        status: "success",
        message: "Account verified successfully. You can now log in.",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
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
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }
      const user = results[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ status: "error", message: "Invalid credentials" });
      }
      const accessToken = jwt.sign(
        { userId: user.id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        { userId: user.id, name: user.name, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      db.query(
        "UPDATE users SET active_token = ?, refresh_token = ? WHERE id = ?",
        [accessToken, refreshToken, user.id],
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
              accessToken: accessToken,
              refreshToken: refreshToken,
            },
          });
        }
      );
    });
  }

  static validateLogin(req, res) {
    // Mengambil data user dari authMiddleware (user dipastikan sudah terotentikasi)
    const user = req.user;

    // Mengambil token baru dari authMiddleware (jika token lama sudah kadaluwarsa)
    const newAccessToken = req.newAccessToken;
      
    res.status(200).json({
      status: "success",
      message: "User is logged in",
      data: user,
      newAccessToken: newAccessToken,
    });
  }

  static refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }
      const newAccessToken = jwt.sign(
        { userId: user.userId, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        status: "success",
        message: "Token refreshed",
        data: { accessToken: newAccessToken },
      });
    });
  }

  static logout(req, res) {
    const userId = req.headers["userid"]; 

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
    const { userId } = req.user;

    db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId],
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

        const resetLink = `${process.env.FE_HOST}/reset-password/${token}`;

        try {
          await sendEmail({
            to: email,
            subject: "Password Reset Request",
            message: `<p>Access this link down below to reset your password. The link will expire in 15 minutes.</p> <br> <a href="${resetLink}">${resetLink}</a>`,
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

      // Ambil password lama dari database
      db.query(
        "SELECT password FROM users WHERE id = ?",
        [decoded.userId],
        (err, results) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Internal Server Error", message: err.message });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
          }

          const oldPassword = results[0].password;

          // Periksa apakah password baru sama dengan password lama
          if (bcrypt.compareSync(newPassword, oldPassword)) {
            return res.status(400).json({
              error:
                "New password must be different from the previous password",
            });
          }

          // Jika validasi lolos, hash password baru dan simpan
          const hashedPassword = bcrypt.hashSync(newPassword, 10);

          db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, decoded.userId],
            (updateErr, result) => {
              if (updateErr) {
                return res.status(500).json({
                  error: "Internal Server Error",
                  message: updateErr.message,
                });
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
        }
      );
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  }
}

module.exports = UserController;
