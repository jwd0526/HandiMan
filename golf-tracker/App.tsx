// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import LandingScreen from './src/screens/auth/LandingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddRoundScreen from './src/screens/AddRoundScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Separate the navigation components
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      id={null}
      initialRouteName="Landing"
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
}

function MainNavigator() {
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
    </MainStack.Navigator>
  );
}

// Create a separate Navigation component
function Navigation() {
  const { user } = useAuth();
  
  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Main App component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}