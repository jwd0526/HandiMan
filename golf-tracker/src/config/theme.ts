// src/config/theme.ts
import { Platform } from 'react-native';

export const colors = {
  // Primary colors
  primary: '#2f95dc',
  primaryLight: '#5fb4e8',
  primaryDark: '#1c7ab8',

  // Secondary colors
  secondary: '#32cd32',
  secondaryLight: '#66d966',
  secondaryDark: '#28a428',

  // Neutral colors
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#dddddd',

  // State colors
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',

  // Specific UI colors
  divider: '#eeeeee',
  placeholder: '#999999',
  disabled: '#cccccc',
  overlay: 'rgba(0, 0, 0, 0.5)'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  families: {
    regular: Platform.select({ ios: 'System', android: 'Roboto' }),
    medium: Platform.select({ ios: 'System', android: 'Roboto' }),
    bold: Platform.select({ ios: 'System', android: 'Roboto' }),
  }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0
    },
    android: {
      elevation: 1
    }
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22
    },
    android: {
      elevation: 3
    }
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84
    },
    android: {
      elevation: 5
    }
  })
};

// Common style mixins
export const mixins = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const
  },
  shadow: shadows.md,
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.md
  }
};