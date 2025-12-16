"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ access: null, refresh: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAccess = localStorage.getItem("access_token");
    const savedRefresh = localStorage.getItem("refresh_token");

    if (savedUser && savedAccess && savedRefresh) {
      setUser(JSON.parse(savedUser));
      setTokens({ access: savedAccess, refresh: savedRefresh });
    }

    setLoading(false);
  }, []);

  const login = (userData, access, refresh) => {
    setUser(userData);
    setTokens({ access, refresh });

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  };

  const logout = () => {
    setUser(null);
    setTokens({ access: null, refresh: null });
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
