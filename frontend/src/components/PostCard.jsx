import { useState } from "react";
import API from "../services/api";
import Avatar from "./Avatar";

function PostCard({ post, onUpdate }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || "");

  const likedByMe = post.likes?.some((like) => like.userId === user?.id);
  const savedByMe = user?.savedPosts?.includes(post.id);
  const isOwner = user?.id === post.userId;

  const handleLike = async () => {
    try {
      await API.put(`/posts/${post.id}/like`);
      onUpdate();
    } catch {
      alert("Like failed");
    }
  };

  const handleSave = async () => {
    try {
      const res = await API.put(`/posts/${post.id}/save`);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onUpdate();
      window.dispatchEvent(new Event("storage"));
    } catch {
      alert("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await API.delete(`/posts/${post.id}`);
      onUpdate();
    } catch {
      alert("Delete failed");
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/posts/${post.id}`, {
        text: editText,
        imageUrl: editImageUrl,
      });
      setEditing(false);
      onUpdate();
    } catch {
      alert("Update failed");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await API.post(`/posts/${post.id}/comment`, { text: comment });
      setComment("");
      onUpdate();
    } catch {
      alert("Comment failed");
    }
  };

  const copyPost = () => {
    navigator.clipboard.writeText(post.text || post.imageUrl || "");
    alert("Post copied");
  };

  return (
    <div className="post-card insta-card">
      <div className="post-header">
        <Avatar user={post} />

        <div>
          <h4>{post.username}</h4>
          <p>{new Date(post.createdAt).toLocaleString()}</p>
          {(post.feeling || post.location) && (
            <p>
              {post.feeling && `😊 ${post.feeling}`} {post.location && ` • 📍 ${post.location}`}
            </p>
          )}
        </div>

        <button className="three-dot" onClick={copyPost}>•••</button>
      </div>

      {editing ? (
        <div className="edit-box">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
          <input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} />
          <div className="edit-actions">
            <button className="ghost-btn" onClick={() => setEditing(false)}>Cancel</button>
            <button onClick={handleUpdate}>Save</button>
          </div>
        </div>
      ) : (
        <>
          {post.text && <p className="post-text">{post.text}</p>}
          {post.imageUrl && <img className="post-image" src={post.imageUrl} alt="Post" />}
        </>
      )}

      <div className="insta-actions">
        <button onClick={handleLike}>{likedByMe ? "❤️" : "🤍"}</button>
        <button onClick={() => setShowComments(!showComments)}>💬</button>
        <button onClick={copyPost}>📤</button>
        <button onClick={handleSave}>{savedByMe ? "🔖" : "📑"}</button>
      </div>

      <div className="post-stats">
        <strong>{post.likes?.length || 0} likes</strong>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {post.likes?.length > 0 && (
        <p className="liked-users">
          Liked by {post.likes.map((like) => like.username).join(", ")}
        </p>
      )}

      {isOwner && !editing && (
        <div className="owner-actions">
          <button className="ghost-btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="danger-btn" onClick={handleDelete}>Delete</button>
        </div>
      )}

      <form className="comment-form" onSubmit={handleComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button>Post</button>
      </form>

      {showComments && post.comments?.length > 0 && (
        <div className="comments-box">
          {post.comments.map((c) => (
            <p key={c.id}>
              <strong>{c.username}</strong> {c.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostCard;