import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    setUser({ id: '1', name: email, email, role: 'customer' });
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setUser({ id: '1', name: data.name, email: data.email, role: 'customer' });
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
