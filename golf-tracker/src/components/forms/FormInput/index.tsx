// src/components/forms/FormInput/index.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { styles } from './styles';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormInput({
  label,
  error,
  helper,
  containerStyle,
  required = false,
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
  secureTextEntry,
  style,
  ...props
}: FormInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    return <View style={styles.leftIcon}>{leftIcon}</View>;
  };

  const renderRightIcon = () => {
    if (showPasswordToggle) {
      return (
        <TouchableOpacity 
          style={styles.rightIcon}
          onPress={togglePasswordVisibility}
        >
          {isPasswordVisible ? (
            <EyeOff size={20} color="#666" />
          ) : (
            <Eye size={20} color="#666" />
          )}
        </TouchableOpacity>
      );
    }
    if (!rightIcon) return null;
    return <View style={styles.rightIcon}>{rightIcon}</View>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      
      <View style={styles.inputWrapper}>
        {renderLeftIcon()}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor="#999"
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          {...props}
        />
        {renderRightIcon()}
      </View>

      {(error || helper) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}