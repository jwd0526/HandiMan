// src/screens/AddRoundScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createRound } from '../services/rounds';
import { useAuth } from '../contexts/AuthContext';
import { MainStackParamList } from '../types/navigation';
import { Course } from 'shared';
import { CourseSearch } from '../components/course/CourseSearch';
import { RoundDetails } from '../components/round/RoundDetails';

type Props = NativeStackScreenProps<MainStackParamList, 'AddRound'>;

export default function AddRoundScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [score, setScore] = useState('');
  const [putts, setPutts] = useState('');
  const [fairways, setFairways] = useState('');
  const [greens, setGreens] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedCourse) newErrors.course = 'Please select a course';
    if (!selectedTee) newErrors.tee = 'Please select tee';
    if (!score) {
      newErrors.score = 'Score is required';
    } else if (isNaN(Number(score)) || Number(score) < 1) {
      newErrors.score = 'Please enter a valid score';
    }
    if (!putts) {
      newErrors.putts = 'Number of putts is required';
    } else if (isNaN(Number(putts)) || Number(putts) < 0) {
      newErrors.putts = 'Please enter a valid number of putts';
    }
    if (!fairways) {
      newErrors.fairways = 'Fairways hit is required';
    } else if (isNaN(Number(fairways)) || Number(fairways) < 0) {
      newErrors.fairways = 'Please enter a valid number of fairways';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user || !selectedCourse) return;
  
    setLoading(true);
    try {
      console.log('Submitting round with data:', {
        course: selectedCourse._id,
        date,
        tees: selectedTee,
        score: Number(score),
        putts: Number(putts),
        fairways: Number(fairways),
        greens: Number(greens),
        notes,
        addedBy: user._id,
      });
  
      await createRound({
        course: selectedCourse._id,
        date: date.toISOString(),
        tees: selectedTee,
        score: Number(score),
        putts: Number(putts),
        fairways: Number(fairways),
        greens: Number(greens),
        notes: notes.trim() || undefined,
        addedBy: user._id,
      });
  
      Alert.alert('Success', 'Round added successfully', [{
        text: 'OK',
        onPress: () => navigation.goBack()
      }]);
    } catch (error) {
      console.error('Error submitting round:', error);
      
      // Show a more specific error message if available
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add round. Please try again.';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ height: '100%' }}>
        {!selectedCourse ? (
          <CourseSearch onSelect={setSelectedCourse} />
        ) : (
          <RoundDetails
            course={selectedCourse}
            selectedTee={selectedTee}
            onTeeSelect={setSelectedTee}
            date={date}
            showDatePicker={showDatePicker}
            onShowDatePicker={setShowDatePicker}
            onDateChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            score={score}
            onScoreChange={setScore}
            putts={putts}
            onPuttsChange={setPutts}
            fairways={fairways}
            onFairwaysChange={setFairways}
            greens={greens}
            onGreensChange={setGreens}
            notes={notes}
            onNotesChange={setNotes}
            errors={errors}
            loading={loading}
            onSubmit={handleSubmit}
            onChangeCourse={() => setSelectedCourse(null)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
});