import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => void;
}

const DEMO_USER: User = {
  _id: '000000000000000000000001',
  name: 'Alex Rivera',
  email: 'alex@echosales.ai',
  company: 'EchoSales AI',
  role: 'admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('echosales_token'));
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(() => !localStorage.getItem('echosales_token'));

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('echosales_token');
      if (savedToken && savedToken !== 'demo-token') {
        setLoading(true);
        try {
          const res = await authAPI.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            setIsDemoMode(false);
          }
        } catch {
          setUser(DEMO_USER);
          setIsDemoMode(true);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('echosales_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    setIsDemoMode(false);
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const res = await authAPI.register({ name, email, password, company });
    localStorage.setItem('echosales_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    setIsDemoMode(false);
  };

  const logout = () => {
    localStorage.removeItem('echosales_token');
    setToken(null);
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  const demoLogin = () => {
    localStorage.setItem('echosales_token', 'demo-token');
    setToken('demo-token');
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDemoMode,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
