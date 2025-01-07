// controllers/UserController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

class UserController {
  static async register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Email is already registered. Please log in." });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const otp = Math.floor(100000 + Math.random() * 900000);

      const userId = await User.create({
        name,
        email,
        password: hashedPassword,
        otpCode: otp,
        isVerified: false,
      });

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
          userId,
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
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.is_verified) {
        return res
          .status(400)
          .json({ error: "Account is already verified. Please log in." });
      }

      if (user.otp_code !== parseInt(otp)) {
        return res
          .status(400)
          .json({ error: "Invalid OTP. Please try again." });
      }

      const updated = await User.updateById(user.id, {
        isVerified: true,
        otpCode: null,
      });

      if (!updated) {
        throw new Error("Failed to update user verification");
      }

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

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

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

      await User.updateTokens(user.id, accessToken, refreshToken);

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: { accessToken, refreshToken },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async logout(req, res) {
    const userId = req.headers["userid"];

    try {
      await User.clearToken(userId);
      res.status(200).json({ status: "success", message: "Logout successful" });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  // Metode Validasi Login
  static async validateLogin(req, res) {
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

  // Metode Refresh Token
  static async refreshToken(req, res) {
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

  // Metode Mengambil Semua Pengguna
  static async getAllUsers(req, res) {
    try {
      const users = await User.getAllUsers();
      res.status(200).json({
        status: "success",
        message: "All users fetched successfully",
        data: users,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Metode Mengambil Profil Pengguna Berdasarkan ID
  static async getUserById(req, res) {
    const { userId } = req.user;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
      res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
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

  // Metode Update Pengguna
  static async updateUser(req, res) {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

    try {
      const updateData = {
        name,
        email,
        password: hashedPassword,
      };

      const updated = await User.updateById(id, updateData);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `User ${id} berhasil di update`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  // Metode Menghapus Pengguna
  static async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const deleted = await User.deleteById(id);
      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
      res.status(200).json({
        status: "success",
        message: `User ${id} berhasil dihapus`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  // Metode Lupa Password
  static async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      const resetLink = `${process.env.FE_HOST}/reset-password/${token}`;

      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        message: `<p>Access this link down below to reset your password. The link will expire in 15 minutes.</p> <br> <a href="${resetLink}">${resetLink}</a>`,
      });

      res.status(200).json({
        status: "success",
        message: "Password reset link has been sent to your email",
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to send email",
        message: err.message,
      });
    }
  }

  // Metode Reset Password
  static async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Periksa apakah password baru sama dengan password lama
      const isSamePassword = bcrypt.compareSync(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          error: "New password must be different from the previous password",
        });
      }

      // Hash password baru
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      const updated = await User.updateById(user.id, {
        password: hashedPassword,
      });

      if (!updated) {
        throw new Error("Failed to update password");
      }

      res.status(200).json({
        status: "success",
        message: "Password has been updated successfully",
      });
    } catch (err) {
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
}

module.exports = UserController;
