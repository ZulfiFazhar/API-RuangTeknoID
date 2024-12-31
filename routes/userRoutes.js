const express = require("express");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", UserController.register);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/login", UserController.login);
router.get("/validateLogin", authMiddleware, UserController.validateLogin);
router.post("/refresh-token", UserController.refreshToken);
router.post("/logout", UserController.logout);
router.get("/users", authMiddleware, UserController.getAllUsers);
router.get("/users/profile", authMiddleware, UserController.getUserById);
router.put("/users/:id", authMiddleware, UserController.updateUser);
router.delete("/users/:id", authMiddleware, UserController.deleteUser);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password/:token", UserController.resetPassword);

module.exports = router;
