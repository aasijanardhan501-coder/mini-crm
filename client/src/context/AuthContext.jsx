import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// AuthProvider — wraps the whole app and exposes auth state + helpers
// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from localStorage

  // ── Hydrate session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('crm_token');
    const storedUser  = localStorage.getItem('crm_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verify token is still valid with backend
        api.get('/auth/profile')
          .then((res) => {
            if (res.data.success) {
              const freshUser = res.data.data.user;
              setUser(freshUser);
              localStorage.setItem('crm_user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {
            // Token is invalid/expired — clear storage
            _clearSession();
          });
      } catch {
        _clearSession();
      }
    }
    setLoading(false);
  }, []);

  // ── Internal: clear session ────────────────────────────────────────────────
  const _clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
  };

  // ── Internal: persist session ──────────────────────────────────────────────
  const _persistSession = (receivedToken, receivedUser) => {
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('crm_token', receivedToken);
    localStorage.setItem('crm_user', JSON.stringify(receivedUser));
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: t, user: u } = res.data.data;
        _persistSession(t, u);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Login failed. Please try again.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name, email, password, role = 'admin') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { token: t, user: u } = res.data.data;
        _persistSession(t, u);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Registration failed. Please try again.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    _clearSession();
  }, []);

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.data.success) {
        const updatedUser = res.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('crm_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, message: 'Update failed.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── useAuth hook ─────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
