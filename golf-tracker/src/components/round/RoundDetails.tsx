// src/components/round/RoundDetails.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Course } from 'shared';
import { FormInput } from '../FormInput';
import { FormButton } from '../FormButton';

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
  notes: string;
  onNotesChange: (notes: string) => void;
  errors: {[key: string]: string};
  loading: boolean;
  onSubmit: () => void;
  onChangeCourse: () => void;
}

export function RoundDetails({
  course,
  selectedTee,
  onTeeSelect,
  date,
  showDatePicker,
  onShowDatePicker,
  onDateChange,
  score,
  onScoreChange,
  putts,
  onPuttsChange,
  fairways,
  onFairwaysChange,
  notes,
  onNotesChange,
  errors,
  loading,
  onSubmit,
  onChangeCourse,
}: RoundDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.selectedCourse}>
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

        <View style={styles.teeSelection}>
          <Text style={styles.label}>Select Tee</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {course.tees.map((tee) => (
              <TouchableOpacity
                key={tee.name}
                style={[
                  styles.teeButton,
                  selectedTee === tee.name && styles.teeButtonSelected
                ]}
                onPress={() => onTeeSelect(tee.name)}
              >
                <Text style={[
                  styles.teeButtonText,
                  selectedTee === tee.name && styles.teeButtonTextSelected
                ]}>
                  {tee.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.tee && <Text style={styles.errorText}>{errors.tee}</Text>}
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => onShowDatePicker(true)}
        >
          <Text style={styles.label}>Date</Text>
          <Text style={styles.dateText}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

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
            label="Fairways Hit"
            value={fairways}
            onChangeText={onFairwaysChange}
            keyboardType="numeric"
            placeholder="Fairways hit"
            error={errors.fairways}
            editable={!loading}
          />
        </View>

        <FormInput
          label="Notes"
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Add notes about your round"
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <FormButton
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
  },
  selectedCourse: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedCourseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectedCourseName: {
    fontSize: 18,
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
  dateText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  scoreInputs: {
    gap: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
});