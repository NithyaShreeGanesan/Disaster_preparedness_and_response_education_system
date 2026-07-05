// ============================================================
//  Admin Panel — manage disasters, questions, view users
// ============================================================

import React, { useEffect, useState } from "react";
import {
  getAdminStats, getAllUsers, getDisasters, addDisaster, deleteDisaster,
  getQuizQuestions, addQuizQuestion, deleteQuestion,
} from "../services/api";

export default function AdminPanel() {
  const [tab, setTab]           = useState("overview");
  const [stats, setStats]       = useState({});
  const [users, setUsers]       = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selDisaster, setSelDisaster] = useState("");
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState("");

  // ── Add Disaster Form ──────────────────────────────────
  const [dForm, setDForm] = useState({
    title: "", category: "Natural", description: "",
    dos: "", donts: "", image_icon: "🌪️",
  });

  // ── Add Question Form ──────────────────────────────────
  const [qForm, setQForm] = useState({
    disaster_id: "", question: "",
    option_a: "", option_b: "", option_c: "", option_d: "",
    correct_option: "A",
  });

  useEffect(() => {
    async function load() {
      const [s, u, d] = await Promise.all([
        getAdminStats(), getAllUsers(), getDisasters(),
      ]);
      setStats(s); setUsers(Array.isArray(u) ? u : []);
      setDisasters(Array.isArray(d) ? d : []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selDisaster) {
      getQuizQuestions(selDisaster).then((q) =>
        setQuestions(Array.isArray(q) ? q : [])
      );
    }
  }, [selDisaster]);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  // ── Handlers ───────────────────────────────────────────
  const handleAddDisaster = async (e) => {
    e.preventDefault();
    const data = await addDisaster(dForm);
    if (data.success) {
      showMsg("✅ Disaster added successfully!");
      const d = await getDisasters();
      setDisasters(Array.isArray(d) ? d : []);
      setDForm({ title: "", category: "Natural", description: "", dos: "", donts: "", image_icon: "🌪️" });
      const s = await getAdminStats();
      setStats(s);
    } else {
      showMsg("❌ " + data.message);
    }
  };

  const handleDeleteDisaster = async (id, title) => {
    if (!window.confirm(`Delete "${title}" and all its questions?`)) return;
    await deleteDisaster(id);
    const d = await getDisasters();
    setDisasters(Array.isArray(d) ? d : []);
    const s = await getAdminStats();
    setStats(s);
    showMsg("🗑️ Disaster deleted.");
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const data = await addQuizQuestion(qForm);
    if (data.success) {
      showMsg("✅ Question added!");
      if (selDisaster) {
        const q = await getQuizQuestions(selDisaster);
        setQuestions(Array.isArray(q) ? q : []);
      }
      setQForm({ ...qForm, question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A" });
      const s = await getAdminStats();
      setStats(s);
    } else {
      showMsg("❌ " + data.message);
    }
  };

  const handleDeleteQuestion = async (qid) => {
    if (!window.confirm("Delete this question?")) return;
    await deleteQuestion(selDisaster, qid);
    const q = await getQuizQuestions(selDisaster);
    setQuestions(Array.isArray(q) ? q : []);
    showMsg("🗑️ Question deleted.");
  };

  if (loading) return <div className="loading">Loading admin panel…</div>;

  return (
    <div className="page-container">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage disasters, quiz questions, and view students.</p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {["overview", "disasters", "questions", "users"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "overview"   && "📊 Overview"}
            {t === "disasters"  && "🌪️ Disasters"}
            {t === "questions"  && "📝 Questions"}
            {t === "users"      && "👥 Users"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────── */}
      {tab === "overview" && (
        <div>
          <div className="stats-row">
            <div className="stat-card blue">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{stats.students}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">🌪️</div>
              <div className="stat-info">
                <div className="stat-number">{stats.disasters}</div>
                <div className="stat-label">Disasters</div>
              </div>
            </div>
            <div className="stat-card orange">
              <div className="stat-icon">❓</div>
              <div className="stat-info">
                <div className="stat-number">{stats.questions}</div>
                <div className="stat-label">Quiz Questions</div>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-number">{stats.attempts}</div>
                <div className="stat-label">Quiz Attempts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DISASTERS TAB ────────────────────────────────── */}
      {tab === "disasters" && (
        <div className="admin-section">
          <h2>➕ Add New Disaster Module</h2>
          <form className="admin-form" onSubmit={handleAddDisaster}>
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="e.g. Tsunami" required
                  value={dForm.title} onChange={(e) => setDForm({ ...dForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={dForm.category} onChange={(e) => setDForm({ ...dForm, category: e.target.value })}>
                  <option>Natural</option>
                  <option>Man-made</option>
                  <option>Technological</option>
                </select>
              </div>
              <div className="form-group">
                <label>Icon (emoji)</label>
                <input type="text" placeholder="🌊" maxLength={4}
                  value={dForm.image_icon} onChange={(e) => setDForm({ ...dForm, image_icon: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Describe the disaster…" required
                value={dForm.description} onChange={(e) => setDForm({ ...dForm, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Do's (one per line)</label>
                <textarea rows={4} placeholder="Move to higher ground&#10;Call for help&#10;…" required
                  value={dForm.dos} onChange={(e) => setDForm({ ...dForm, dos: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Don'ts (one per line)</label>
                <textarea rows={4} placeholder="Do not panic&#10;Do not use lifts&#10;…" required
                  value={dForm.donts} onChange={(e) => setDForm({ ...dForm, donts: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Disaster Module</button>
          </form>

          <h2>📋 Existing Disasters</h2>
          <div className="admin-list">
            {disasters.map((d) => (
              <div className="admin-list-item" key={d.id}>
                <span className="list-emoji">{d.image_icon}</span>
                <div className="list-info">
                  <strong>{d.title}</strong>
                  <span className={`category-tag ${d.category.toLowerCase()}`}>{d.category}</span>
                </div>
                <button className="btn-danger" onClick={() => handleDeleteDisaster(d.id, d.title)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── QUESTIONS TAB ────────────────────────────────── */}
      {tab === "questions" && (
        <div className="admin-section">
          <h2>➕ Add Quiz Question</h2>
          <form className="admin-form" onSubmit={handleAddQuestion}>
            <div className="form-group">
              <label>Select Disaster</label>
              <select required value={qForm.disaster_id}
                onChange={(e) => {
                  setQForm({ ...qForm, disaster_id: e.target.value });
                  setSelDisaster(e.target.value);
                }}>
                <option value="">-- Select a disaster --</option>
                {disasters.map((d) => (
                  <option key={d.id} value={d.id}>{d.image_icon} {d.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Question</label>
              <input type="text" placeholder="Type the question…" required
                value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} />
            </div>
            <div className="form-row">
              {["a", "b", "c", "d"].map((opt) => (
                <div className="form-group" key={opt}>
                  <label>Option {opt.toUpperCase()}</label>
                  <input type="text" placeholder={`Option ${opt.toUpperCase()}`} required
                    value={qForm[`option_${opt}`]}
                    onChange={(e) => setQForm({ ...qForm, [`option_${opt}`]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Correct Answer</label>
              <select value={qForm.correct_option}
                onChange={(e) => setQForm({ ...qForm, correct_option: e.target.value })}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Add Question</button>
          </form>

          {/* Show existing questions if a disaster is selected */}
          {selDisaster && (
            <>
              <h2>📋 Questions for Selected Disaster ({questions.length})</h2>
              {questions.map((q, i) => (
                <div className="question-admin-item" key={q.id}>
                  <div className="q-text"><strong>Q{i + 1}:</strong> {q.question}</div>
                  <div className="q-options">
                    {["a", "b", "c", "d"].map((opt) => (
                      <span key={opt} className={`q-opt ${q.correct_option.toLowerCase() === opt ? "correct-opt" : ""}`}>
                        {opt.toUpperCase()}: {q[`option_${opt}`]}
                      </span>
                    ))}
                  </div>
                  <button className="btn-danger btn-sm" onClick={() => handleDeleteQuestion(q.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── USERS TAB ────────────────────────────────────── */}
      {tab === "users" && (
        <div className="admin-section">
          <h2>👥 Registered Users ({users.length})</h2>
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr><th>#</th><th>Username</th><th>Email</th><th>Role</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>👤 {u.username}</td>
                    <td>{u.email || "—"}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
