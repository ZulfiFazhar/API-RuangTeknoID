const express = require("express");
const UserLogActivityController = require("../controllers/UserLogActivityController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/log", authMiddleware, UserLogActivityController.createLog);
router.get(
  "/logs/user",
  authMiddleware,
  UserLogActivityController.getLogsByUserId
);
router.get("/log/:logId", authMiddleware, UserLogActivityController.getLogById);
router.delete(
  "/log/:logId",
  authMiddleware,
  UserLogActivityController.deleteLogById
);
router.get("/logs", authMiddleware, UserLogActivityController.getAllLogs);

module.exports = router;
