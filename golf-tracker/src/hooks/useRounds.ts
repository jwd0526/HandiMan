// src/hooks/useRounds.ts
import { useState, useCallback } from 'react';
import { Round, CreateRoundInput } from 'shared';
import { roundService } from '../services/api/rounds';
import { useAuth } from './useAuth';

interface UseRounds {
  rounds: Round[];
  loading: boolean;
  error: string | null;
  getUserRounds: () => Promise<void>;
  createRound: (roundData: Omit<CreateRoundInput, 'addedBy'>) => Promise<Round>;
  deleteRound: (roundId: string) => Promise<void>;
}

export function useRounds(): UseRounds {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserRounds = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);
      
      const userRounds = await roundService.getUserRounds(user._id, {
        sortBy: 'date',
        sortOrder: 'desc'
      });
      setRounds(userRounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch rounds');
      setRounds([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  const createRound = useCallback(async (roundData: Omit<CreateRoundInput, 'addedBy'>) => {
    if (!user?._id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      
      const newRound = await roundService.createRound({
        ...roundData,
        addedBy: user._id
      });

      setRounds(prev => [newRound, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      return newRound;
    } catch (error) {
      console.error('Error creating round:', error);
      setError(error instanceof Error ? error.message : 'Failed to create round');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  const deleteRound = useCallback(async (roundId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await roundService.deleteRound(roundId);
      setRounds(prev => prev.filter(round => round._id !== roundId));
    } catch (error) {
      console.error('Error deleting round:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete round');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rounds,
    loading,
    error,
    getUserRounds,
    createRound,
    deleteRound
  };
}