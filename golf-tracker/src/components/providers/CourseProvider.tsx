// Optional: Create a context provider for app-wide course state
import React, { createContext, useContext } from 'react';
import { useCourses } from '../../hooks/useCourses';

const CoursesContext = createContext<ReturnType<typeof useCourses> | undefined>(undefined);

export function CoursesProvider({ children }: { children: React.ReactNode }) {
  const courses = useCourses();
  return <CoursesContext.Provider value={courses}>{children}</CoursesContext.Provider>;
}

export function useCoursesContext() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCoursesContext must be used within a CoursesProvider');
  }
  return context;
}