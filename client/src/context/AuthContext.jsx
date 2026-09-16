"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Restore session from localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem("veritas_token");
    const savedUser = localStorage.getItem("veritas_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("veritas_token");
        localStorage.removeItem("veritas_user");
      }
    }
    setLoading(false);
  }, []);

  const saveAuthSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("veritas_token", newToken);
    localStorage.setItem("veritas_user", JSON.stringify(newUser));
  };

  const login = async ({ email, password, role = "candidate" }) => {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Login failed. Please check your credentials.");
    }

    saveAuthSession(data.token, data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const register = async ({ name, email, password, role = "candidate", organizationName }) => {
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, organizationName }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Registration failed.");
    }

    saveAuthSession(data.token, data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const oauthLogin = async ({ provider, email, name, avatarUrl, role = "candidate" }) => {
    const res = await fetch(`${apiUrl}/api/auth/oauth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, email, name, avatarUrl, role }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `${provider} sign-in failed.`);
    }

    saveAuthSession(data.token, data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("veritas_token");
    localStorage.removeItem("veritas_user");
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        oauthLogin,
        logout,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
