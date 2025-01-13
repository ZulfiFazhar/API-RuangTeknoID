const express = require("express");
const HashtagController = require("../controllers/HashtagController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, HashtagController.createHashtag);
router.get("/get", HashtagController.getAllHashtags);
router.get("/get-by-postid/:postId", HashtagController.getHashtagsByPostId);

module.exports = router;
