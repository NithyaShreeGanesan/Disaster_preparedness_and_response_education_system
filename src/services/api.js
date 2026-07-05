// ============================================================
//  API Service — all fetch calls to the Flask backend
//  Base URL points to Flask running on port 5000
// ============================================================

const BASE_URL = "http://127.0.0.1:5000/api";

// ── Helper: generic fetch wrapper ───────────────────────────
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };
  const res = await fetch(url, config);
  const data = await res.json();
  return data;
}

// ── AUTH ─────────────────────────────────────────────────────
export const loginUser = (username, password) =>
  request("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const registerUser = (username, password, email, role) =>
  request("/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email, role }),
  });

// ── DISASTERS ────────────────────────────────────────────────
export const getDisasters = () => request("/disasters");

export const getDisasterDetail = (id) => request(`/disasters/${id}`);

export const addDisaster = (data) =>
  request("/disasters", { method: "POST", body: JSON.stringify(data) });

export const deleteDisaster = (id) =>
  request(`/disasters/${id}`, { method: "DELETE" });

// ── QUIZ ─────────────────────────────────────────────────────
export const getQuizQuestions = (disasterId) =>
  request(`/quiz/${disasterId}`);

export const addQuizQuestion = (data) =>
  request("/quiz/add", { method: "POST", body: JSON.stringify(data) });

export const submitQuiz = (userId, disasterId, answers) =>
  request("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, disaster_id: disasterId, answers }),
  });

export const getUserResults = (userId) =>
  request(`/quiz/results/${userId}`);

export const deleteQuestion = (disasterId, questionId) =>
  request(`/quiz/questions/${disasterId}?question_id=${questionId}`, {
    method: "DELETE",
  });

// ── ADMIN ─────────────────────────────────────────────────────
export const getAllUsers = () => request("/admin/users");

export const getAdminStats = () => request("/admin/stats");
