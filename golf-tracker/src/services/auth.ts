// src/services/auth.ts
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user';

const API_URL = 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'auth_token';

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

// Store authentication token
async function storeAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

// Retrieve authentication token
export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

// Remove authentication token
export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

// Check if token is valid and return user data
export async function validateToken(token: string) {
  try {
    const response = await fetch(`${API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      console.error('Server responded with status:', response.status);
      return null;
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Unexpected content type:', contentType);
      return null;
    }

    const data = await response.json();
    return data.success ? data.data.user : null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
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

    // Store the token
    await storeAuthToken(data.data.token);

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

    // Store the token
    await storeAuthToken(data.data.token);

    return data.data.user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Login error:', error);
    throw new AuthError('Error logging in');
  }
}

export async function logout() {
  try {
    // Remove the stored token
    await removeAuthToken();
  } catch (error) {
    console.error('Logout error:', error);
    throw new AuthError('Error logging out');
  }
}