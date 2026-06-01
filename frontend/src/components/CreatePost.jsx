import { useState } from "react";
import API from "../services/api";
import Avatar from "./Avatar";

function CreatePost({ onPostCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imageUrl.trim()) {
      alert("Write something or paste an image URL");
      return;
    }

    setLoading(true);

    try {
      await API.post("/posts", { text, imageUrl, feeling, location });
      setText("");
      setImageUrl("");
      setFeeling("");
      setLocation("");
      setExpanded(false);
      onPostCreated();
    } catch (error) {
      alert(error.response?.data?.message || "Post failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-compact-card">
      {!expanded ? (
        <div className="create-closed" onClick={() => setExpanded(true)}>
          <Avatar user={user} size="small" />
          <div className="fake-input">What's on your mind, {user?.username}?</div>
        </div>
      ) : (
        <form onSubmit={handleCreatePost}>
          <div className="create-top">
            <Avatar user={user} size="small" />
            <strong>{user?.username}</strong>
          </div>

          <textarea
            maxLength={280}
            placeholder="Share something interesting..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="two-input-grid">
            <input placeholder="😊 Feeling optional" value={feeling} onChange={(e) => setFeeling(e.target.value)} />
            <input placeholder="📍 Location optional" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <input
            type="text"
            placeholder="📷 Paste image URL optional"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {imageUrl && <img className="preview-image" src={imageUrl} alt="Preview" />}

          <div className="create-footer">
            <span>{text.length}/280</span>
            <div>
              <button type="button" className="ghost-btn" onClick={() => setExpanded(false)}>
                Cancel
              </button>
              <button disabled={loading}>{loading ? "Posting..." : "Post"}</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreatePost;