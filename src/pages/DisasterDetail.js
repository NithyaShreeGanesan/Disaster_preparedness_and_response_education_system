// ============================================================
//  Disaster Detail Page — full info + dos/donts
// ============================================================

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDisasterDetail } from "../services/api";

export default function DisasterDetail() {
  const { id }                  = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getDisasterDetail(id).then((data) => {
      setDisaster(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="loading">Loading disaster info…</div>;
  if (!disaster || disaster.error) return <div className="loading">Disaster not found.</div>;

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="detail-hero">
        <div className="detail-icon">{disaster.image_icon}</div>
        <div className="detail-hero-text">
          <span className={`category-tag ${disaster.category.toLowerCase()}`}>
            {disaster.category} Disaster
          </span>
          <h1>{disaster.title}</h1>
        </div>
      </div>

      {/* Description */}
      <div className="info-card">
        <h2>🔍 What is a {disaster.title}?</h2>
        <p className="description-text">{disaster.description}</p>
      </div>

      {/* Do's and Don'ts */}
      <div className="dos-donts-grid">
        <div className="dos-card">
          <h2>✅ Do's</h2>
          <ul>
            {disaster.dos.map((item, i) => (
              <li key={i}>
                <span className="list-icon">✔</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="donts-card">
          <h2>❌ Don'ts</h2>
          <ul>
            {disaster.donts.map((item, i) => (
              <li key={i}>
                <span className="list-icon">✖</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="detail-actions">
        <Link to={`/quiz/${disaster.id}`} className="btn-primary btn-lg">
          📝 Take the {disaster.title} Quiz
        </Link>
        <Link to="/disasters" className="btn-outline btn-lg">
          ← Back to Modules
        </Link>
      </div>
    </div>
  );
}
