// ============================================================
//  App.js — root component with routing setup
// ============================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./services/AuthContext";

import Navbar        from "./components/Navbar";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import DisasterList  from "./pages/DisasterList";
import DisasterDetail from "./pages/DisasterDetail";
import Quiz          from "./pages/Quiz";
import AdminPanel    from "./pages/AdminPanel";

import "./App.css";

// ── Protected Route: only logged-in users ───────────────────
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// ── Admin Route: only admin users ───────────────────────────
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user)             return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/disasters" element={<PrivateRoute><DisasterList /></PrivateRoute>} />
          <Route path="/disasters/:id" element={<PrivateRoute><DisasterDetail /></PrivateRoute>} />
          <Route path="/quiz/:id"  element={<PrivateRoute><Quiz /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
