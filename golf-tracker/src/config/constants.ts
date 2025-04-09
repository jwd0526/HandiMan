// src/config/constants.ts
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Animation durations
export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  }
};

// Form validation limits
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 500
};

// Storage keys
export const STORAGE = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SETTINGS: 'user_settings',
  RECENT_COURSES: 'recent_courses'
} as const;

// Limits and thresholds
export const LIMITS = {
  MAX_RECENT_COURSES: 5,
  MAX_ROUNDS_PER_PAGE: 20,
  MAX_SEARCH_RESULTS: 50,
  MIN_SEARCH_CHARS: 2
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM D, YYYY',
  API: 'YYYY-MM-DD',
  MONTH_YEAR: 'MMMM YYYY'
};

// Golf specific constants
export const GOLF = {
  MAX_HOLE_SCORE: 15,
  MIN_COURSE_RATING: 55,
  MAX_COURSE_RATING: 155,
  MAX_FAIRWAYS: 18,
  MAX_GREENS: 18,
  MAX_PUTTS_PER_HOLE: 6,
  HANDICAP_ROUNDS_REQUIRED: 3
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Please check your internet connection and try again.',
  SERVER: 'Something went wrong on our end. Please try again later.',
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_IN_USE: 'This email is already registered',
    WEAK_PASSWORD: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
  },
  VALIDATION: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_MISMATCH: 'Passwords do not match',
    INVALID_SCORE: 'Please enter a valid score'
  }
};

// App info
export const APP_INFO = {
  NAME: 'HandiMan',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your personal golf handicap tracker',
  SUPPORT_EMAIL: 'support@handiman.app',
  PRIVACY_POLICY_URL: 'https://handiman.app/privacy',
  TERMS_URL: 'https://handiman.app/terms'
};