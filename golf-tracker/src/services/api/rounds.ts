// src/services/api/rounds.ts
import { Round, CreateRoundInput } from 'shared';
import { authService } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export class RoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoundError';
  }
}

interface RoundResponse {
  success: boolean;
  data: Round | Round[];
  message?: string;
}

class RoundService {
  /**
   * Get auth headers
   */
  private async getHeaders(): Promise<Headers> {
    const token = await authService.getToken();
    if (!token) {
      throw new RoundError('No auth token found');
    }

    return new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: Response): Promise<RoundResponse> {
    const data = await response.json();
    if (!response.ok) {
      throw new RoundError(data.message || 'Round operation failed');
    }
    return data;
  }

  /**
   * Format date for API
   */
  private formatDate(date: Date | string): string {
    return date instanceof Date ? date.toISOString() : date;
  }

  /**
   * Get user rounds
   */
  async getUserRounds(userId: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'score';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Round[]> {
    const headers = await this.getHeaders();
    const url = new URL(`${API_URL}/rounds`);
    
    url.searchParams.append('userId', userId);
    if (options?.limit) url.searchParams.append('limit', options.limit.toString());
    if (options?.offset) url.searchParams.append('offset', options.offset.toString());
    if (options?.sortBy) url.searchParams.append('sortBy', options.sortBy);
    if (options?.sortOrder) url.searchParams.append('sortOrder', options.sortOrder);

    const response = await fetch(url.toString(), { method: 'GET', headers });
    const data = await this.handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  }

  /**
   * Create round
   */
  async createRound(roundData: CreateRoundInput): Promise<Round> {
    const headers = await this.getHeaders();
    const formattedData = {
      ...roundData,
      date: this.formatDate(roundData.date)
    };

    const response = await fetch(`${API_URL}/rounds`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData)
    });

    const data = await this.handleResponse(response);
    return data.data as Round;
  }

  /**
   * Delete round
   */
  async deleteRound(roundId: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/rounds/${roundId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const data = await response.json();
      throw new RoundError(data.message || 'Failed to delete round');
    }
  }
}

// Export singleton instance
export const roundService = new RoundService();