// src/screens/rounds/AddRound/index.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Modal, View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../config/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useRounds } from '../../../hooks/useRounds';
import { useGoals } from '../../../hooks/useGoals';
import { Course } from 'shared';
import { CourseSearch } from '../../../components/course/CourseSearch';
import { RoundDetails } from '../../../components/round/RoundDetails';
import { styles } from './styles';
import { BackButton } from '../../../components/common/BackButton';
import { Award } from 'lucide-react-native';

type Props = NativeStackScreenProps<MainStackParamList, 'AddRound'>;

export function AddRoundScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { createRound } = useRounds();
  const { newlyAchievedGoals, setNewlyAchievedGoals } = useGoals();
  
  // Course selection state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState('');
  
  // Round details state
  const [date, setDate] = useState(new Date());
  const [score, setScore] = useState('');
  const [putts, setPutts] = useState('');
  const [fairways, setFairways] = useState('');
  const [greens, setGreens] = useState('');
  const [notes, setNotes] = useState('');
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScale] = useState(new Animated.Value(0));

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedCourse) {
      newErrors.course = 'Please select a course';
    }
    if (!selectedTee) {
      newErrors.tee = 'Please select tee';
    }
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
    if (!greens) {
      newErrors.greens = 'Greens hit is required';
    } else if (isNaN(Number(greens)) || Number(greens) < 0) {
      newErrors.greens = 'Please enter a valid number of greens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show achievement celebration
  const showAchievementCelebration = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(celebrationScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setTimeout(() => {
        setShowCelebration(false);
        celebrationScale.setValue(0);
        // Clear achievements after showing them
        setNewlyAchievedGoals([]);
        // Navigate back
        navigation.goBack();
      }, 3000);
    });
  };
  
  // Check for newly achieved goals after round submission
  useEffect(() => {
    if (newlyAchievedGoals.length > 0) {
      showAchievementCelebration();
    }
  }, [newlyAchievedGoals]);

  const handleSubmit = async () => {
    if (!validateForm() || !user || !selectedCourse) return;

    setLoading(true);
    try {
      await createRound({
        course: selectedCourse,
        date: date.toISOString(),
        tees: selectedTee,
        score: Number(score),
        putts: Number(putts),
        fairways: Number(fairways),
        greens: Number(greens),
        notes: notes.trim() || undefined
      });

      // Check if we have newly achieved goals
      if (newlyAchievedGoals.length > 0) {
        // The celebration will show from the useEffect
      } else {
        // Show regular success message and navigate back
        Alert.alert(
          'Success',
          'Round added successfully',
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
      }
    } catch (error) {
      console.error('Error submitting round:', error);
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'Failed to add round. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton/>
      <ScrollView contentContainerStyle={styles.content}>
        {!selectedCourse ? (
          <CourseSearch onSelect={setSelectedCourse} />
        ) : (
          <RoundDetails
            course={selectedCourse}
            selectedTee={selectedTee}
            onTeeSelect={setSelectedTee}
            date={date}
            onDateChange={setDate}
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
      
      {/* Goal achievement celebration modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.celebrationOverlay}>
          <Animated.View 
            style={[
              styles.celebrationContent,
              { transform: [{ scale: celebrationScale }] }
            ]}
          >
            <Award size={60} color="#4CAF50" />
            <Text style={styles.celebrationTitle}>Goal Achieved!</Text>
            
            {newlyAchievedGoals.length === 1 ? (
              <Text style={styles.celebrationText}>
                Congratulations! You've achieved your goal:
              </Text>
            ) : (
              <Text style={styles.celebrationText}>
                Congratulations! You've achieved multiple goals:
              </Text>
            )}
            
            <View style={styles.goalsList}>
              {newlyAchievedGoals.map(goal => (
                <View key={goal._id} style={styles.goalItem}>
                  <Award size={16} color="#4CAF50" />
                  <Text style={styles.goalItemText}>{goal.name}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}