const express = require("express");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", authMiddleware, UserController.logout);
router.get("/users", authMiddleware, UserController.getAllUsers);
router.get("/users/:id", authMiddleware, UserController.getUserById);
router.put("/users/:id", authMiddleware, UserController.updateUser);
router.delete("/users/:id", authMiddleware, UserController.deleteUser);

module.exports = router;
