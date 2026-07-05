// ============================================================
//  Disaster List Page — shows all available modules
// ============================================================

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDisasters } from "../services/api";

export default function DisasterList() {
  const [disasters, setDisasters] = useState([]);
  const [filter, setFilter]       = useState("All");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getDisasters().then((data) => {
      setDisasters(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...new Set(disasters.map((d) => d.category))];
  const filtered   = filter === "All" ? disasters : disasters.filter((d) => d.category === filter);

  if (loading) return <div className="loading">Loading modules…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Disaster Education Modules</h1>
        <p>Choose a disaster to learn safety guidelines and take a quiz.</p>
      </div>

      {/* Category Filter */}
      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="module-grid">
        {filtered.map((d) => (
          <div className="module-card" key={d.id}>
            <div className="module-icon">{d.image_icon}</div>
            <div className="module-body">
              <span className={`category-tag ${d.category.toLowerCase()}`}>{d.category}</span>
              <h3>{d.title}</h3>
              <p>Learn safety guidelines, do's and don'ts, and test your knowledge.</p>
            </div>
            <div className="module-actions">
              <Link to={`/disasters/${d.id}`} className="btn-primary">
                Learn More
              </Link>
              <Link to={`/quiz/${d.id}`} className="btn-outline">
                Take Quiz →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No modules found for this category.</p>
        </div>
      )}
    </div>
  );
}
