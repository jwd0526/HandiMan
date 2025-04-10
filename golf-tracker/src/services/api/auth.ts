// src/services/api/auth.ts
import { User, CreateUserInput } from 'shared';
import { secureStorage, STORAGE_KEYS } from '../storage/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

interface AuthResult {
  user: User;
  token: string;
}

class AuthService {
  private async handleAuthResponse(response: Response): Promise<AuthResponse> {
    const data = await response.json();
    if (!response.ok) {
      throw new AuthError(data.message || 'Authentication failed');
    }
    return data as AuthResponse;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await this.handleAuthResponse(response);
      if (!data.data?.token || !data.data?.user) {
        throw new AuthError('Invalid server response');
      }

      return {
        user: data.data.user,
        token: data.data.token
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Failed to log in');
    }
  }

  async signup(userData: CreateUserInput): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await this.handleAuthResponse(response);
      if (!data.data?.token || !data.data?.user) {
        throw new AuthError('Invalid server response');
      }

      return {
        user: data.data.user,
        token: data.data.token
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Failed to create account');
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      const user = data.data?.user || null;
      
      // Log the returned user data to help with debugging
      console.log('validateToken response data:', data);
      
      return user;
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    await secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  async getToken(): Promise<string | null> {
    return secureStorage.retrieve<string>(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export const authService = new AuthService();