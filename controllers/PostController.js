// controllers/PostController.js
const Post = require("../models/Post");
const UserLogActivity = require("../models/UserLogActivity");

class PostController {
  static async createPost(req, res) {
    const { userId } = req.user;
    const { title, content } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const postId = await Post.createPost({ userId, title, content });
      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: { postId },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async createPostWithHashtags(req, res) {
    const { userId } = req.user;
    const { title, content, image_cover, hashtags } = req.body;

    if (!userId || !title || !image_cover || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const postId = await Post.createPost({
        userId,
        title,
        image_cover,
        content,
      });

      if (hashtags.length > 0) {
        hashtags.forEach(async (hashtag) => {
          await Post.addHashtag(postId, hashtag);
        });
      }

      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: { postId },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getPostById(req, res) {
    const { postId } = req.params;

    try {
      const post = await Post.findPostById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(200).json({
        status: "success",
        message: "Post retrieved successfully",
        data: post,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getPostDetailById(req, res) {
    const { postId } = req.params;

    try {
      const postRes = await Post.findPostDetailById(postId);
      if (!postRes) {
        return res.status(404).json({ error: "Post not found" });
      }

      const hashtags = postRes.hashtags ? postRes.hashtags.split(",") : [];
      res.status(200).json({
        status: "success",
        message: "Post retrieved successfully",
        data: {
          post: {
            postId: postRes.postId,
            title: postRes.title,
            image_cover: postRes.image_cover,
            content: postRes.content,
            views: postRes.views,
            votes: postRes.votes,
            createdAt: postRes.createdAt,
            updatedAt: postRes.updatedAt,
          },
          user: {
            userId: postRes.userId,
            name: postRes.name,
            email: postRes.email,
            profile_image_url: postRes.profile_image_url,
          },
          hashtags: hashtags,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  // Get a userpost record
  static async getUPById(req, res) {
    const { userId } = req.user;
    const { postId } = req.params;

    try {
      const userpost = await Post.findUPById(userId, postId);
      res.status(200).json({
        status: "success",
        message: "Userpost fetched successfully",
        data: userpost,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getPostWithHashtagsById(req, res) {
    const { postId } = req.params;

    try {
      const postRes = await Post.findPostWithHashtagsById(postId);
      if (!postRes) {
        return res.status(404).json({ error: "Post not found" });
      }

      const hashtags = postRes.hashtags ? postRes.hashtags.split(",") : [];

      res.status(200).json({
        status: "success",
        message: "Post retrieved successfully",
        data: {
          post: {
            postId: postRes.postId,
            title: postRes.title,
            content: postRes.content,
            views: postRes.views,
            votes: postRes.votes,
            createdAt: postRes.createdAt,
            updatedAt: postRes.updatedAt,
          },
          hashtags,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async getAllPosts(req, res) {
    try {
      const posts = await Post.findAllPosts();
      res.status(200).json({
        status: "success",
        message: "All posts fetched successfully",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get all posts with userpost record details
  static async getAllPostsUPDetails(req, res) {
    const { userId } = req.user;

    try {
      const posts = await Post.findAllPostsUPDetails(userId);
      res.status(200).json({
        status: "success",
        message: "All posts fetched successfully",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get all posts details for unauthenticated user
  static async getPostsDetailsUnauthenticated(req, res) {
    try {
      const posts = await Post.findPostsDetailsUnauthenticated();
      res.status(200).json({
        status: "success",
        message: "All posts fetched successfully",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get all bookmarked posts with userpost record details
  static async getAllBookmarkedPostsUPDetails(req, res) {
    const { userId } = req.user;

    try {
      const posts = await Post.findAllBookmarkedPostsUPDetails(userId);
      res.status(200).json({
        status: "success",
        message: "All posts fetched successfully",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updatePostById(req, res) {
    const { postId } = req.params;
    const { title, content } = req.body;

    try {
      const updated = await Post.editPostById(postId, { title, content });
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async updatePostAndHashtagsById(req, res) {
    const { postId } = req.params;
    const { title, content, hashtags } = req.body;

    try {
      const updated = await Post.editPostById(postId, { title, content });
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      // Update hashtags
      const result = await Post.updateHashtags(postId, hashtags);

      res.status(200).json({
        status: "success",
        message: `Post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async deletePostById(req, res) {
    const { postId } = req.params;

    try {
      const deleted = await Post.deletePostById(postId);
      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Post ${postId} deleted successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async votes(req, res) {
    const { postId } = req.params;
    const { userId } = req.user;
    const { vote } = req.body;
    // cast vote to integer
    const intVote = parseInt(vote);

    try {
      const updated = await Post.votes(postId, userId, intVote);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Votes for post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async addView(req, res) {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
      const updated = await Post.addView(postId, userId);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Views for post ${postId} updated successfully`,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async addHashtag(req, res) {
    const { postId } = req.params;
    const hashtagId = parseInt(req.body.hashtagId);
    const { userId } = req.user;

    // Check if user is the owner of the post
    const post = await Post.findPostById(postId);
    if (post.userId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to add hashtag to this post",
      });
    }

    try {
      const updated = await Post.addHashtag(postId, hashtagId);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          message: "Post not found / Hashtag already added to post",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Hashtag added to post",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async toggleBookmarkPost(req, res) {
    const { postId } = req.params;
    const { userId } = req.user;

    try {
      await Post.toggleBookmarkPost(userId, postId);
      res.status(200).json({
        status: "success",
        message: "Bookmark successfully toggled",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async authSearchPostsByKeyword(req, res) {
    const { userId } = req.user;
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Keyword is required for searching posts",
      });
    }

    try {
      const posts = await Post.authSearchByKeyword(userId, keyword);
      if (posts.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No article found matching the keyword",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Articles found",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async searchPostsByKeyword(req, res) {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Keyword is required for searching posts",
      });
    }

    try {
      const posts = await Post.searchByKeyword(keyword);
      if (posts.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No article found matching the keyword",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Articles found",
        data: posts,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  static async recommendArticlesByUserLog(req, res) {
    try {
      const userId = req.user.userId;
      const recommendedArticles = await Post.recommendArticlesByUserLog(userId);
      // console.log(recommendedArticles);
      if (recommendedArticles.length === 0) {
        return res.status(404).json({ message: "No recommendations found" });
      }
      res.status(200).json({
        message: "Recommended articles found",
        status: "success",
        data: recommendedArticles,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = PostController;
