// src/components/course/CourseList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Course } from 'shared';
import { MapPin as MapPinIcon } from 'lucide-react-native';

interface CourseListProps {
  courses: Course[];
  onSelect: (course: Course) => void;
}

export function CourseList({ courses, onSelect }: CourseListProps) {
  return (
    <ScrollView style={styles.resultsContainer}>
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} onSelect={onSelect} />
      ))}
    </ScrollView>
  );
}

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

function CourseCard({ course, onSelect }: CourseCardProps) {
  return (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => onSelect(course)}
    >
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{course.name}</Text>
        {course.location.city && (
          <View style={styles.locationContainer}>
            <MapPinIcon size={14} color="#666" />
            <Text style={styles.locationText}>
              {[course.location.city, course.location.state].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.courseTeesContainer}>
        <Text style={styles.teesLabel}>
          {course.tees.length} {course.tees.length === 1 ? 'Tee' : 'Tees'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    maxHeight: 400,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  courseTeesContainer: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  teesLabel: {
    fontSize: 12,
    color: '#2f95dc',
    fontWeight: '500',
  },
});