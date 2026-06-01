const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;

    if (!text && !imageUrl) {
      return res.status(400).json({
        message: "Text or image URL is required"
      });
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      text: text || "",
      imageUrl: imageUrl || ""
    });

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (error) {
    res.status(500).json({
      message: "Post creation failed",
      error: error.message
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message
    });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.find(
      (like) => like.userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) => like.userId.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push({
        userId: req.user._id,
        username: req.user.username
      });
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      post
    });
  } catch (error) {
    res.status(500).json({
      message: "Like failed",
      error: error.message
    });
  }
};

const commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId: req.user._id,
      username: req.user.username,
      text
    });

    await post.save();

    res.status(200).json({
      message: "Comment added",
      post
    });
  } catch (error) {
    res.status(500).json({
      message: "Comment failed",
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  commentPost
};