// src/screens/rounds/AllRounds/index.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../config/navigation';
import { Round } from 'shared';
import { useRounds } from '../../../hooks/useRounds';
import { ChevronDown, Calendar, Flag, Target } from 'lucide-react-native';
import { styles } from './styles';
import { BackButton } from '../../../components/common/BackButton';

type Props = NativeStackScreenProps<MainStackParamList, 'AllRounds'>;

type SortOption = 'date' | 'score' | 'differential';
type SortDirection = 'asc' | 'desc';

interface RoundCardProps {
  round: Round;
  onPress?: () => void;
}

function RoundCard({ round, onPress }: RoundCardProps) {
  return (
    <TouchableOpacity style={styles.roundCard} onPress={onPress}>
      <View style={styles.roundHeader}>
        <View>
          <Text style={styles.courseName}>
            {typeof round.course === 'object' ? round.course.name : 'Unknown Course'}
          </Text>
          <Text style={styles.roundDate}>
            {new Date(round.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.roundScore}>{round.score}</Text>
      </View>
      
      <View style={styles.roundStats}>
        <View style={styles.statItem}>
          <Target size={16} color="#666" />
          <Text style={styles.statText}>
            Differential: {round.differential.toFixed(1)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Flag size={16} color="#666" />
          <Text style={styles.statText}>
            {`FIR: ${round.fairways}`}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={16} color="#666" />
          <Text style={styles.statText}>
            {`Putts: ${round.putts}`}
          </Text>
        </View>
      </View>

      {round.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {round.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function AllRoundsScreen({ navigation }: Props) {
  const { rounds, loading, error, getUserRounds, deleteRound } = useRounds();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUserRounds();
    } finally {
      setRefreshing(false);
    }
  }, [getUserRounds]);

  const sortedRounds = [...rounds].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        break;
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'differential':
        comparison = a.differential - b.differential;
        break;
    }
    return sortDirection === 'desc' ? comparison : -comparison;
  });

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
    setShowSortOptions(false);
  };

  const handleDeleteRound = (roundId: string) => {
    Alert.alert(
      'Delete Round',
      'Are you sure you want to delete this round?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRound(roundId);
              Alert.alert('Success', 'Round deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete round');
            }
          }
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton /> 
      <View style={styles.header}>
        <Text style={styles.title}>Rounds History</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortButtonText}>
            Sort by {sortBy}
          </Text>
          <ChevronDown size={20} color="#2f95dc" />
        </TouchableOpacity>
      </View>

      {showSortOptions && (
        <View style={styles.sortOptions}>
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => toggleSort('date')}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === 'date' && styles.selectedSortOption
            ]}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => toggleSort('score')}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === 'score' && styles.selectedSortOption
            ]}>Score</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => toggleSort('differential')}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === 'differential' && styles.selectedSortOption
            ]}>Differential</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={sortedRounds}
        renderItem={({ item }) => (
          <RoundCard 
            round={item}
            onPress={() => handleDeleteRound(item._id)}
          />
        )}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No rounds recorded yet.
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddRound')}
            >
              <Text style={styles.addButtonText}>Add Your First Round</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}