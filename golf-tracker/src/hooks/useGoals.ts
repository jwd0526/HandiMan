// src/hooks/useGoals.ts
import { useState, useCallback, useEffect } from 'react';
import type { Goal, CreateGoalInput, Round } from 'shared';
import { goalService } from '../services/api/goals';
import { useRounds } from './useRounds';
import { calculateHandicap } from '../utils/handicap';
import { useAuthContext } from '../components/providers/AuthProvider';

export const useGoals = () => {
  const { goals: authGoals, activeGoals, completedGoals, user } = useAuthContext();
  const [goals, setGoals] = useState<Goal[]>(authGoals || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rounds, getUserRounds } = useRounds();

  // Use goals from auth context when they change
  useEffect(() => {
    if (authGoals?.length) {
      console.log('Updating goals from auth context:', authGoals);
      setGoals(authGoals);
    }
  }, [authGoals]);

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
    
    // Get best values for initial current value based on category
    let initialCurrentValue = 0;
    
    // Pre-calculate the current value based on the goal category using BEST values not averages
    if (rounds.length > 0) {
      const currentHandicap = calculateHandicap(rounds);
      const bestScore = rounds.reduce((best, round) => 
        (round.score && round.score < best) ? round.score : best, 999
      );
      
      // For fairways and greens - highest values are best
      const bestFairways = rounds.reduce((best, round) => Math.max(best, round.fairways || 0), 0);
      const bestGreens = rounds.reduce((best, round) => Math.max(best, round.greens || 0), 0);
      
      // For putts - lowest value is best (not average)
      const puttsValues = rounds
        .filter(round => round.putts && round.putts > 0)
        .map(round => round.putts);
      
      const bestPutts = puttsValues.length > 0 ? Math.min(...puttsValues) : 0;
      
      // Log putts values for debugging
      if (goalData.category === 'putts' && puttsValues.length > 0) {
        console.log(`[addGoal] All putts values: ${puttsValues.join(', ')}`);
        console.log(`[addGoal] Best (lowest) putts value: ${bestPutts}`);
      }
      
      switch (goalData.category) {
        case 'handicap':
          initialCurrentValue = currentHandicap;
          break;
        case 'scoring':
          initialCurrentValue = bestScore !== 999 ? bestScore : 0;
          break;
        case 'fairways':
          initialCurrentValue = bestFairways;
          break;
        case 'greens':
          initialCurrentValue = bestGreens;
          break;
        case 'putts':
          initialCurrentValue = bestPutts || 0;
          break;
      }
    }
    
    // Create temporary optimistic goal with temporary ID
    const tempGoal: Goal = {
      _id: `temp_${Date.now()}`,
      addedBy: user?._id || 'current',
      ...goalData,
      achieved: false,
      currentValue: initialCurrentValue,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if goal is already achieved
    let shouldBeAchieved = false;
    if (initialCurrentValue > 0) {
      switch (goalData.category) {
        case 'handicap':
        case 'scoring':
        case 'putts':
          // Lower is better
          shouldBeAchieved = initialCurrentValue <= goalData.targetValue;
          break;
        case 'fairways':
        case 'greens':
          // Higher is better
          shouldBeAchieved = initialCurrentValue >= goalData.targetValue;
          break;
      }
    }
    
    // Update achieved status if needed
    if (shouldBeAchieved) {
      tempGoal.achieved = true;
      tempGoal.completedAt = new Date();
    }
    
    // Add to UI immediately at the beginning of the list (active goals first)
    setGoals(prev => [tempGoal, ...prev]);
    
    try {
      // Make API call in background with the correct current value
      const newGoal = await goalService.createGoal({
        ...goalData,
        currentValue: initialCurrentValue,
        achieved: shouldBeAchieved,
        completedAt: shouldBeAchieved ? new Date() : undefined
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
  }, [rounds, user]);

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
      
      // Find the goal to ensure we have the latest stats
      const targetGoal = goals.find(g => g._id === goalId);
      if (!targetGoal) {
        throw new Error('Goal not found');
      }
      
      // When marking as achieved, ensure we have the latest currentValue from stats
      if (rounds.length > 0) {
        // Calculate best values for each stat type - use same logic as checkAndFindAchievedGoals
        // For handicap
        const currentHandicap = calculateHandicap(rounds);
        
        // For scoring - lowest score is best
        const bestScore = rounds.reduce((best, round) => 
          (round.score && round.score < best) ? round.score : best, 999
        );
        
        // For fairways and greens - highest values are best
        const bestFairways = rounds.reduce((best, round) => Math.max(best, round.fairways || 0), 0);
        const bestGreens = rounds.reduce((best, round) => Math.max(best, round.greens || 0), 0);
        
        // For putts - lowest value is best
        const puttsValues = rounds
          .filter(round => round.putts && round.putts > 0)
          .map(round => round.putts);
        
        const bestPutts = puttsValues.length > 0 ? Math.min(...puttsValues) : 99;
        
        if (puttsValues.length > 0) {
          console.log(`[toggleAchievement] All putts values: ${puttsValues.join(', ')}`);
          console.log(`[toggleAchievement] Best (lowest) putts value: ${bestPutts}`);
        }
        
        // Update the current value based on category
        let currentValue = targetGoal.currentValue || 0;
        let automaticAchievement = false;

        switch (targetGoal.category) {
          case 'handicap':
            currentValue = currentHandicap;
            automaticAchievement = currentHandicap <= targetGoal.targetValue;
            break;
            
          case 'scoring':
            currentValue = bestScore !== 999 ? bestScore : (targetGoal.currentValue || 0);
            automaticAchievement = bestScore !== 999 && bestScore <= targetGoal.targetValue;
            break;
            
          case 'fairways':
            currentValue = bestFairways;
            automaticAchievement = bestFairways >= targetGoal.targetValue;
            break;
            
          case 'greens':
            currentValue = bestGreens;
            automaticAchievement = bestGreens >= targetGoal.targetValue;
            break;
            
          case 'putts':
            if (puttsValues.length > 0) {
              currentValue = bestPutts;
              automaticAchievement = bestPutts <= targetGoal.targetValue;
              console.log(`Toggling goal ${goalId} achievement to ${automaticAchievement} with currentValue: ${currentValue}`);
            }
            break;
        }
        
        // If manually marking as achieved or if stats indicate automatic achievement
        const shouldBeAchieved = achieved || automaticAchievement;
        
        // Optimistically update UI first with completed date and current value
        setGoals(prev => prev.map(goal => 
          goal._id === goalId ? {
            ...goal, 
            achieved: shouldBeAchieved,
            currentValue, // Use the latest value
            completedAt: shouldBeAchieved ? now : undefined
          } : goal
        ));
        
        // Then make API call with the current value
        const updatedGoal = await goalService.toggleGoalAchievement(
          goalId, 
          shouldBeAchieved, 
          shouldBeAchieved ? now.toISOString() : undefined,
          currentValue 
        );
        
        // Update with server response once complete
        setGoals(prev => prev.map(goal => 
          goal._id === goalId ? updatedGoal : goal
        ));
        
        return updatedGoal;
      } else {
        // For unmarking as achieved, just toggle the flag
        // Optimistically update UI first
        setGoals(prev => prev.map(goal => 
          goal._id === goalId ? {
            ...goal, 
            achieved,
            // Remove completedAt date when marking as not achieved
            completedAt: achieved ? now : undefined
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
      }
    } catch (err) {
      console.error('Error in toggleAchievement:', err);
      // Revert to original state on error
      setGoals(prev => [...prev]);
      setError('Failed to update goal status. Please try again.');
      throw err;
    }
  }, [goals, rounds]);

  // Check if goals are achieved based on rounds data
  // Simplified version that doesn't trigger update loops
  const checkGoalAchievements = useCallback(() => {
    if (goals.length === 0 || rounds.length === 0) return;
    
    // Get current handicap
    const currentHandicap = calculateHandicap(rounds);
    
    // Calculate stats using raw values
    const recentRounds = rounds.slice(0, Math.min(5, rounds.length));
    // Raw values (not percentages)
    const avgFairways = recentRounds.reduce((sum, round) => sum + (round.fairways || 0), 0) / recentRounds.length;
    const avgGreens = recentRounds.reduce((sum, round) => sum + (round.greens || 0), 0) / recentRounds.length;
    const avgPutts = recentRounds.reduce((sum, round) => sum + (round.putts || 0), 0) / recentRounds.length;
    
    // Track highest (best) fairways and greens
    const bestFairways = rounds.reduce((best, round) => Math.max(best, round.fairways || 0), 0);
    const bestGreens = rounds.reduce((best, round) => Math.max(best, round.greens || 0), 0);
    
    // Calculate best putts (lowest number)
    const bestPutts = rounds.reduce((best, round) => 
      (round.putts && (best === 0 || round.putts < best)) ? round.putts : best, 
      0
    );
    
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
          // For fairways, use the best (highest) value
          currentValue = bestFairways > 0 ? bestFairways : (goal.currentValue || 0);
          break;
        case 'greens':
          // For greens, use the best (highest) value
          currentValue = bestGreens > 0 ? bestGreens : (goal.currentValue || 0);
          break;
        case 'putts':
          // For putts we want the best (lowest) value, not the average
          currentValue = bestPutts > 0 ? bestPutts : (goal.currentValue || 0);
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
    
    // Calculate best values for each stat type
    // For handicap
    const currentHandicap = calculateHandicap(rounds);
    
    // For scoring - lowest score is best
    const bestScore = rounds.reduce((best, round) => 
      (round.score && round.score < best) ? round.score : best, 999
    );
    
    // For fairways and greens - highest values are best
    const bestFairways = rounds.reduce((best, round) => Math.max(best, round.fairways || 0), 0);
    const bestGreens = rounds.reduce((best, round) => Math.max(best, round.greens || 0), 0);
    
    // For putts - lowest value is best
    const puttsValues = rounds
      .filter(round => round.putts && round.putts > 0)
      .map(round => round.putts);
    
    const bestPutts = puttsValues.length > 0 ? Math.min(...puttsValues) : 99;
    
    if (puttsValues.length > 0) {
      console.log(`All putts values: ${puttsValues.join(', ')}`);
      console.log(`Best (lowest) putts value: ${bestPutts}`);
    }
    
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
          currentValue = bestFairways;
          achieved = bestFairways >= goal.targetValue;
          break;
          
        case 'greens':
          currentValue = bestGreens;
          achieved = bestGreens >= goal.targetValue;
          break;
          
        case 'putts':
          // For putts, use the best (lowest) value
          if (puttsValues.length > 0) {
            currentValue = bestPutts;
            achieved = bestPutts <= goal.targetValue;
          }
          console.log(`Putts goal: target=${goal.targetValue}, best=${bestPutts}, current=${currentValue}, achieved=${achieved}`);
          break;
      }
      
      const updatedGoal = {
        ...goal,
        currentValue,
        achieved: achieved || goal.achieved
      };
      
      if (achieved && !goal.achieved) {
        achievedGoals.push(updatedGoal);
        
        // Mark the goal as achieved in the database with the current value
        goalService.toggleGoalAchievement(goal._id, true, undefined, currentValue)
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
    checkAndFindAchievedGoals,  // Export this function to be used by the context
    newlyAchievedGoals,
    setNewlyAchievedGoals,
    // Add easy access to filtered goals
    activeGoals: activeGoals || goals.filter(goal => !goal.achieved),
    completedGoals: completedGoals || goals.filter(goal => goal.achieved)
  };
};