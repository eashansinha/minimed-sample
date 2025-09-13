import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    email: 'patient@example.com',
    password: 'demo123',
    name: 'Sarah Johnson',
    role: 'patient' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '2',
    email: 'doctor@example.com',
    password: 'demo123',
    name: 'Dr. Michael Chen',
    role: 'healthcare_provider' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('minimedUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!mockUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }
    
    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword);
    
    if (credentials.rememberMe) {
      localStorage.setItem('minimedUser', JSON.stringify(userWithoutPassword));
    } else {
      sessionStorage.setItem('minimedUser', JSON.stringify(userWithoutPassword));
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('minimedUser');
    sessionStorage.removeItem('minimedUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

