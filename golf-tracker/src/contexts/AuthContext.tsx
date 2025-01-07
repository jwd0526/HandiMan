// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from 'shared';
import { getAuthToken, validateToken, logout as authLogout } from '../services/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      console.log('Stored token:', token ? 'exists' : 'none');
      
      if (token) {
        console.log('Validating token...');
        const userData = await validateToken(token);
        if (userData) {
          console.log('Token valid, user:', userData.email);
          setUser(userData);
        } else {
          console.log('Token invalid');
          await authLogout(); // Clean up invalid token
        }
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await authLogout(); // Clean up on error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
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