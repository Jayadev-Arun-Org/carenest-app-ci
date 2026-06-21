import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('carenest_token');
    const savedUser = localStorage.getItem('carenest_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('carenest_token', data.token);
    localStorage.setItem('carenest_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const entraLogin = async (entraToken) => {
    const { data } = await api.post('/api/auth/login', {}, { headers: { Authorization: `Bearer ${entraToken}` } });
    localStorage.setItem('carenest_token', data.token);
    localStorage.setItem('carenest_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/api/auth/register', userData);
    localStorage.setItem('carenest_token', data.token);
    localStorage.setItem('carenest_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('carenest_token');
    localStorage.removeItem('carenest_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, entraLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
