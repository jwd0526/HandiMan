// src/screens/auth/Login/index.tsx
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
import { useAuthContext } from '../../../components/providers/AuthProvider';
import { useForm } from '../../../hooks/useForm';
import { styles } from './styles';
import { email as emailValidator, required } from '../../../utils/validation';
import { BackButton } from '../../../components/common/BackButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginForm {
  email: string;
  password: string;
}

const initialValues: LoginForm = {
  email: '',
  password: ''
};

const validationRules = {
  email: [required('Email is required'), emailValidator()],
  password: [required('Password is required')]
};

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuthContext();
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<LoginForm>({
    initialValues,
    validationRules,
    onSubmit: async (formValues) => {
      console.log('Login form submitted:', formValues);
      try {
        await login(formValues.email, formValues.password);
        console.log('Login successful');
      } catch (error) {
        console.error('Login error in screen:', error);
        Alert.alert(
          'Login Error',
          error instanceof Error
            ? error.message
            : 'An error occurred during login'
        );
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
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>
          <View style={styles.form}>
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
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              error={touched.password ? errors.password : undefined}
              editable={!isSubmitting}
            />

            <FormButton
              title="Login"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}