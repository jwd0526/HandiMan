// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { User, CreateUserInput } from 'shared';
import { authService } from '../services/api/auth';
import { secureStorage, STORAGE_KEYS } from '../services/storage/secureStorage';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UseAuth {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: CreateUserInput) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuth {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const token = await secureStorage.retrieve<string>(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        setState({ user: null, loading: false, error: null });
        return;
      }

      const user = await authService.validateToken(token);
      if (user) {
        setState({ user, loading: false, error: null });
      } else {
        await authService.logout();
        setState({ user: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setState({
        user: null,
        loading: false,
        error: 'Failed to check authentication status'
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { user, token } = await authService.login(email, password);
      
      // Store the token
      await secureStorage.store(STORAGE_KEYS.AUTH_TOKEN, token);
      
      // Update state with user
      setState({ user, loading: false, error: null });
      
      console.log('Login successful, user state updated:', user); // Debug log
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to login'
      }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData: CreateUserInput) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { user, token } = await authService.signup(userData);
      
      // Store the token
      await secureStorage.store(STORAGE_KEYS.AUTH_TOKEN, token);
      
      setState({ user, loading: false, error: null });
    } catch (error) {
      console.error('Signup error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create account'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await authService.logout();
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to logout'
      }));
      throw error;
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout
  };
}