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
  
  // Helper to convert date strings to Date objects if needed
  // With our updated types, this is technically optional, but it helps
  // maintain consistency in the client-side objects
  private convertGoalDates(goal: any): Goal {
    // Only convert if needed - this preserves the client-created Date objects
    // and only converts server-provided string dates
    
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
      const goals = Array.isArray(data.data) ? data.data : [];
      
      // Log any putts goals to help with debugging
      goals.forEach(goal => {
        if (goal.category === 'putts') {
          console.log(`[API] Received putts goal: ${goal.name}, ID: ${goal._id}, Value: ${goal.currentValue}, Achieved: ${goal.achieved}`);
        }
      });
      
      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(goalData: CreateGoalInput & { achieved?: boolean, completedAt?: Date }): Promise<Goal> {
    try {
      const headers = await this.getHeaders();
      
      // Log the request body for debugging
      if (goalData.category === 'putts') {
        console.log(`[API] Creating putts goal with initial value: ${goalData.currentValue}, achieved: ${goalData.achieved}`);
      }
      
      const response = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(goalData)
      });

      const data = await this.handleResponse(response);
      const updatedGoal = data.data as Goal;
      
      // Log if this is a putts goal
      if (updatedGoal.category === 'putts') {
        console.log(`[API] Goal created for putts goal: ID: ${updatedGoal._id}, Value: ${updatedGoal.currentValue}, Achieved: ${updatedGoal.achieved}`);
      }
      
      return updatedGoal;
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
      const updatedGoal = data.data as Goal;
      
      // Log if this is a putts goal
      if (updatedGoal.category === 'putts') {
        console.log(`[API] Goal toggle response for putts goal: ID: ${updatedGoal._id}, Value: ${updatedGoal.currentValue}, Achieved: ${updatedGoal.achieved}`);
      }
      
      return updatedGoal;
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
    completedAtStr?: string,
    currentValue?: number
  ): Promise<Goal> {
    try {
      const headers = await this.getHeaders();
      
      // Prepare request body
      const requestBody: any = { 
        achieved,
        completedAt: achieved ? completedAtStr || new Date().toISOString() : undefined
      };
      
      // Include currentValue if provided (important for preserving stats)
      if (currentValue !== undefined) {
        requestBody.currentValue = currentValue;
      }
      
      console.log(`Toggling goal ${goalId} achievement to ${achieved} with currentValue:`, currentValue);
      
      const response = await fetch(`${API_URL}/goals/${goalId}/achievement`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await this.handleResponse(response);
      const updatedGoal = data.data as Goal;
      
      // Log if this is a putts goal
      if (updatedGoal.category === 'putts') {
        console.log(`[API] Goal toggle response for putts goal: ID: ${updatedGoal._id}, Value: ${updatedGoal.currentValue}, Achieved: ${updatedGoal.achieved}`);
      }
      
      return updatedGoal;
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