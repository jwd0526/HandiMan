// src/screens/auth/Landing/index.tsx
import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../config/navigation';
import { FormButton } from '../../../components/forms/FormButton';
import { styles } from './styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

function FeaturePoint({ text }: { text: string }) {
  return (
    <View style={styles.featurePoint}>
      <Text style={styles.featureIcon}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export function LandingScreen({ navigation }: Props) {
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