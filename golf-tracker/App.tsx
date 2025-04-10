// App.tsx
import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import { LandingScreen } from './src/screens/auth/Landing';
import { LoginScreen } from './src/screens/auth/Login';
import { SignupScreen } from './src/screens/auth/Signup';
import { HomeScreen } from './src/screens/Home';
import { AddRoundScreen } from './src/screens/rounds/AddRound';
import { AllRoundsScreen } from './src/screens/rounds/AllRounds';
import { AddCourseScreen } from './src/screens/course/AddCourse';
import { StatisticsScreen } from './src/screens/Statistics';
import { GoalsScreen } from './src/screens/Goals';

// Types
import { AuthStackParamList, MainStackParamList } from './src/config/navigation';

// Context Providers
import { AuthProvider, useAuthContext } from './src/components/providers/AuthProvider';
import { CoursesProvider } from './src/components/providers/CourseProvider';
import { GoalsProvider } from './src/components/providers/GoalsProvider';


const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = React.memo(() => {
  return (
    <AuthStack.Navigator
      id={null}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' }
      }}
    >
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
});

const MainNavigator = React.memo(() => {
  return (
    <MainStack.Navigator
      id={null}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' }
      }}
    >
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="AddRound" component={AddRoundScreen} />
      <MainStack.Screen name="AllRounds" component={AllRoundsScreen} />
      <MainStack.Screen name="AddCourse" component={AddCourseScreen} />
      <MainStack.Screen name="Statistics" component={StatisticsScreen} />
      <MainStack.Screen name="Goals" component={GoalsScreen} />
    </MainStack.Navigator>
  );
});

const Navigation = React.memo(() => {
  const { user, loading } = useAuthContext();

  const navigator = useMemo(() => {
    if (loading) return null;
    return user ? <MainNavigator /> : <AuthNavigator />;
  }, [user, loading]);
  
  return (
    <NavigationContainer>
      {navigator}
    </NavigationContainer>
  );
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CoursesProvider>
          <GoalsProvider>
            <StatusBar style="auto" />
            <Navigation />
          </GoalsProvider>
        </CoursesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}