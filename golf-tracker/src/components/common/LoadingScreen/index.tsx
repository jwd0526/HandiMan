// src/components/common/LoadingScreen/index.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { styles } from './styles';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2f95dc" />
    </View>
  );
}