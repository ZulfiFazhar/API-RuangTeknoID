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
      "SELECT active_token FROM users WHERE id = ?",
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
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
