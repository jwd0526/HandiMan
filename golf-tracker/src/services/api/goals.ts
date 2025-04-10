// src/services/api/goals.ts
import type { Goal, CreateGoalInput } from 'shared';
import { authService } from './auth';

// Make sure we use the same API URL as other services
import { API_URL } from '../../config/constants';

export class GoalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoalError';
  }
}

interface GoalResponse {
  success: boolean;
  data: Goal | Goal[];
  message?: string;
}

class GoalService {
  /**
   * Get auth headers
   */
  private async getHeaders(): Promise<Headers> {
    const token = await authService.getToken();
    if (!token) {
      throw new GoalError('No auth token found');
    }

    return new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: Response): Promise<GoalResponse> {
    // Check content type to debug issues
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Not JSON - get the text to see what's being returned
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new GoalError('Server returned an invalid response format');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new GoalError(data.message || 'Goal operation failed');
    }
    
    // Convert date strings to Date objects for proper typing
    if (Array.isArray(data.data)) {
      // Handle array of goals
      data.data = data.data.map(this.convertGoalDates);
    } else if (data.data) {
      // Handle single goal
      data.data = this.convertGoalDates(data.data);
    }
    
    return data;
  }
  
  // Helper to convert date strings to Date objects
  private convertGoalDates(goal: any): Goal {
    // Convert standard date fields
    if (goal.createdAt && typeof goal.createdAt === 'string') {
      goal.createdAt = new Date(goal.createdAt);
    }
    if (goal.updatedAt && typeof goal.updatedAt === 'string') {
      goal.updatedAt = new Date(goal.updatedAt);
    }
    // Convert goal-specific date fields
    if (goal.completedAt && typeof goal.completedAt === 'string') {
      goal.completedAt = new Date(goal.completedAt);
    }
    if (goal.targetDate && typeof goal.targetDate === 'string') {
      goal.targetDate = new Date(goal.targetDate);
    }
    return goal;
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing goals API connection...');
      const response = await fetch(`${API_URL}/goals/test`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Test connection failed:', text);
        return false;
      }
      
      const data = await response.json();
      console.log('Test connection successful:', data);
      return true;
    } catch (error) {
      console.error('Test connection error:', error);
      return false;
    }
  }

  /**
   * Get all goals for current user
   */
  async getUserGoals(): Promise<Goal[]> {
    try {
      // First test API connectivity
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.warn('API connection test failed, but trying to get goals anyway');
      }
      
      const headers = await this.getHeaders();
      console.log('Fetching goals from URL:', `${API_URL}/goals`);
      console.log('With headers:', JSON.stringify(Object.fromEntries([...headers.entries()])));
      
      const response = await fetch(`${API_URL}/goals`, {
        method: 'GET',
        headers
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers])));
      
      const data = await this.handleResponse(response);
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(goalData: CreateGoalInput): Promise<Goal> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(goalData)
      });

      const data = await this.handleResponse(response);
      return data.data as Goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  /**
   * Update an existing goal
   */
  async updateGoal(goalId: string, goalData: Partial<Goal>): Promise<Goal> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}/goals/${goalId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(goalData)
      });

      const data = await this.handleResponse(response);
      return data.data as Goal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  /**
   * Toggle goal achievement status
   */
  async toggleGoalAchievement(
    goalId: string, 
    achieved: boolean, 
    completedAtStr?: string
  ): Promise<Goal> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}/goals/${goalId}/achievement`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ 
          achieved,
          completedAt: achieved ? completedAtStr || new Date().toISOString() : undefined
        })
      });

      const data = await this.handleResponse(response);
      return data.data as Goal;
    } catch (error) {
      console.error('Error toggling goal achievement:', error);
      throw error;
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const goalService = new GoalService();