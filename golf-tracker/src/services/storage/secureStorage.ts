// src/services/storage/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SETTINGS: 'user_settings',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Generic secure storage service with type safety
 */
class SecureStorageService {
  /**
   * Store a value securely
   */
  async store<T>(key: StorageKey, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await SecureStore.setItemAsync(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  /**
   * Retrieve a value from secure storage
   */
  async retrieve<T>(key: StorageKey): Promise<T | null> {
    try {
      const jsonValue = await SecureStore.getItemAsync(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      throw new Error(`Failed to retrieve ${key}`);
    }
  }

  /**
   * Remove a value from secure storage
   */
  async remove(key: StorageKey): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  /**
   * Clear all stored values
   */
  async clear(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map(key => this.remove(key)));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();