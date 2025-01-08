// src/components/round/RoundDetails.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Course } from 'shared';
import { FormInput } from '../FormInput';
import { FormButton } from '../FormButton';
import { TeeSelector } from '../course/TeeSelector';
import { addTeeToCourse } from '../../services/courses';

interface RoundDetailsProps {
  course: Course;
  selectedTee: string;
  onTeeSelect: (tee: string) => void;
  date: Date;
  showDatePicker: boolean;
  onShowDatePicker: (show: boolean) => void;
  onDateChange: (event: any, date?: Date) => void;
  score: string;
  onScoreChange: (score: string) => void;
  putts: string;
  onPuttsChange: (putts: string) => void;
  fairways: string;
  onFairwaysChange: (fairways: string) => void;
  greens: string;
  onGreensChange: (greens: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  errors: {[key: string]: string};
  loading: boolean;
  onSubmit: () => void;
  onChangeCourse: () => void;
  onCourseUpdate?: (course: Course) => void;
}

export function RoundDetails({
  course,
  selectedTee,
  onTeeSelect,
  date,
  onDateChange,
  score,
  onScoreChange,
  putts,
  onPuttsChange,
  fairways,
  onFairwaysChange,
  greens,
  onGreensChange,
  notes,
  onNotesChange,
  errors,
  loading,
  onSubmit,
  onChangeCourse,
  onCourseUpdate
}: RoundDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.selectedCourse}>
        <View >
          <View style={styles.selectedCourseHeader}>
            <View>
              <Text style={styles.selectedCourseName}>{course.name}</Text>
              {course.location.city && (
                <Text style={styles.selectedCourseLocation}>
                  {[course.location.city, course.location.state]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onChangeCourse}
              style={styles.changeCourseButton}
            >
              <Text style={styles.changeCourseText}>Change</Text>
            </TouchableOpacity>
          </View>
          <TeeSelector
            course={course}
            selectedTee={selectedTee}
            onTeeSelect={onTeeSelect}
            onAddTee={async (teeData) => {
              try {
                const updatedCourse = await addTeeToCourse(course._id, teeData);
                if (onCourseUpdate) {
                  onCourseUpdate(updatedCourse);
                }
                return updatedCourse;
              } catch (error) {
                console.error('Error adding tee:', error);
                throw error;
              }
            }}
          />
        </View>
        <View style={styles.dateButton}>
          <Text style={styles.label}>Date</Text>
          <DateTimePicker
            maximumDate={new Date()}
            style={{
              marginLeft: -10,
            }}
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        </View>

        <View style={styles.scoreInputs}>
          <FormInput
            label="Score"
            value={score}
            onChangeText={onScoreChange}
            keyboardType="numeric"
            placeholder="Enter total score"
            error={errors.score}
            editable={!loading}
          />
          <FormInput
            label="Putts"
            value={putts}
            onChangeText={onPuttsChange}
            keyboardType="numeric"
            placeholder="Total putts"
            error={errors.putts}
            editable={!loading}
          />
          <FormInput
            label="Fairways Hit (FIRs)"
            value={fairways}
            onChangeText={onFairwaysChange}
            keyboardType="numeric"
            placeholder="# of FIRs"
            error={errors.fairways}
            editable={!loading}
          />
          <FormInput
            label="Greens Hit (GIRs)"
            value={greens}
            onChangeText={onGreensChange}
            keyboardType="numeric"
            placeholder="# of GIRs"
            error={errors.greens}
            editable={!loading}
          />
        </View>

        <FormInput
          containerStyles={styles.notesContainer}
          style={styles.notes}
          label="Notes"
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Add notes about your round"
          multiline
          numberOfLines={10}
          editable={!loading}
        />

        <FormButton
          style={styles.saveButton}
          title="Save Round"
          onPress={onSubmit}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    maxHeight: '100%',
    minHeight: '100%',
  },
  selectedCourse: {
    minHeight: '100%',
  },
  selectedCourseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectedCourseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCourseLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  changeCourseButton: {
    padding: 8,
  },
  changeCourseText: {
    color: '#2f95dc',
    fontSize: 14,
    fontWeight: '600',
  },
  teeSelection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  teeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  teeButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  teeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  teeButtonTextSelected: {
    color: '#fff',
  },
  dateButton: {
    marginBottom: 16,
  },
  scoreInputs: {
    gap: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  notesContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  notes: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
});