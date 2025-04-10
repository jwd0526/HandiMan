// src/hooks/useGoals.ts
import { useState, useCallback, useEffect } from 'react';
import type { Goal, CreateGoalInput, Round } from 'shared';
import { goalService } from '../services/api/goals';
import { useRounds } from './useRounds';
import { calculateHandicap } from '../utils/handicap';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rounds, getUserRounds } = useRounds();

  // Fetch all goals for the user
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching goals from hook...');
      const fetchedGoals = await goalService.getUserGoals();
      console.log('Successfully fetched goals:', fetchedGoals);
      setGoals(fetchedGoals);
      return fetchedGoals;
    } catch (err) {
      console.error('Error in fetchGoals hook:', err);
      setError('Failed to load goals. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new goal
  const addGoal = useCallback(async (goalData: CreateGoalInput) => {
    setError(null);
    
    // Get initial current value for the goal based on category
    let initialCurrentValue = 0;
    
    // Pre-calculate the current value based on the goal category
    if (rounds.length > 0) {
      const currentHandicap = calculateHandicap(rounds);
      const bestScore = rounds.reduce((best, round) => 
        (round.score && round.score < best) ? round.score : best, 
        999
      );
      const recentRounds = rounds.slice(0, Math.min(5, rounds.length));
      const avgFairways = recentRounds.reduce((sum, round) => sum + (round.fairways || 0), 0) / recentRounds.length;
      const avgGreens = recentRounds.reduce((sum, round) => sum + (round.greens || 0), 0) / recentRounds.length;
      const avgPutts = recentRounds.reduce((sum, round) => sum + (round.putts || 0), 0) / recentRounds.length;
      
      switch (goalData.category) {
        case 'handicap':
          initialCurrentValue = currentHandicap;
          break;
        case 'scoring':
          initialCurrentValue = bestScore !== 999 ? bestScore : 0;
          break;
        case 'fairways':
          initialCurrentValue = Math.round(avgFairways);
          break;
        case 'greens':
          initialCurrentValue = Math.round(avgGreens);
          break;
        case 'putts':
          initialCurrentValue = Math.round(avgPutts);
          break;
      }
    }
    
    // Create temporary optimistic goal with temporary ID
    const tempGoal: Goal = {
      _id: `temp_${Date.now()}`,
      userId: 'current',
      ...goalData,
      achieved: false,
      currentValue: initialCurrentValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to UI immediately at the beginning of the list (active goals first)
    setGoals(prev => [tempGoal, ...prev]);
    
    try {
      // Make API call in background
      const newGoal = await goalService.createGoal({
        ...goalData,
        currentValue: initialCurrentValue
      });
      
      // Update with real goal data
      setGoals(prev => prev.map(goal => 
        goal._id === tempGoal._id ? newGoal : goal
      ));
      
      return newGoal;
    } catch (err) {
      // Remove temporary goal on error
      setGoals(prev => prev.filter(goal => goal._id !== tempGoal._id));
      console.error('Error in addGoal:', err);
      setError('Failed to create goal. Please try again.');
      throw err;
    }
  }, [rounds]);

  // Update an existing goal
  const updateGoal = useCallback(async (goalId: string, goalData: Partial<Goal>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedGoal = await goalService.updateGoal(goalId, goalData);
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? updatedGoal : goal
      ));
      return updatedGoal;
    } catch (err) {
      console.error('Error in updateGoal:', err);
      setError('Failed to update goal. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove a goal
  const removeGoal = useCallback(async (goalId: string) => {
    setLoading(true);
    setError(null);
    try {
      await goalService.deleteGoal(goalId);
      setGoals(prev => prev.filter(goal => goal._id !== goalId));
    } catch (err) {
      console.error('Error in removeGoal:', err);
      setError('Failed to delete goal. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle goal achievement status
  const toggleAchievement = useCallback(async (goalId: string, achieved: boolean) => {
    try {
      const now = new Date();
      
      // Optimistically update UI first with completed date
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? {
          ...goal, 
          achieved,
          // Add completedAt date when marking as achieved, remove when marking as not achieved
          completedAt: achieved ? now.toISOString() : undefined
        } : goal
      ));
      
      // Then make API call without blocking UI
      const updatedGoal = await goalService.toggleGoalAchievement(goalId, achieved, 
        achieved ? now.toISOString() : undefined);
      
      // Update with server response once complete
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? updatedGoal : goal
      ));
      
      return updatedGoal;
    } catch (err) {
      console.error('Error in toggleAchievement:', err);
      // Revert to original state on error
      setGoals(prev => [...prev]);
      setError('Failed to update goal status. Please try again.');
      throw err;
    }
  }, []);

  // Check if goals are achieved based on rounds data
  // Simplified version that doesn't trigger update loops
  const checkGoalAchievements = useCallback(() => {
    if (goals.length === 0 || rounds.length === 0) return;
    
    // Get current handicap
    const currentHandicap = calculateHandicap(rounds);
    
    // Calculate averages
    const recentRounds = rounds.slice(0, Math.min(5, rounds.length));
    const avgFairways = recentRounds.reduce((sum, round) => sum + (round.fairways || 0), 0) / recentRounds.length;
    const avgGreens = recentRounds.reduce((sum, round) => sum + (round.greens || 0), 0) / recentRounds.length;
    const avgPutts = recentRounds.reduce((sum, round) => sum + (round.putts || 0), 0) / recentRounds.length;
    
    // Find best score
    const bestScore = rounds.reduce((best, round) => 
      (round.score && round.score < best) ? round.score : best, 
      999
    );
    
    console.log('Checking goals with best score:', bestScore);
    
    // Update goals locally with current values without triggering API calls
    const updatedGoals = goals.map(goal => {
      let currentValue = goal.currentValue || 0;
      
      switch (goal.category) {
        case 'handicap':
          currentValue = currentHandicap;
          break;
        case 'scoring':
          currentValue = bestScore !== 999 ? bestScore : (goal.currentValue || 0);
          break;
        case 'fairways':
          currentValue = Math.round(avgFairways);
          break;
        case 'greens':
          currentValue = Math.round(avgGreens);
          break;
        case 'putts':
          currentValue = Math.round(avgPutts);
          break;
      }
      
      return {
        ...goal,
        currentValue
      };
    });
    
    // Only update state if values have changed
    const hasChanges = updatedGoals.some((goal, index) => 
      goal.currentValue !== goals[index].currentValue
    );
    
    if (hasChanges) {
      setGoals(updatedGoals);
    }
  }, [goals, rounds]);
  
  // State to track newly achieved goals
  const [newlyAchievedGoals, setNewlyAchievedGoals] = useState<Goal[]>([]);
  
  // Check goals whenever rounds data changes
  // Check goals on initial load only, not on every achievement update
  useEffect(() => {
    let isMounted = true;
    if (rounds.length > 0 && goals.length > 0 && isMounted) {
      // Use a timeout to prevent update loops
      const timer = setTimeout(() => {
        if (isMounted) {
          // Find goals that were achieved with the latest round
          const achievedGoals = checkAndFindAchievedGoals();
          if (achievedGoals.length > 0) {
            setNewlyAchievedGoals(achievedGoals);
          }
        }
      }, 500);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [rounds.length]); // Explicit dependency on rounds.length only
  
  // Check and find goals that were just achieved with the latest round
  const checkAndFindAchievedGoals = useCallback(() => {
    if (goals.length === 0 || rounds.length === 0) return [];
    
    // Get current values
    const currentHandicap = calculateHandicap(rounds);
    const recentRounds = rounds.slice(0, Math.min(5, rounds.length));
    const avgFairways = recentRounds.reduce((sum, round) => sum + (round.fairways || 0), 0) / recentRounds.length;
    const avgGreens = recentRounds.reduce((sum, round) => sum + (round.greens || 0), 0) / recentRounds.length;
    const avgPutts = recentRounds.reduce((sum, round) => sum + (round.putts || 0), 0) / recentRounds.length;
    const bestScore = rounds.reduce((best, round) => 
      (round.score && round.score < best) ? round.score : best, 
      999
    );
    
    // Update goals locally and check if any were achieved
    const updatedGoals: Goal[] = [];
    const achievedGoals: Goal[] = [];
    
    goals.forEach(goal => {
      if (goal.achieved) return; // Skip already achieved goals
      
      let currentValue = goal.currentValue || 0;
      let achieved = false;
      
      switch (goal.category) {
        case 'handicap':
          currentValue = currentHandicap;
          achieved = currentHandicap <= goal.targetValue;
          break;
        case 'scoring':
          currentValue = bestScore !== 999 ? bestScore : (goal.currentValue || 0);
          achieved = bestScore !== 999 && bestScore <= goal.targetValue;
          break;
        case 'fairways':
          currentValue = Math.round(avgFairways);
          achieved = avgFairways >= goal.targetValue;
          break;
        case 'greens':
          currentValue = Math.round(avgGreens);
          achieved = avgGreens >= goal.targetValue;
          break;
        case 'putts':
          currentValue = Math.round(avgPutts);
          achieved = avgPutts <= goal.targetValue;
          break;
      }
      
      const updatedGoal = {
        ...goal,
        currentValue,
        achieved: achieved || goal.achieved
      };
      
      if (achieved && !goal.achieved) {
        achievedGoals.push(updatedGoal);
        
        // Mark the goal as achieved in the database
        // Don't wait for this to complete
        goalService.toggleGoalAchievement(goal._id, true)
          .catch(err => console.error('Error auto-marking goal as achieved:', err));
      }
      
      updatedGoals.push(updatedGoal);
    });
    
    // Update local state if changes were made
    if (updatedGoals.some((g, i) => g.currentValue !== goals[i].currentValue || g.achieved !== goals[i].achieved)) {
      setGoals(updatedGoals);
    }
    
    return achievedGoals;
  }, [goals, rounds]);
  
  // Fetch rounds when goals are loaded - only once
  useEffect(() => {
    if (goals.length > 0 && rounds.length === 0) {
      getUserRounds();
    }
  }, [goals.length, rounds.length, getUserRounds]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoal,
    removeGoal,
    toggleAchievement,
    checkGoalAchievements,
    newlyAchievedGoals,
    setNewlyAchievedGoals
  };
};