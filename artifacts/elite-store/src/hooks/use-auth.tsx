import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetMe, User } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react/src/custom-fetch';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('elite_token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('elite_token'));
  }, []);

  const { data: userData, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
    if (isError) {
      setTokenState(null);
      setUser(null);
      localStorage.removeItem('elite_token');
    }
  }, [userData, isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('elite_token', newToken);
    localStorage.setItem('elite_login_at', Date.now().toString());
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('elite_token');
    localStorage.removeItem('elite_login_at');
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading: isLoading && !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
