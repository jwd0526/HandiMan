// src/components/course/CourseSearch.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { Course } from 'shared';
import { searchCourses, createCourse } from '../../services/courses';
import { useAuth } from '../../contexts/AuthContext';
import { Search as SearchIcon, PlusCircle as PlusCircleIcon, MapPin as MapPinIcon } from 'lucide-react-native';
import { AddCourseModal } from './AddCourseModal';
import { CourseList } from './CourseList';
import { NoResults } from './CourseStates';
import { InitialState } from './CourseStates';
import debounce from 'lodash/debounce';
import { BackButton } from '../BackButton';

interface CourseSearchProps {
  onSelect: (course: Course) => void;
}

export function CourseSearch({ onSelect }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const courses = await searchCourses(query);
      // Limit to 8 results
      setSearchResults(courses.slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search courses');
    } finally {
      setSearching(false);
    }
  };

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  return (
    <View style={styles.searchSection}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.searchTitle}>Find a Course</Text>
      </View>
      
      <View style={styles.searchInputContainer}>
        <SearchIcon size={20} color="#666" style={styles.searchIcon} />
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.searchInput}
            placeholderTextColor="#999"
            placeholder="Search for a course"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="words"
          />
        </View>
      </View>

      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      ) : searchResults.length > 0 ? (
        <CourseList courses={searchResults} onSelect={onSelect} />
      ) : searchQuery ? (
        <NoResults onAddNew={() => setShowAddModal(true)} />
      ) : (
        <InitialState />
      )}

      <AddCourseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (courseData) => {
          if (!user) throw new Error('User not authenticated');
          const course = await createCourse({
            ...courseData,
            addedBy: user._id,
          });
          onSelect(course);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    margin: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    height: 'auto',
  },
  searchIcon: {
    width: 'auto',
    height: 'auto',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});