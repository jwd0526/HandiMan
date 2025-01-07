// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserRounds } from '../services/rounds';
import { Round } from 'shared';
import { MainStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        if (user) {
          const userRounds = await fetchUserRounds(user._id);
          setRounds(userRounds);
        }
      } catch (error) {
        console.error('Error fetching rounds:', error);
        Alert.alert('Error', 'Failed to fetch rounds. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert(
        'Error',
        'There was a problem logging out. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      </SafeAreaView>
    );
  }

  const handicapIndex = 14.2; // This would come from actual user data
  const recentScores = rounds.slice(0, 5).map((round) => round.score);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back, </Text>
            <Text style={styles.nameText}>{user.name || 'Golfer'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Handicap Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Handicap</Text>
          <Text style={styles.handicapText}>{handicapIndex}</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('AddRound')}>
            <Text style={styles.quickActionEmoji}>🏌️</Text>
            <Text style={styles.quickActionText}>New Round</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionEmoji}>📊</Text>
            <Text style={styles.quickActionText}>Statistics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionEmoji}>🎯</Text>
            <Text style={styles.quickActionText}>Goals</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scores */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Scores</Text>
          {rounds.length === 0 ? (
            <Text style={styles.noRoundsText}>
              Add rounds to begin tracking your stats!
            </Text>
          ) : (
            <View style={styles.recentScores}>
              {recentScores.map((score, index) => (
                <View key={index} style={styles.scoreItem}>
                  <Text style={styles.scoreText}>{score}</Text>
                  <Text style={styles.scoreDate}>
                    {new Date(rounds[index].date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.actionButton,
              rounds.length === 0 && styles.disabledButton,
            ]}
            disabled={rounds.length === 0}
          >
            <Text style={styles.actionButtonText}>View All Rounds</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Tip</Text>
          <Text style={styles.tipText}>
            "Focus on your tempo during practice swings. A consistent tempo leads to more consistent shots."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    color: '#666',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#2f95dc',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  handicapText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2f95dc',
    textAlign: 'center',
    marginVertical: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  recentScores: {
    marginBottom: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scoreDate: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#2f95dc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  noRoundsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});