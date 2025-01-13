const express = require("express");
const PostController = require("../controllers/PostController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, PostController.createPost);
router.post(
  "/create-with-hashtags",
  authMiddleware,
  PostController.createPostWithHashtags
);
router.get("/get", PostController.getAllPosts);
router.get("/get/:postId", PostController.getPostById);
router.get("/get-detail/:postId", PostController.getPostDetailById);
router.get(
  "/get-with-hashtags/:postId",
  PostController.getPostWithHashtagsById
);
router.get(
  "/get-bookmarked",
  authMiddleware,
  PostController.getAllBookmarkedPostsUPDetails
);
router.put("/update/:postId", authMiddleware, PostController.updatePostById);
router.put(
  "/update-post-and-hashtags/:postId",
  authMiddleware,
  PostController.updatePostAndHashtagsById
);
router.delete("/delete/:postId", authMiddleware, PostController.deletePostById);
router.post("/get-up/:postId", authMiddleware, PostController.getUPById);
router.post(
  "/get-up-details",
  authMiddleware,
  PostController.getAllPostsUPDetails
);
router.post("/votes/:postId", authMiddleware, PostController.votes);
router.post("/add-view/:postId", PostController.addView);
router.post("/add-hashtag/:postId", authMiddleware, PostController.addHashtag);
router.post(
  "/toggle-bookmark/:postId",
  authMiddleware,
  PostController.toggleBookmarkPost
);
router.get("/search", PostController.searchPostsByKeyword);
router.get(
  "/recommedations",
  authMiddleware,
  PostController.recommendArticlesByUserLog
);

module.exports = router;
