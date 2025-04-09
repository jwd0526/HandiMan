// src/screens/auth/Landing/styles.ts
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
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