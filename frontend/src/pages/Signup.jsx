import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    profileImage: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/signup", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/feed");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="brand-badge">3W</div>
        <h1>Start your social journey.</h1>
        <p>Create posts, share images, receive likes and join conversations in one clean feed.</p>

        <div className="auth-preview-card">
          <div className="mini-avatar">+</div>
          <div>
            <strong>Create. Share. Connect.</strong>
            <p>A professional mini social platform built with React and Express.</p>
          </div>
        </div>
      </div>

      <div className="auth-card glass-card">
        <h2>Create Account</h2>
        <p>Signup and start posting instantly.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSignup}>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Profile image URL optional" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />

          <button disabled={loading}>{loading ? "Creating..." : "Signup"}</button>
        </form>

        <span>Already have an account? <Link to="/login">Login</Link></span>
      </div>
    </div>
  );
}

export default Signup;