// src/components/course/CourseStates.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusCircle as PlusCircleIcon } from 'lucide-react-native';

interface NoResultsProps {
  onAddNew: () => void;
}

export function NoResults({ onAddNew }: NoResultsProps) {
  return (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No courses found</Text>
      <TouchableOpacity
        style={styles.addCourseButton}
        onPress={onAddNew}
      >
        <PlusCircleIcon size={20} color="#2f95dc" />
        <Text style={styles.addCourseText}>Add New Course</Text>
      </TouchableOpacity>
    </View>
  );
}

export function InitialState() {
  return (
    <View style={styles.initialStateContainer}>
      <Text style={styles.initialStateText}>
        Search for a golf course to start tracking your round
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  addCourseText: {
    color: '#2f95dc',
    fontSize: 16,
    fontWeight: '500',
  },
  initialStateContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  initialStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});