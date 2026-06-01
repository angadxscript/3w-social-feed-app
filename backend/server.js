const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
const PORT = 5000;
const JWT_SECRET = "3w_social_feed_secret_key";

app.use(cors());
app.use(express.json());

const readDB = () => JSON.parse(fs.readFileSync("./db.json", "utf-8"));
const writeDB = (data) => fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/", (req, res) => res.send("3W Social Feed API Running"));

app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, profileImage } = req.body;
  const db = readDB();

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (db.users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = {
    id: Date.now().toString(),
    username,
    email,
    password: await bcrypt.hash(password, 10),
    profileImage: profileImage || "",
    savedPosts: [],
  };

  db.users.push(user);
  writeDB(db);

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, profileImage: user.profileImage },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Signup successful",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      savedPosts: user.savedPosts,
    },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, profileImage: user.profileImage },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      savedPosts: user.savedPosts || [],
    },
  });
});

app.get("/api/posts", auth, (req, res) => {
  const db = readDB();
  res.json(db.posts.sort((a, b) => b.createdAt - a.createdAt));
});

app.post("/api/posts", auth, (req, res) => {
  const { text, imageUrl, feeling, location } = req.body;
  const db = readDB();

  if (!text && !imageUrl) {
    return res.status(400).json({ message: "Text or image URL required" });
  }

  const post = {
    id: Date.now().toString(),
    userId: req.user.id,
    username: req.user.username,
    profileImage: req.user.profileImage || "",
    text: text || "",
    imageUrl: imageUrl || "",
    feeling: feeling || "",
    location: location || "",
    likes: [],
    comments: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  db.posts.push(post);
  writeDB(db);

  res.json({ message: "Post created", post });
});

app.put("/api/posts/:id", auth, (req, res) => {
  const { text, imageUrl, feeling, location } = req.body;
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.userId !== req.user.id) return res.status(403).json({ message: "Not allowed" });

  post.text = text ?? post.text;
  post.imageUrl = imageUrl ?? post.imageUrl;
  post.feeling = feeling ?? post.feeling;
  post.location = location ?? post.location;
  post.updatedAt = Date.now();

  writeDB(db);
  res.json({ message: "Post updated", post });
});

app.delete("/api/posts/:id", auth, (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.userId !== req.user.id) return res.status(403).json({ message: "Not allowed" });

  db.posts = db.posts.filter((p) => p.id !== req.params.id);
  writeDB(db);

  res.json({ message: "Post deleted" });
});

app.put("/api/posts/:id/like", auth, (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  const alreadyLiked = post.likes.find((l) => l.userId === req.user.id);

  if (alreadyLiked) {
    post.likes = post.likes.filter((l) => l.userId !== req.user.id);
  } else {
    post.likes.push({ userId: req.user.id, username: req.user.username });
  }

  writeDB(db);
  res.json({ message: "Like updated", post });
});

app.post("/api/posts/:id/comment", auth, (req, res) => {
  const { text } = req.body;
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });
  if (!text) return res.status(400).json({ message: "Comment required" });

  post.comments.push({
    id: Date.now().toString(),
    userId: req.user.id,
    username: req.user.username,
    text,
    createdAt: Date.now(),
  });

  writeDB(db);
  res.json({ message: "Comment added", post });
});

app.put("/api/posts/:id/save", auth, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  const post = db.posts.find((p) => p.id === req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (!post) return res.status(404).json({ message: "Post not found" });

  user.savedPosts = user.savedPosts || [];

  if (user.savedPosts.includes(post.id)) {
    user.savedPosts = user.savedPosts.filter((id) => id !== post.id);
  } else {
    user.savedPosts.push(post.id);
  }

  writeDB(db);

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    savedPosts: user.savedPosts,
  };

  res.json({ message: "Saved updated", user: safeUser });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));