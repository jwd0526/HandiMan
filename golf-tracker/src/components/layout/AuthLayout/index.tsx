// src/components/layout/AuthLayout/index.tsx
import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import { styles } from './styles';

interface AuthLayoutProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  scrollEnabled?: boolean;
  showStatusBar?: boolean;
}

export function AuthLayout({
  children,
  contentContainerStyle,
  scrollEnabled = true,
  showStatusBar = true,
}: AuthLayoutProps) {
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {showStatusBar && (
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#fff"
            animated={true}
          />
        )}
        
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {scrollEnabled ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                contentContainerStyle,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, contentContainerStyle]}>
              {children}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
