// src/components/course/CourseSearch.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { Course } from 'shared';
import { FormInput } from '../FormInput';
import { FormButton } from '../FormButton';
import { searchCourses, createCourse } from '../../services/courses';
import { useAuth } from '../../contexts/AuthContext';
import { Search as SearchIcon, PlusCircle as PlusCircleIcon, MapPin as MapPinIcon } from 'lucide-react-native';
import { AddCourseModal } from './AddCourseModal';
import { CourseList } from './CourseList';
import { NoResults } from './CourseStates';
import { InitialState } from './CourseStates';

interface CourseSearchProps {
  onSelect: (course: Course) => void;
}

export function CourseSearch({ onSelect }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    Keyboard.dismiss();
    setSearching(true);
    try {
      const courses = await searchCourses(searchQuery);
      setSearchResults(courses);
    } catch (error) {
      Alert.alert('Error', 'Failed to search courses');
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.searchSection}>
      <Text style={styles.searchTitle}>Find a Course</Text>
      
      <View style={styles.searchInputContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#666" style={styles.searchIcon} />
          <FormInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by course name or city"
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <FormButton
          title="Search"
          onPress={handleSearch}
          loading={searching}
        />
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
    padding: 16,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
});