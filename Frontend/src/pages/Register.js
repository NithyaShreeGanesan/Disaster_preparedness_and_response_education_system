// ============================================================
//  Register Page
// ============================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const [form, setForm]       = useState({ username: "", password: "", email: "", role: "student" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      const data = await registerUser(form.username, form.password, form.email, form.role);
      if (data.success) {
        setSuccess("Account created! Redirecting to login…");
        setTimeout(() => navigate("/login"), 1500);
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
          <div className="hero-icon">📚</div>
          <h1>Join DisasterEdu</h1>
          <p>Start your safety education journey today</p>
          <div className="hero-facts">
            <div className="fact">✅ Free to join</div>
            <div className="fact">🎓 Learn at your own pace</div>
            <div className="fact">🏆 Earn quiz scores</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Fill in the details below</p>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text" name="username" placeholder="Choose a username"
                value={form.username} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label>Email (optional)</label>
              <input
                type="email" name="email" placeholder="your@email.com"
                value={form.email} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password" name="password" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label>I am a…</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="admin">Teacher / Admin</option>
              </select>
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
