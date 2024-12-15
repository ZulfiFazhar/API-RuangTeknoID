// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Periksa apakah token yang ada di database masih aktif
    db.query(
      "SELECT active_token, refresh_token FROM users WHERE id = ?",
      [decoded.userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (results.length === 0 || results[0].active_token !== token) {
          return res.status(401).json({ error: "Invalid or expired token" });
        }
        next();
      }
    );
  } catch (err) {
    // Jika token akses tidak valid, coba verifikasi refresh token
    const refreshToken = req.headers["x-refresh-token"];
    if (!refreshToken) {
      return res
        .status(400)
        .json({ error: "Invalid token and no refresh token provided" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }

      // Buat token akses baru
      const newAccessToken = jwt.sign(
        { userId: user.userId, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Perbarui token aktif di database
      db.query(
        "UPDATE users SET active_token = ? WHERE id = ?",
        [newAccessToken, user.userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Kirim token akses baru di header respons
          res.setHeader("x-access-token", newAccessToken);
          req.user = user;
          next();
        }
      );
    });
  }
};

module.exports = authMiddleware;
