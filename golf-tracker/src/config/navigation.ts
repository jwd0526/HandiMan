// src/config/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
};

// Main Stack
export type MainStackParamList = {
  Home: undefined;
  AddRound: undefined;
  AllRounds: undefined;
  CourseDetails: { courseId: string };
  AddCourse: undefined;
  Profile: undefined;
  Settings: undefined;
  Statistics: undefined;
  Goals: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Type helpers for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}