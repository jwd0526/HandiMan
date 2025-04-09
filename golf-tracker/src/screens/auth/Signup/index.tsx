// src/screens/auth/Signup/index.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../config/navigation';
import { FormInput } from '../../../components/forms/FormInput';
import { FormButton } from '../../../components/forms/FormButton';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from '../../../hooks/useForm';
import { styles } from './styles';
import { 
  email,
  required, 
  minLength,
  matches,
  matchesField 
} from '../../../utils/validation';
import { BackButton } from '../../../components/common/BackButton';


type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: SignupForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const validationRules = {
  name: [required<SignupForm>('Name is required')],
  email: [
    required<SignupForm>('Email is required'), 
    email<SignupForm>()
  ],
  password: [
    required<SignupForm>('Password is required'),
    minLength<SignupForm>(8, 'Password must be at least 8 characters'),
    matches<SignupForm>(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
  ],
  confirmPassword: [
    required<SignupForm>('Please confirm your password'),
    matchesField<SignupForm>('password', 'Passwords do not match')
  ]
};

export function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setErrors
  } = useForm<SignupForm>({
    initialValues,
    validationRules,
    onSubmit: async (formValues) => {
      try {
        await signup({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password
        });
        
        Alert.alert(
          'Success',
          'Your account has been created successfully!',
          [{ text: 'OK' }]
        );
      } catch (error) {
        if (error instanceof Error) {
          // Handle specific error cases
          if (error.message.toLowerCase().includes('email already registered')) {
            setErrors({ email: 'This email is already registered' });
          } else if (error.message.toLowerCase().includes('network')) {
            Alert.alert(
              'Connection Error',
              'Please check your internet connection and try again.'
            );
          } else {
            Alert.alert('Error', error.message);
          }
        } else {
          Alert.alert(
            'Error',
            'An unexpected error occurred. Please try again later.'
          );
        }
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Track your golf progress</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder="Enter your name"
              autoComplete="name"
              error={touched.name ? errors.name : undefined}
              editable={!isSubmitting}
            />

            <FormInput
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder="Enter your email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              error={touched.email ? errors.email : undefined}
              editable={!isSubmitting}
            />

            <FormInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              placeholder="Create a password"
              secureTextEntry
              autoComplete="new-password"
              error={touched.password ? errors.password : undefined}
              editable={!isSubmitting}
            />

            <FormInput
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="new-password"
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              editable={!isSubmitting}
            />

            <FormButton
              title="Create Account"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}