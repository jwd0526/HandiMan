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
    
    // Note: We don't need to add userId as a query param since the server uses the JWT token
    // to identify the user. But we keep the parameter for API consistency.
    
    if (options?.limit) url.searchParams.append('limit', options.limit.toString());
    if (options?.offset) url.searchParams.append('offset', options.offset.toString());
    if (options?.sortBy) url.searchParams.append('sortBy', options.sortBy);
    if (options?.sortOrder) url.searchParams.append('sortOrder', options.sortOrder);

    try {
      console.log('Fetching rounds from API:', url.toString());
      const response = await fetch(url.toString(), { method: 'GET', headers });
      const data = await this.handleResponse(response);
      console.log('Received rounds data:', data.data ? 'count: ' + (Array.isArray(data.data) ? data.data.length : 0) : 'No data');
      
      // Process rounds data to check for putts values
      const rounds = Array.isArray(data.data) ? data.data : [];
      
      // Log the putts values from each round to help debug
      console.log('[ROUNDS DATA] Putts values in rounds:');
      const puttsValues = rounds.map(round => round.putts).filter(p => p !== undefined);
      const sortedPutts = [...puttsValues].sort((a, b) => a - b);
      console.log(`All putts values: ${puttsValues.join(', ')}`);
      console.log(`Best (lowest) putts value: ${sortedPutts[0] || 'None'}`);
      
      return rounds;
    } catch (error) {
      console.error('Error in getUserRounds:', error);
      throw error;
    }
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
    try {
      console.log(`Deleting round with ID: ${roundId}`);
      const response = await fetch(`${API_URL}/rounds/${roundId}`, {
        method: 'DELETE',
        headers
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        throw new RoundError('Server returned an invalid response format');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new RoundError(data.message || 'Failed to delete round');
      }
      
      console.log('Round deleted successfully:', data);
      return;
    } catch (error) {
      console.error('Error in deleteRound:', error);
      if (error instanceof SyntaxError) {
        // JSON parse error
        throw new RoundError('Invalid response from server. Please try again later.');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const roundService = new RoundService();