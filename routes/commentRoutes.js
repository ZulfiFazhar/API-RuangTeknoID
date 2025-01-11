const express = require("express");
const CommentController = require("../controllers/CommentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create/:postId", authMiddleware, CommentController.createComment);
router.get("/get-by-postid/:postId", CommentController.getTopLevelCommentsByPostId);
router.get("/get-replies/:commentId", CommentController.getRepliesByCommentId);
router.delete("/delete/:commentId", authMiddleware, CommentController.deleteComment);

module.exports = router;
