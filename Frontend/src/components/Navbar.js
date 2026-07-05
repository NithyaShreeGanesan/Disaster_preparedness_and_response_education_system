// ============================================================
//  Navbar Component — top navigation bar shown on all pages
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-text">DisasterEdu</span>
      </div>

      {/* Hamburger for mobile */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <li>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/disasters" onClick={() => setMenuOpen(false)}>
                📚 Learn
              </Link>
            </li>
            {user.role === "admin" && (
              <li>
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin
                </Link>
              </li>
            )}
            <li className="nav-user">
              👤 {user.username}
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </li>
            <li>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            </li>
            <li>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
