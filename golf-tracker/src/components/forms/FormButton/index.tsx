// src/components/forms/FormButton/index.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { styles } from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormButton({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: FormButtonProps) {
  const getButtonStyle = () => {
    const buttonStyles = [
      styles.button,
      styles[`button${size.charAt(0).toUpperCase()}${size.slice(1)}`],
      styles[`button${variant.charAt(0).toUpperCase()}${variant.slice(1)}`],
      fullWidth && styles.buttonFullWidth,
      (disabled || loading) && styles.buttonDisabled,
      style,
    ];
    
    return buttonStyles;
  };

  const getTextStyle = () => {
    const textStyles = [
      styles.buttonText,
      styles[`text${variant.charAt(0).toUpperCase()}${variant.slice(1)}`],
      styles[`text${size.charAt(0).toUpperCase()}${size.slice(1)}`],
      disabled && styles.textDisabled,
      textStyle,
    ];
    
    return textStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#fff' : '#2f95dc'} 
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <React.Fragment>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
}