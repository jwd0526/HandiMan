// src/screens/Home/index.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useRounds } from '../../hooks/useRounds';
import { Round } from 'shared';
import { LogOut, Target, Trophy, CirclePlus, PieChart, Info } from 'lucide-react-native';
import { styles } from './styles';
import { calculateHandicap } from '../../utils/handicap';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

function HandicapCard({ handicap, rounds, onViewDetails }: { 
  handicap: number; 
  rounds: Round[]; 
  onViewDetails: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Current Handicap</Text>
      <View style={styles.handicapContainer}>
        <Text style={styles.handicapText}>{handicap.toFixed(1)}</Text>
      </View>
      <Text style={styles.handicapSubtext}>
        Based on {Math.min(rounds.length, 20)} rounds
      </Text>
      <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
        <Info size={16} color="#2f95dc" style={{marginRight: 6}} />
        <Text style={styles.actionButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickActions({ onAddRound, onViewStats, onViewGoals }: { 
  onAddRound: () => void;
  onViewStats: () => void;
  onViewGoals: () => void;
}) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickActionButton} onPress={onAddRound}>
        <CirclePlus size={24} color="#2f95dc" />
        <Text style={styles.quickActionText}>New Round</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={onViewStats}
      >
        <PieChart size={24} color="#2f95dc" />
        <Text style={styles.quickActionText}>Statistics</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton} onPress={onViewGoals}>
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
  const [showHandicapDetails, setShowHandicapDetails] = useState(false);

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

  // Calculate handicap from rounds
  const handicap = calculateHandicap(rounds);

  // Calculate which differentials are used for handicap
  const getHandicapDifferentials = useCallback(() => {
    if (rounds.length < 3) return { usedDifferentials: [], allDifferentials: [] };
    
    // Get the last 20 rounds and their differentials
    const recentRounds = [...rounds]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
    
    // Sort differentials for calculation
    const sortedDifferentials = [...recentRounds]
      .sort((a, b) => a.differential - b.differential);
    
    // Determine how many differentials are used based on total rounds
    let usedCount = 0;
    if (sortedDifferentials.length <= 4) {
      usedCount = 1;
    } else if (sortedDifferentials.length <= 6) {
      usedCount = 2;
    } else if (sortedDifferentials.length <= 8) {
      usedCount = 2;
    } else if (sortedDifferentials.length <= 11) {
      usedCount = 3;
    } else if (sortedDifferentials.length <= 14) {
      usedCount = 4;
    } else if (sortedDifferentials.length <= 16) {
      usedCount = 5;
    } else if (sortedDifferentials.length <= 18) {
      usedCount = 6;
    } else if (sortedDifferentials.length === 19) {
      usedCount = 7;
    } else if (sortedDifferentials.length === 20) {
      usedCount = 8;
    }
    
    // Get the differentials used in calculation
    const usedDifferentials = sortedDifferentials.slice(0, usedCount);
    
    return {
      usedDifferentials,
      allDifferentials: recentRounds
    };
  }, [rounds]);

  const renderHandicapDetailsModal = () => (
    <Modal
      visible={showHandicapDetails}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowHandicapDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Handicap Details</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowHandicapDetails(false)}
            >
              <Text style={{ color: '#2f95dc', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={styles.handicapExplanation}>
              <Text style={styles.explanationText}>
                Your handicap index is {handicap.toFixed(1)}, calculated using the 
                lowest {getHandicapDifferentials().usedDifferentials.length} differentials 
                from your last {Math.min(rounds.length, 20)} rounds.
              </Text>
              <Text style={styles.explanationText}>
                A differential is calculated as: (Score - Course Rating) × 113 ÷ Slope Rating
              </Text>
              <Text style={styles.explanationText}>
                The highlighted differentials below are used in your handicap calculation.
              </Text>
            </View>
            
            <View style={styles.differentialsList}>
              {getHandicapDifferentials().allDifferentials.map((round, index) => {
                const isUsed = getHandicapDifferentials().usedDifferentials.some(r => r._id === round._id);
                return (
                  <View key={round._id} style={styles.differentialItem}>
                    <Text style={[
                      styles.courseText,
                      isUsed ? styles.usedDifferential : styles.unusedDifferential
                    ]}>
                      {typeof round.course === 'object' ? round.course.name : 'Unknown Course'}
                    </Text>
                    <Text style={[
                      styles.differentialText,
                      isUsed ? styles.usedDifferential : styles.unusedDifferential
                    ]}>
                      {round.differential.toFixed(1)}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(round.date).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      {renderHandicapDetailsModal()}
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
        <HandicapCard 
          handicap={handicap} 
          rounds={rounds} 
          onViewDetails={() => setShowHandicapDetails(true)} 
        />

        {/* Quick Actions */}
        <QuickActions 
          onAddRound={() => navigation.navigate('AddRound')} 
          onViewStats={() => navigation.navigate('Statistics')}
          onViewGoals={() => navigation.navigate('Goals')}
        />

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