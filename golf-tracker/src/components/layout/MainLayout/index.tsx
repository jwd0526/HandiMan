// src/components/layout/MainLayout/index.tsx
import React from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import { BackButton } from '../../common/BackButton';
import { styles } from './styles';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showHeader?: boolean;
  contentContainerStyle?: ViewStyle;
  headerRight?: React.ReactNode;
  scrollEnabled?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerStyle?: ViewStyle;
}

export function MainLayout({
  children,
  showBack = false,
  showHeader = true,
  contentContainerStyle,
  headerRight,
  scrollEnabled = true,
  refreshing = false,
  onRefresh,
  headerStyle,
}: MainLayoutProps) {
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          {showBack && <BackButton />}
        </View>
        <View style={styles.headerRight}>
          {headerRight}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (!scrollEnabled) {
      return (
        <View style={[styles.content, contentContainerStyle]}>
          {children}
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2f95dc"
              colors={['#2f95dc']}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          animated={true}
        />
        
        {renderHeader()}

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}