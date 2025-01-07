// src/screens/auth/SignupScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
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
import { AuthStackParamList } from '../../types/navigation';
import { FormInput } from '../../components/FormInput';
import { FormButton } from '../../components/FormButton';
import { signup, AuthError } from '../../services/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Reset errors
    setFormErrors({});
    setGeneralError('');

    // Name validation
    if (!name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      const user = await signup({
        name,
        email,
        password,
      });
      
      // TODO: Store user data in your app's global state (e.g., Context or Redux)
      console.log('Signup successful:', user);
      
      // Show success message
      Alert.alert(
        'Success',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Navigate to main app screen
              // navigation.replace('MainApp');
            },
          },
        ]
      );
      
    } catch (err) {
      if (err instanceof AuthError) {
        // Handle specific auth errors
        if (err.message.toLowerCase().includes('email already registered')) {
          setFormErrors(prev => ({
            ...prev,
            email: 'This email is already registered'
          }));
        } else if (err.message.toLowerCase().includes('network')) {
          Alert.alert(
            'Connection Error',
            'Please check your internet connection and try again.'
          );
        } else {
          setGeneralError(err.message);
        }
      } else {
        // Handle unexpected errors
        console.error('Signup error:', err);
        Alert.alert(
          'Error',
          'An unexpected error occurred. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            {generalError ? (
              <Text style={styles.generalError}>{generalError}</Text>
            ) : null}

            <FormInput
              label="Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setFormErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter your name"
              autoComplete="name"
              error={formErrors.name}
              editable={!loading}
            />

            <FormInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setFormErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder="Enter your email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              error={formErrors.email}
              editable={!loading}
            />

            <FormInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setFormErrors(prev => ({ ...prev, password: undefined }));
              }}
              placeholder="Create a password"
              secureTextEntry
              autoComplete="new-password"
              error={formErrors.password}
              editable={!loading}
            />

            <FormInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setFormErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="new-password"
              error={formErrors.confirmPassword}
              editable={!loading}
            />

            <FormButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  generalError: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#ffebeb',
    padding: 10,
    borderRadius: 8,
  },
  error: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#2f95dc',
    fontWeight: '600',
  },
});