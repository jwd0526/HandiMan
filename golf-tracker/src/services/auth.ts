// src/services/auth.ts
import * as SecureStore from 'expo-secure-store';
import { User, CreateUserInput } from 'shared';

const API_URL = 'http://localhost:3000/api';
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
    ...serverUser,
    createdAt: new Date(serverUser.createdAt),
    updatedAt: new Date(serverUser.updatedAt)
  };
}

async function storeAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function validateToken(token: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return null;

    const data: AuthResponse = await response.json();
    return data.success && data.data?.user ? transformUser(data.data.user) : null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function signup(userData: CreateUserInput): Promise<User> {
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
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new AuthError('Invalid server response');
    }
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data.success || !data.data?.user || !data.data?.token) {
      throw new AuthError(data.message || 'Invalid credentials');
    }

    const { user, token } = data.data;
    console.log('User data before transform:', user);

    await storeAuthToken(token);

    // Create user object explicitly
    const transformedUser: User = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };

    console.log('Transformed user:', transformedUser);
    return transformedUser;
  } catch (error) {
    console.error('Login error:', error);
    throw new AuthError('Login failed');
  }
}

export async function logout(): Promise<void> {
  try {
    await removeAuthToken();
  } catch (error) {
    throw new AuthError('Error logging out');
  }
}