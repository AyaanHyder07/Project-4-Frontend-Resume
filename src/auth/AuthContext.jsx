import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/api';


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
          if (payload.role) parsed.role = payload.role;
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

const login = async (identifier, password) => {
  const { data } = await axios.post("/api/auth/login", {
    identifier: identifier.trim(),
    password
  });

  const u = {
    username: data.username,
    phoneNumber: data.phoneNumber,
    role: data.role,
    userId: data.userId,
  };

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(u));
  setUser(u);
  return data;
};

const register = async (data) => {
  const { data: response } = await axios.post("/api/auth/signup", data);

  const u = {
    username: response.username,
    phoneNumber: response.phoneNumber,
    role: response.role,
    userId: response.userId,
  };

  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(u));
  setUser(u);

  return response;
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    axios.post("/api/auth/logout").catch(() => {});
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
