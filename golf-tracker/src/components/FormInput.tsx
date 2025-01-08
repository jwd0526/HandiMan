// src/components/FormInput.tsx
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyles?: {};
}

export function FormInput({ label, error, containerStyles, style, ...props }: FormInputProps) {
  return (
    <View style={styles.container && containerStyles}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
});