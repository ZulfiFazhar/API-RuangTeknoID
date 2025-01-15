const express = require("express");
const DiscussionController = require("../controllers/DiscussionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/get-all", DiscussionController.getAllDiscussions);
router.get("/get-byid/:discussionId", DiscussionController.getDiscussionById);
router.get("/get-questions", DiscussionController.getAllQuestions);
router.get("/get-questions-ud", authMiddleware, DiscussionController.getQuestionsWithUD);
router.get("/get-answers/:discussionId", DiscussionController.getAnswersByDiscussionId);
router.get("/get-answers-user/:discussionId", DiscussionController.getAnswersWithItUser);
router.post("/create", authMiddleware, DiscussionController.createDiscussion);
router.post("/create-answer", authMiddleware, DiscussionController.createAnswer);
router.put("/update/:discussionId", authMiddleware, DiscussionController.updateDiscussion);
router.delete("/delete/:discussionId", authMiddleware, DiscussionController.deleteDiscussion);

module.exports = router;
