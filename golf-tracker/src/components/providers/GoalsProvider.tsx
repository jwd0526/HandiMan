// src/components/providers/GoalsProvider.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Goal } from 'shared';
import { useGoals } from '../../hooks/useGoals';

interface GoalsContextType {
  activeGoals: Goal[];
  completedGoals: Goal[];
  newlyAchievedGoals: Goal[];
  setNewlyAchievedGoals: (goals: Goal[]) => void;
  checkAndFindAchievedGoals: () => Goal[];
}

export const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  // This acts as a wrapper around useGoals to make goal checking available globally
  // But prevents circular dependencies
  const {
    activeGoals,
    completedGoals,
    newlyAchievedGoals,
    setNewlyAchievedGoals,
    checkAndFindAchievedGoals,
  } = useGoals();

  // Make the goals checking and achievement available via context
  const value = {
    activeGoals,
    completedGoals,
    newlyAchievedGoals,
    setNewlyAchievedGoals,
    checkAndFindAchievedGoals,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}