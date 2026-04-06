import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/apiConfig';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'ADMIN' | 'VIEWER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  mockLogin: () => void;
  isLoading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const verifyToken = async (savedToken: string) => {
    if (savedToken === 'mock-token') {
      const mockUser: User = { 
        id: 'mock-id', 
        email: 'dev@clorymetal.com', 
        name: 'Developer Mode', 
        picture: '', 
        role: 'ADMIN' 
      };
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (e) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        throw new Error('Login failed');
      }
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const mockLogin = () => {
    const mockUser: User = { 
      id: 'mock-id', 
      email: 'dev@clorymetal.com', 
      name: 'Developer Mode', 
      picture: '', 
      role: 'ADMIN' 
    };
    setUser(mockUser);
    setToken('mock-token');
    localStorage.setItem('token', 'mock-token');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, mockLogin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
