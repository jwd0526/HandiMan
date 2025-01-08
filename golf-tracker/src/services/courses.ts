// src/services/courses.ts
import { Course, CreateCourseInput } from 'shared';
import { getAuthToken } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function searchCourses(query: string): Promise<Course[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/courses?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search courses');
    }

    const data = await response.json();
    return data.data as Course[];
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
}

export async function createCourse(courseData: CreateCourseInput): Promise<Course> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    const data = await response.json();
    return data.data as Course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}


export async function addTeeToCourse(
  courseId: string,
  teeData: {
    name: string;
    rating: number;
    slope: number;
    numberOfFairways: number;
  }
): Promise<Course> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    console.log('Adding tee to course:', courseId, teeData);

    const response = await fetch(`${API_URL}/courses/${courseId}/tees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teeData)
    });

    if (!response.ok) {
      // Try to get error message from response
      const errorData = await response.json().catch(() => null);
      console.error('Server response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      throw new Error(
        errorData?.message || 
        `Failed to add tee to course: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response format from server');
    }

    return data.data as Course;
  } catch (error) {
    console.error('Error in addTeeToCourse:', error);
    throw error;
  }
}