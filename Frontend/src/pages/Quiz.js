// ============================================================
//  Quiz Page — MCQ quiz for a specific disaster
// ============================================================

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuizQuestions, submitQuiz, getDisasterDetail } from "../services/api";
import { useAuth } from "../services/AuthContext";

export default function Quiz() {
  const { id }     = useParams();
  const { user }   = useAuth();

  const [questions, setQuestions]   = useState([]);
  const [disaster, setDisaster]     = useState(null);
  const [answers, setAnswers]       = useState({});       // { questionId: "A/B/C/D" }
  const [submitted, setSubmitted]   = useState(false);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent]       = useState(0);        // current question index

  useEffect(() => {
    async function load() {
      const [q, d] = await Promise.all([
        getQuizQuestions(id),
        getDisasterDetail(id),
      ]);
      setQuestions(Array.isArray(q) ? q : []);
      setDisaster(d);
      setLoading(false);
    }
    load();
  }, [id]);

  const selectAnswer = (questionId, option) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setSubmitting(true);
    const data = await submitQuiz(user.id, id, answers);
    setResult(data);
    setSubmitted(true);
    setSubmitting(false);
  };

  const getOptionClass = (q, option) => {
    if (!submitted) {
      return answers[q.id] === option ? "option selected" : "option";
    }
    // After submit — show correct/wrong
    const correct = q.correct_option;
    if (option === correct) return "option correct";
    if (answers[q.id] === option && option !== correct) return "option wrong";
    return "option";
  };

  if (loading) return <div className="loading">Loading quiz…</div>;

  if (questions.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No questions yet for this topic.</h2>
          <p>Ask your teacher to add quiz questions.</p>
          <Link to="/disasters" className="btn-primary">Back to Modules</Link>
        </div>
      </div>
    );
  }

  // ── Results screen ──────────────────────────────────────
  if (submitted && result) {
    const pct = result.percentage;
    const grade =
      pct >= 80 ? { label: "Excellent! 🥇", color: "#22c55e" } :
      pct >= 60 ? { label: "Good Job! 🥈",  color: "#f59e0b" } :
                  { label: "Keep Studying 📖", color: "#ef4444" };

    return (
      <div className="page-container">
        <div className="result-card">
          <div className="result-icon">📊</div>
          <h2>Quiz Complete!</h2>
          <div className="result-score" style={{ color: grade.color }}>
            {result.score} / {result.total}
          </div>
          <div className="result-pct" style={{ color: grade.color }}>{pct}%</div>
          <div className="result-grade" style={{ background: grade.color }}>{grade.label}</div>

          {/* Per-question breakdown */}
          <div className="result-breakdown">
            <h3>Question Breakdown</h3>
            {result.results.map((r, i) => (
              <div key={i} className={`breakdown-item ${r.is_correct ? "correct" : "wrong"}`}>
                <span>Q{i + 1}</span>
                <span>Your answer: <strong>{r.your_answer}</strong></span>
                <span>Correct: <strong>{r.correct_answer}</strong></span>
                <span>{r.is_correct ? "✅" : "❌"}</span>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="btn-primary" onClick={() => {
              setAnswers({}); setSubmitted(false); setResult(null); setCurrent(0);
            }}>
              Retry Quiz
            </button>
            <Link to="/disasters" className="btn-outline">Back to Modules</Link>
            <Link to="/dashboard" className="btn-outline">Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  // ── Quiz screen ─────────────────────────────────────────
  return (
    <div className="page-container">
      <div className="quiz-header">
        <h1>📝 {disaster?.title} Quiz</h1>
        <div className="quiz-progress-text">
          Question {current + 1} of {questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-number">Question {current + 1}</div>
        <h2 className="question-text">{q.question}</h2>

        <div className="options-grid">
          {["A", "B", "C", "D"].map((opt) => {
            const text = q[`option_${opt.toLowerCase()}`];
            return (
              <button
                key={opt}
                className={getOptionClass(q, opt)}
                onClick={() => selectAnswer(q.id, opt)}
                disabled={submitted}
              >
                <span className="option-letter">{opt}</span>
                <span className="option-text">{text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        <button
          className="btn-outline"
          onClick={() => setCurrent(current - 1)}
          disabled={current === 0}
        >
          ← Previous
        </button>

        <div className="answered-count">
          {Object.keys(answers).length} / {questions.length} answered
        </div>

        {current < questions.length - 1 ? (
          <button
            className="btn-primary"
            onClick={() => setCurrent(current + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Quiz ✔"}
          </button>
        )}
      </div>

      {/* Question dots */}
      <div className="question-dots">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? "active" : ""} ${answers[questions[i].id] ? "answered" : ""}`}
            onClick={() => setCurrent(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
