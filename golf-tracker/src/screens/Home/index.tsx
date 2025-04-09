// src/screens/Home/index.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useRounds } from '../../hooks/useRounds';
import { Round } from 'shared';
import { LogOut, Target, Trophy } from 'lucide-react-native';
import { styles } from './styles';
import { calculateHandicap } from '../../utils/handicap';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

function HandicapCard({ handicap }: { handicap: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Current Handicap</Text>
      <Text style={styles.handicapText}>{handicap.toFixed(1)}</Text>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickActions({ onAddRound }: { onAddRound: () => void }) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickActionButton} onPress={onAddRound}>
        {/* <Golf size={24} color="#2f95dc" /> */}
        <Text style={styles.quickActionText}>New Round</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton}>
        <Target size={24} color="#2f95dc" />
        <Text style={styles.quickActionText}>Statistics</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton}>
        <Trophy size={24} color="#2f95dc" />
        <Text style={styles.quickActionText}>Goals</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecentRounds({ 
  rounds,
  onViewAll
}: { 
  rounds: Round[],
  onViewAll: () => void
}) {
  const recentScores = rounds.slice(0, 5);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recent Scores</Text>
      {rounds.length === 0 ? (
        <Text style={styles.noRoundsText}>
          Add rounds to begin tracking your stats!
        </Text>
      ) : (
        <View style={styles.recentScores}>
          {recentScores.map((round, index) => (
            <View key={round._id} style={styles.scoreItem}>
              <Text style={styles.scoreText}>{round.score}</Text>
              <Text style={styles.scoreDate}>
                {new Date(round.date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.actionButton, rounds.length === 0 && styles.disabledButton]}
        disabled={rounds.length === 0}
        onPress={onViewAll}
      >
        <Text style={styles.actionButtonText}>View All Rounds</Text>
      </TouchableOpacity>
    </View>
  );
}

function TipCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Today's Tip</Text>
      <Text style={styles.tipText}>
        "Focus on your tempo during practice swings. A consistent tempo leads to more consistent shots."
      </Text>
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { rounds, loading, error, getUserRounds } = useRounds();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserRounds();
      }
    }, [user, getUserRounds])
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => getUserRounds()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate handicap from rounds
  const handicap = calculateHandicap(rounds);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back, </Text>
            <Text style={styles.nameText}>{user?.name?.split(' ')[0] || 'Golfer'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <LogOut size={20} color="#2f95dc" />
          </TouchableOpacity>
        </View>

        {/* Handicap Card */}
        <HandicapCard handicap={handicap} />

        {/* Quick Actions */}
        <QuickActions onAddRound={() => navigation.navigate('AddRound')} />

        {/* Recent Rounds */}
        <RecentRounds
          rounds={rounds}
          onViewAll={() => navigation.navigate('AllRounds')}
        />

        {/* Tip Card */}
        <TipCard />
      </ScrollView>
    </SafeAreaView>
  );
}