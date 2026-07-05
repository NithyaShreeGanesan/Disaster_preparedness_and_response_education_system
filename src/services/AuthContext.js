// ============================================================
//  AuthContext — stores the logged-in user across all pages
//  Uses React Context so any component can read user info
// ============================================================

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try to load saved user from sessionStorage (survives page refresh)
  const saved = sessionStorage.getItem("disaster_user");
  const [user, setUser] = useState(saved ? JSON.parse(saved) : null);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("disaster_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("disaster_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any component can call: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
