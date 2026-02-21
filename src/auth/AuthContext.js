import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored);
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          // Use role from JWT payload (source of truth for backend auth)
          if (payload.role) {
            parsed.role = payload.role;
          }
          setUser(parsed);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const u = { email: data.email, role: data.role, userId: data.userId };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return data;
  };

  const register = async (email, password) => {
    const { data } = await authAPI.register({ email, password });
    const u = { email: data.email, role: data.role, userId: data.userId };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    authAPI.logout().catch(() => {});
  };

  const isAdmin = () => {
    const r = user?.role;
    return r === 'ROLE_ADMIN' || r === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
