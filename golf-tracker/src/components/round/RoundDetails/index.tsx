// src/components/round/RoundDetails/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Course } from 'shared';
import { FormInput } from '../../forms/FormInput';
import { FormButton } from '../../forms/FormButton';
import { TeeSelector } from '../../course/TeeSelector';
import { styles } from './styles';

interface RoundDetailsProps {
  course: Course;
  selectedTee: string;
  onTeeSelect: (tee: string) => void;
  date: Date;
  onDateChange: (date: Date) => void;
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
}: RoundDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.courseHeader}>
        <View>
          <Text style={styles.courseName}>{course.name}</Text>
          {course.location.city && (
            <Text style={styles.courseLocation}>
              {[course.location.city, course.location.state]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onChangeCourse}
          style={styles.changeButton}
        >
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      <TeeSelector
        course={course}
        selectedTee={selectedTee}
        onTeeSelect={onTeeSelect}
        error={errors.tee}
      />

      <View style={styles.dateContainer}>
        <Text style={styles.label}>Date Played</Text>
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              onDateChange(selectedDate);
            }
          }}
          maximumDate={new Date()}
          style={styles.datePicker}
        />
      </View>

      <View style={styles.statsContainer}>
        <FormInput
          label="Score"
          value={score}
          onChangeText={onScoreChange}
          keyboardType="numeric"
          placeholder="Enter total score"
          error={errors.score}
          editable={!loading}
          containerStyle={styles.halfInput}
        />

        <FormInput
          label="Putts"
          value={putts}
          onChangeText={onPuttsChange}
          keyboardType="numeric"
          placeholder="Total putts"
          error={errors.putts}
          editable={!loading}
          containerStyle={styles.halfInput}
        />

        <FormInput
          label="Fairways Hit"
          value={fairways}
          onChangeText={onFairwaysChange}
          keyboardType="numeric"
          placeholder="# of fairways"
          error={errors.fairways}
          editable={!loading}
          containerStyle={styles.halfInput}
        />

        <FormInput
          label="Greens in Regulation"
          value={greens}
          onChangeText={onGreensChange}
          keyboardType="numeric"
          placeholder="# of GIRs"
          error={errors.greens}
          editable={!loading}
          containerStyle={styles.halfInput}
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
        containerStyle={styles.notesInput}
      />

      <FormButton
        title="Save Round"
        onPress={onSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </View>
  );
}