// src/screens/auth/LandingScreen.tsx
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { FormButton } from '../../components/FormButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Section with Logo/Branding */}
        <View style={[styles.topSection, { height: height * 0.5 }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.emoji}>⛳️</Text>
            <Text style={styles.appName}>HandiMan</Text>
          </View>
          <Text style={styles.tagline}>Track your scores.</Text>
          <Text style={styles.taglineSecondary}>Improve your game.</Text>
        </View>

        {/* Bottom Section with Feature Points and Buttons */}
        <View style={styles.bottomSection}>
          <View style={styles.features}>
            <FeaturePoint text="Track your rounds and progress" />
            <FeaturePoint text="Calculate your handicap" />
            <FeaturePoint text="Connect with other golfers" />
          </View>

          <View style={styles.buttonContainer}>
            <FormButton
              title="Get Started"
              onPress={() => navigation.navigate('Signup')}
            />
            <FormButton
              title="I already have an account"
              onPress={() => navigation.navigate('Login')}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeaturePoint({ text }: { text: string }) {
  return (
    <View style={styles.featurePoint}>
      <Text style={styles.featureIcon}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  topSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2f95dc',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  taglineSecondary: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2f95dc',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  features: {
    gap: 16,
    marginBottom: 32,
  },
  featurePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    color: '#2f95dc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
  },
});