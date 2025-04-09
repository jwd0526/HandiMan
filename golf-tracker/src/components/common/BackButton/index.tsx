// src/components/common/BackButton/index.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { styles } from './styles';
import { Text } from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
  title?: string;
  color?: string;
}

export function BackButton({ 
  onPress, 
  title = 'Back',
  color = '#2f95dc' 
}: BackButtonProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <ChevronLeft size={24} color={color} />
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

