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
import { User } from 'shared';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen({ navigation }: Props) {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    setFormErrors({});
    setGeneralError('');

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
    setGeneralError('');
  
    try {
      const userData = await login(email, password);
      const user: User = {
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      };
      setUser(user);
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof AuthError) {
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