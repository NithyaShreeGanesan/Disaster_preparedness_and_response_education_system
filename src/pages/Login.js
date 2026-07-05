// ============================================================
//  Login Page
// ============================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../services/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      if (data.success) {
        login(data.user);                            // store user in context
        navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Could not connect to the server. Make sure Flask is running.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="hero-icon">🛡️</div>
          <h1>DisasterEdu</h1>
          <p>Learn. Prepare. Survive.</p>
          <div className="hero-facts">
            <div className="fact">🌍 5 Disaster Modules</div>
            <div className="fact">📝 Interactive Quizzes</div>
            <div className="fact">📊 Track Your Progress</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your learning</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="auth-demo">
            <p>Demo Accounts:</p>
            <code>admin / admin123</code> &nbsp;|&nbsp; <code>student1 / student123</code>
          </div>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
