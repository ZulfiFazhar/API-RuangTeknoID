const express = require("express");
const DiscussionController = require("../controllers/DiscussionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/get-all", DiscussionController.getAllDiscussions);
router.get("/get-byid/:discussionId", DiscussionController.getDiscussionById);
router.get(
  "/get-hashtags/:discussionId",
  DiscussionController.getDiscussionHashtags
);
router.get(
  "/get-discussion-author/:discussionId",
  DiscussionController.getDiscussionAuthor
);
router.get(
  "/get-discussion-ud-author/:discussionId",
  authMiddleware,
  DiscussionController.getDiscussionUDAuthor
);
router.get("/get-questions", DiscussionController.getAllQuestions);
router.get(
  "/get-questions-ud",
  authMiddleware,
  DiscussionController.getQuestionsWithUD
);
router.get(
  "/get-answers/:discussionId",
  DiscussionController.getAnswersByDiscussionId
);
router.get(
  "/get-answers-user/:discussionId",
  DiscussionController.getAnswersWithItUser
);
router.get(
  "/get-answers-user-ud/:discussionId",
  authMiddleware,
  DiscussionController.getAnswersUserUD
);
router.post("/create", authMiddleware, DiscussionController.createDiscussion);
router.post(
  "/create-hashtags",
  authMiddleware,
  DiscussionController.createDiscussionWithHashtags
);
router.post(
  "/create-answer",
  authMiddleware,
  DiscussionController.createAnswer
);
router.post("/create-bot-answer", DiscussionController.createBotAnswer);
router.put(
  "/update/:discussionId",
  authMiddleware,
  DiscussionController.updateDiscussion
);
router.put("/votes/:discussionId", authMiddleware, DiscussionController.votes);
router.put(
  "/increment-views/:discussionId",
  DiscussionController.incrementViews
);
router.delete(
  "/delete/:discussionId",
  authMiddleware,
  DiscussionController.deleteDiscussion
);

module.exports = router;
