// src/services/api/courses.ts
import { Course, CreateCourseInput } from 'shared';
import { authService } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export class CourseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CourseError';
  }
}

interface CourseResponse {
  success: boolean;
  data: Course | Course[];
  message?: string;
}

class CourseService {
  /**
   * Get auth headers
   */
  private async getHeaders(): Promise<Headers> {
    const token = await authService.getToken();
    if (!token) {
      throw new CourseError('No auth token found');
    }

    return new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: Response): Promise<CourseResponse> {
    const data = await response.json();
    if (!response.ok) {
      throw new CourseError(data.message || 'Course operation failed');
    }
    return data;
  }

  /**
   * Search courses
   */
  async searchCourses(query: string): Promise<Course[]> {
    const headers = await this.getHeaders();
    const response = await fetch(
      `${API_URL}/courses?search=${encodeURIComponent(query)}`,
      { method: 'GET', headers }
    );

    const data = await this.handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  }

  /**
   * Create course
   */
  async createCourse(courseData: CreateCourseInput): Promise<Course> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(courseData)
    });

    const data = await this.handleResponse(response);
    return data.data as Course;
  }

  /**
   * Add tee to course
   */
  async addTeeToCourse(
    courseId: string,
    teeData: {
      name: string;
      rating: number;
      slope: number;
      numberOfFairways: number;
    }
  ): Promise<Course> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/courses/${courseId}/tees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(teeData)
    });

    const data = await this.handleResponse(response);
    return data.data as Course;
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const data = await response.json();
      throw new CourseError(data.message || 'Failed to delete course');
    }
  }
}

// Export singleton instance
export const courseService = new CourseService();