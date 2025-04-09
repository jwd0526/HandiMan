// src/components/course/CourseSearch/index.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search as SearchIcon, PlusCircle as PlusCircleIcon } from 'lucide-react-native';
import { Course } from 'shared';
import { useCourses } from '../../../hooks/useCourses';
import { debounce } from 'lodash';
import { styles } from './styles';
import { MainStackParamList } from '../../../config/navigation';

interface CourseSearchProps {
  onSelect: (course: Course) => void;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

function NoResults() {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No courses found</Text>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddCourse')}
      >
        <PlusCircleIcon size={20} color="#2f95dc" />
        <Text style={styles.addButtonText}>Add New Course</Text>
      </TouchableOpacity>
    </View>
  );
}

function CourseList({ courses, onSelect }: { courses: Course[], onSelect: (course: Course) => void }) {
  return (
    <View style={styles.resultsContainer}>
      {courses.map((course) => (
        <TouchableOpacity
          key={course._id}
          style={styles.courseItem}
          onPress={() => onSelect(course)}
        >
          <Text style={styles.courseName}>{course.name}</Text>
          {course.location.city && (
            <Text style={styles.courseLocation}>
              {[course.location.city, course.location.state]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function CourseSearch({ onSelect }: CourseSearchProps) {
  const { courses, loading, error, searchCourses } = useCourses();
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        return;
      }
      await searchCourses(searchQuery);
    }, 300),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find a Course</Text>

      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search for a course"
          placeholderTextColor="#999"
          autoCapitalize="words"
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      )}

      {!loading && courses.length > 0 && (
        <CourseList courses={courses} onSelect={onSelect} />
      )}

      {!loading && query.length >= 2 && courses.length === 0 && (
        <NoResults />
      )}

      {error && (
        <Text style={styles.errorText}>
          Error searching courses. Please try again.
        </Text>
      )}
    </View>
  );
}