const express = require("express");

const {
  createPost,
  getPosts,
  likePost,
  commentPost
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPosts);
router.post("/", protect, createPost);
router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, commentPost);

module.exports = router;