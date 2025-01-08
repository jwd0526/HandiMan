// src/services/rounds.ts
import { Round, CreateRoundInput } from 'shared';
import { getAuthToken } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchUserRounds(userId: string): Promise<Round[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/rounds?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rounds');
    }

    const data = await response.json();
    return data.data.map((round: Round) => ({
      ...round,
      date: new Date(round.date)
    }));
  } catch (error) {
    console.error('Error fetching rounds:', error);
    throw error;
  }
}

export async function createRound(roundData: CreateRoundInput): Promise<Round> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    console.log('Creating round with data:', roundData);

    // Ensure date is an ISO string
    const formattedRoundData = {
      ...roundData,
      date: roundData.date instanceof Date 
        ? roundData.date.toISOString() 
        : new Date(roundData.date).toISOString()
    };

    const response = await fetch(`${API_URL}/rounds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedRoundData)
    });

    const data = await response.json();
    console.log('Server response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create round');
    }

    if (!data.success || !data.data) {
      throw new Error('Invalid response format from server');
    }

    // Convert date to Date object
    return {
      ...data.data,
      date: new Date(data.data.date)
    };
  } catch (error) {
    console.error('Error in createRound:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error creating round');
    }
  }
}