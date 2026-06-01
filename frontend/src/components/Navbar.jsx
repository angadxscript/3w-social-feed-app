import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Avatar from "./Avatar";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { darkMode, setDarkMode } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <h2>3W Social Feed</h2>
          <p>Mini Social Platform</p>
        </div>

        <div className="nav-actions">
          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button className="profile-pill" onClick={() => setProfileOpen(true)}>
            <Avatar user={user} size="tiny" />
            {user?.username}
          </button>
        </div>
      </nav>

      {profileOpen && (
        <div className="modal-overlay" onClick={() => setProfileOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setProfileOpen(false)}>×</button>

            <Avatar user={user} size="large" />

            <h2>{user?.username}</h2>
            <p>{user?.email}</p>

            <div className="settings-list">
              <button>👤 Edit Profile</button>
              <button>🔔 Notifications</button>
              <button>🔒 Privacy</button>
              <button>📊 Account Activity</button>
              <button>🔖 Saved Posts: {user?.savedPosts?.length || 0}</button>
              <button onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            <button className="logout-wide" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;