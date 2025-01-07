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