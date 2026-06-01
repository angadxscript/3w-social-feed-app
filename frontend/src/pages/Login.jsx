import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/feed");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="brand-badge">3W</div>
        <h1>Social Feed for creators.</h1>
        <p>
          Post updates, share images, like posts and comment with a clean social experience.
        </p>

        <div className="auth-preview-card">
          <div className="mini-avatar">A</div>
          <div>
            <strong>angadxscript</strong>
            <p>Building a mini social app for 3W Internship 🚀</p>
          </div>
        </div>
      </div>

      <div className="auth-card glass-card">
        <h2>Welcome Back</h2>
        <p>Login to continue your social feed.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <span>
          New here? <Link to="/signup">Create account</Link>
        </span>
      </div>
    </div>
  );
}

export default Login;