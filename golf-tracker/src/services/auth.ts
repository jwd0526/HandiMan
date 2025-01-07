// src/services/auth.ts
import { User } from '../types/user';

// You might want to move this to an environment config
const API_URL = 'http://localhost:3000/api';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: Omit<User, 'password'>;
    token: string;
  };
  errors?: any[];
}

export async function signup(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data: AuthResponse = await response.json();

    if (!data.success) {
      throw new AuthError(data.message || 'Error creating account');
    }

    if (!data.data?.user || !data.data?.token) {
      throw new AuthError('Invalid server response');
    }

    // Store the token in local storage or secure storage
    // await SecureStore.setItemAsync('authToken', data.data.token);

    return data.data.user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Signup error:', error);
    throw new AuthError('Error creating account');
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!data.success) {
      throw new AuthError(data.message || 'Invalid email or password');
    }

    if (!data.data?.user || !data.data?.token) {
      throw new AuthError('Invalid server response');
    }

    // Store the token in local storage or secure storage
    // await SecureStore.setItemAsync('authToken', data.data.token);

    return data.data.user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Login error:', error);
    throw new AuthError('Error logging in');
  }
}