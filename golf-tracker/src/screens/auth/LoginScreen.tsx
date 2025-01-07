// src/screens/auth/LoginScreen.tsx
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
import { login, AuthError } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen({ navigation }: Props) {
  const { setUser } = useAuth(); // Use the auth context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Reset errors
    setFormErrors({});
    setGeneralError('');

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
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
  
    setLoading(true);
    setGeneralError('');
  
    try {
      const userData = await login(email, password);
      // Add any missing required fields to match User type
      const userWithRequiredFields = {
        ...userData,
        password: '', // Add empty password since we don't want to store the actual password
        createdAt: new Date(userData.createdAt || Date.now()),
        updatedAt: new Date(userData.updatedAt || Date.now())
      };
      console.log('Login successful:', userData);
      setUser(userWithRequiredFields);
    } catch (err) {
      if (err instanceof AuthError) {
        // Handle specific auth errors
        if (err.message.toLowerCase().includes('invalid credentials')) {
          setGeneralError('Invalid email or password');
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
        console.error('Login error:', err);
        Alert.alert(
          'Error',
          'An unexpected error occurred. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'This feature is coming soon!',
      [{ text: 'OK' }]
    );
  };

  // Rest of the component remains the same...
  return (
    <SafeAreaView style={styles.container}>
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
            {generalError ? (
              <Text style={styles.generalError}>{generalError}</Text>
            ) : null}

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
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              error={formErrors.password}
              editable={!loading}
            />

            <TouchableOpacity 
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <FormButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Sign Up</Text>
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
  forgotPassword: {
    color: '#2f95dc',
    textAlign: 'right',
    marginVertical: 16,
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