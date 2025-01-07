// src/services/auth.ts
import * as SecureStore from 'expo-secure-store';
import { User, CreateUserInput } from 'shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'auth_token';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

interface ServerUser {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: ServerUser;
    token: string;
  };
}

function transformUser(serverUser: ServerUser): User {
  return {
    _id: serverUser._id,
    email: serverUser.email,
    name: serverUser.name,
    createdAt: new Date(serverUser.createdAt),
    updatedAt: new Date(serverUser.updatedAt)
  };
}

// Export getStoredToken as getAuthToken for compatibility
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

async function storeAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    console.log('Token stored successfully');
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
}

async function removeAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    console.log('Token removed successfully');
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
}

export async function validateToken(token: string): Promise<User | null> {
  try {
    console.log('Making validate request...');
    const response = await fetch(`${API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Validate response status:', response.status);
    if (!response.ok) {
      console.log('Token validation failed');
      return null;
    }

    const data: AuthResponse = await response.json();
    console.log('Validate response data:', data);

    if (!data.success || !data.data?.user) {
      console.log('Invalid response format');
      return null;
    }

    return transformUser(data.data.user);
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function signup(userData: CreateUserInput): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data: AuthResponse = await response.json();

    if (!data.success || !data.data?.user || !data.data?.token) {
      throw new AuthError(data.message || 'Error creating account');
    }

    await storeAuthToken(data.data.token);
    return transformUser(data.data.user);
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof AuthError) throw error;
    throw new AuthError('Failed to create account');
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    console.log('Attempting login...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);
    const text = await response.text();
    console.log('Raw response:', text);

    let data: AuthResponse;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new AuthError('Invalid server response');
    }

    console.log('Parsed response:', data);

    if (!data.success || !data.data?.user || !data.data?.token) {
      throw new AuthError(data.message || 'Invalid credentials');
    }

    const { user, token } = data.data;
    console.log('Storing token...');
    await storeAuthToken(token);

    const transformedUser = transformUser(user);
    console.log('Login successful:', transformedUser.email);
    return transformedUser;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof AuthError) throw error;
    throw new AuthError('Login failed');
  }
}

export async function logout(): Promise<void> {
  try {
    await removeAuthToken();
  } catch (error) {
    console.error('Logout error:', error);
    throw new AuthError('Error logging out');
  }
}