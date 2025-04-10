// src/components/providers/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CreateUserInput, Goal } from 'shared';
import { authService } from '../../services/api/auth';
import { secureStorage, STORAGE_KEYS } from '../../services/storage/secureStorage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  goals: Goal[]; // Add goals to the context
  activeGoals: Goal[]; // Filtered active goals
  completedGoals: Goal[]; // Filtered completed goals
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: CreateUserInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties for goals
  const activeGoals = goals.filter(goal => !goal.achieved);
  const completedGoals = goals.filter(goal => goal.achieved);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = await secureStorage.retrieve<string>(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        setUser(null);
        setGoals([]);
        setLoading(false);
        return;
      }

      const validatedUser = await authService.validateToken(token);
      if (validatedUser) {
        console.log('Setting validated user:', validatedUser);
        setUser(validatedUser);
        
        // Set goals if they exist in the user object
        if (validatedUser.goals) {
          console.log('Setting goals from auth:', validatedUser.goals);
          setGoals(validatedUser.goals);
        }
      } else {
        await secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
        setUser(null);
        setGoals([]);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
      setUser(null);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, token } = await authService.login(email, password);
      console.log('Login response:', { user, token });
      
      if (token) {
        await secureStorage.store(STORAGE_KEYS.AUTH_TOKEN, token);
      }
      
      if (user) {
        console.log('Setting user state:', user);
        setUser(user);
        
        // Set goals if they exist in the user object
        if (user.goals) {
          console.log('Setting goals from login:', user.goals);
          setGoals(user.goals);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: CreateUserInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, token } = await authService.signup(userData);
      
      if (token) {
        await secureStorage.store(STORAGE_KEYS.AUTH_TOKEN, token);
      }
      
      if (user) {
        setUser(user);
        
        // Initialize empty goals for new user
        setGoals(user.goals || []);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.logout();
      await secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
      
      setUser(null);
      setGoals([]);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    goals,
    activeGoals,
    completedGoals,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}