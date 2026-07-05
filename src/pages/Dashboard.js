// ============================================================
//  Student Dashboard
// ============================================================

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { getDisasters, getUserResults } from "../services/api";

export default function Dashboard() {
  const { user }           = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const [d, r] = await Promise.all([
        getDisasters(),
        getUserResults(user.id),
      ]);
      setDisasters(Array.isArray(d) ? d : []);
      setResults(Array.isArray(r) ? r : []);
      setLoading(false);
    }
    load();
  }, [user.id]);

  // Calculate stats
  const totalAttempts = results.length;
  const avgScore = totalAttempts
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / totalAttempts)
    : 0;
  const topScore = totalAttempts
    ? Math.max(...results.map((r) => Math.round((r.score / r.total) * 100)))
    : 0;

  if (loading) return <div className="loading">Loading your dashboard…</div>;

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1>Welcome back, {user.username}! 👋</h1>
          <p>Continue your disaster preparedness education below.</p>
        </div>
        <div className="welcome-avatar">🎓</div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-number">{disasters.length}</div>
            <div className="stat-label">Modules Available</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{totalAttempts}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{avgScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <div className="stat-number">{topScore}%</div>
            <div className="stat-label">Best Score</div>
          </div>
        </div>
      </div>

      {/* Disaster Modules */}
      <section className="section">
        <div className="section-header">
          <h2>📖 Disaster Modules</h2>
          <Link to="/disasters" className="btn-outline">View All →</Link>
        </div>
        <div className="card-grid">
          {disasters.map((d) => (
            <Link to={`/disasters/${d.id}`} className="disaster-card" key={d.id}>
              <div className="disaster-icon">{d.image_icon}</div>
              <div className="disaster-info">
                <h3>{d.title}</h3>
                <span className={`category-tag ${d.category.toLowerCase()}`}>{d.category}</span>
              </div>
              <div className="card-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Quiz Results */}
      <section className="section">
        <h2>📈 Recent Quiz Results</h2>
        {results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>You haven't taken any quizzes yet.</p>
            <Link to="/disasters" className="btn-primary">Start a Quiz</Link>
          </div>
        ) : (
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Disaster</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 8).map((r) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  const grade = pct >= 80 ? "🥇 Excellent" : pct >= 60 ? "🥈 Good" : "🥉 Keep Trying";
                  return (
                    <tr key={r.id}>
                      <td>{r.image_icon} {r.disaster_name}</td>
                      <td>{r.score} / {r.total}</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                      <td>{new Date(r.taken_at).toLocaleDateString()}</td>
                      <td>{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
