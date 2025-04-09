// src/screens/course/AddCourse/index.tsx
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../config/navigation';
import { FormInput } from '../../../components/forms/FormInput';
import { FormButton } from '../../../components/forms/FormButton';
import { BackButton } from '../../../components/common/BackButton';
import { useCourses } from '../../../hooks/useCourses';
import { useAuth } from '../../../hooks/useAuth';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'AddCourse'>;

export function AddCourseScreen({ navigation }: Props) {
  const { createCourse } = useCourses();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Course name is required';
    }
    
    // At least city and state are required if in the US
    if (country.toLowerCase() === 'usa' || country.toLowerCase() === 'us' || country.toLowerCase() === 'united states') {
      if (!city.trim()) newErrors.city = 'City is required for US courses';
      if (!state.trim()) newErrors.state = 'State is required for US courses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      await createCourse({
        name: name.trim(),
        location: {
          city: city.trim(),
          state: state.trim(),
          country: country.trim()
        },
        addedBy: user._id
      });

      Alert.alert(
        'Success',
        'Course added successfully',
        [{
          text: 'OK',
          onPress: () => navigation.goBack()
        }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'Failed to add course'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <FormInput
          label="Course Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter course name"
          error={errors.name}
          editable={!loading}
          required
        />

        <FormInput
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Enter city"
          error={errors.city}
          editable={!loading}
        />

        <FormInput
          label="State/Province"
          value={state}
          onChangeText={setState}
          placeholder="Enter state or province"
          error={errors.state}
          editable={!loading}
        />

        <FormInput
          label="Country"
          value={country}
          onChangeText={setCountry}
          placeholder="Enter country"
          error={errors.country}
          editable={!loading}
        />

        <FormButton
          title="Add Course"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}