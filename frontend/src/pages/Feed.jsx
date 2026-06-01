import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import Avatar from "../components/Avatar";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
      setUser(JSON.parse(localStorage.getItem("user")));
    } catch (error) {
      console.log("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const syncUser = () => setUser(JSON.parse(localStorage.getItem("user")));
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const searchMatch =
      post.text?.toLowerCase().includes(search.toLowerCase()) ||
      post.username?.toLowerCase().includes(search.toLowerCase());

    if (filter === "mine") return searchMatch && post.userId === user?.id;
    if (filter === "saved") return searchMatch && user?.savedPosts?.includes(post.id);

    return searchMatch;
  });

  return (
    <div>
      <Navbar />

      <div className="app-layout">
        <aside className="left-panel">
          <div className="profile-mini-card">
            <Avatar user={user} size="large" />
            <h3>{user?.username}</h3>
            <p>{user?.email}</p>
          </div>

          <div className="side-card">
            <h4>Quick Stats</h4>
            <p>Posts: {posts.length}</p>
            <p>My Posts: {posts.filter((p) => p.userId === user?.id).length}</p>
            <p>Saved: {user?.savedPosts?.length || 0}</p>
            <p>Likes: {posts.reduce((t, p) => t + (p.likes?.length || 0), 0)}</p>
            <p>Comments: {posts.reduce((t, p) => t + (p.comments?.length || 0), 0)}</p>
          </div>
        </aside>

        <main className="feed-container">
          <CreatePost onPostCreated={fetchPosts} />

          <div className="search-card">
            <input
              placeholder="Search posts or usernames..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="filter-tabs">
              <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
              <button className={filter === "mine" ? "active" : ""} onClick={() => setFilter("mine")}>My Posts</button>
              <button className={filter === "saved" ? "active" : ""} onClick={() => setFilter("saved")}>Saved</button>
            </div>
          </div>

          {loading ? (
            <p className="center-text">Loading posts...</p>
          ) : filteredPosts.length === 0 ? (
            <div className="empty-card">
              <h2>🚀</h2>
              <h3>No posts found</h3>
              <p>Be the first to share something today.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
            ))
          )}
        </main>

        <aside className="right-panel">
          <div className="side-card">
            <h4>Trending</h4>
            <p>#ReactJS</p>
            <p>#NodeJS</p>
            <p>#InternshipTask</p>
            <p>#SocialFeed</p>
          </div>

          <div className="side-card">
            <h4>Recent Activity</h4>
            <p>🔥 {posts[0]?.username || "Someone"} created a post</p>
            <p>❤️ Likes are updating live</p>
            <p>💬 Comments visible with username</p>
            <p>🔖 Save posts for later</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Feed;