// src/hooks/useCourses.ts
import { useState, useCallback } from 'react';
import { Course, CreateCourseInput } from 'shared';
import { courseService } from '../services/api/courses';

interface UseCourses {
  courses: Course[];
  loading: boolean;
  error: string | null;
  searchCourses: (query: string) => Promise<void>;
  createCourse: (courseData: CreateCourseInput) => Promise<Course>;
  addTeeToCourse: (
    courseId: string,
    teeData: {
      name: string;
      rating: number;
      slope: number;
      numberOfFairways: number;
    }
  ) => Promise<Course>;
}

export function useCourses(): UseCourses {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCourses = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await courseService.searchCourses(query);
      setCourses(results);
    } catch (error) {
      console.error('Error searching courses:', error);
      setError(error instanceof Error ? error.message : 'Failed to search courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (courseData: CreateCourseInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const newCourse = await courseService.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error instanceof Error ? error.message : 'Failed to create course');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeeToCourse = useCallback(async (
    courseId: string,
    teeData: {
      name: string;
      rating: number;
      slope: number;
      numberOfFairways: number;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCourse = await courseService.addTeeToCourse(courseId, teeData);
      setCourses(prev => prev.map(course => 
        course._id === courseId ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (error) {
      console.error('Error adding tee to course:', error);
      setError(error instanceof Error ? error.message : 'Failed to add tee');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    courses,
    loading,
    error,
    searchCourses,
    createCourse,
    addTeeToCourse
  };
}