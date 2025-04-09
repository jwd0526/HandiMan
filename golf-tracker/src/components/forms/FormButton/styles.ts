// src/components/forms/FormButton/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Size variations
  buttonSmall: {
    height: 36,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    height: 48,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    height: 56,
    paddingHorizontal: 32,
  },

  // Variant styles
  buttonPrimary: {
    backgroundColor: '#2f95dc',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2f95dc',
  },
  buttonDanger: {
    backgroundColor: '#ff3b30',
  },

  // Text base style
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Text size variations
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },

  // Text variant styles
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#333',
  },
  textOutline: {
    color: '#2f95dc',
  },
  textDanger: {
    color: '#fff',
  },
  textDisabled: {
    color: '#999',
  },

  // Icon styles
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});