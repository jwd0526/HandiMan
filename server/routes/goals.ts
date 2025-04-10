// server/routes/goals.ts
import express, { Request } from 'express';
import mongoose from 'mongoose';
import type { Goal } from 'shared';

// Inline Goal model (since we don't have a separate file yet)
export interface IGoal {
  _id: mongoose.Types.ObjectId;
  name: string;
  targetValue: number;
  currentValue?: number;
  targetDate?: Date;
  category: 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom';
  achieved: boolean;
  description?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number
  },
  targetDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['handicap', 'scoring', 'fairways', 'greens', 'putts', 'custom'],
    required: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create the model directly in this file
// Use mongoose.models to check if the model is already defined
const GoalModel = mongoose.models.Goal || mongoose.model<IGoal>('Goal', goalSchema);

import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

const router = express.Router();

function mapGoalToResponse(goal: IGoal): Goal {
  return {
    _id: goal._id.toString(),
    name: goal.name,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    targetDate: goal.targetDate,
    category: goal.category,
    achieved: goal.achieved,
    completedAt: goal.completedAt ? goal.completedAt.toISOString() : undefined,
    description: goal.description,
    addedBy: goal.addedBy.toString(),
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt
  };
}

// Debug middleware for goals routes
router.use((req: Request & { user?: any }, res, next) => {
  console.log(`Goals route requested: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('User:', req.user || 'No user on request yet');
  next();
});

// Test route - no authentication required
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({
    success: true,
    message: 'Goals API is working',
    timestamp: new Date().toISOString()
  });
});

// Get all goals for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('GET /goals handler called');
    const userId = req.user?._id;
    if (!userId) {
      console.log('User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log(`Finding goals for user: ${userId}`);
    const goals = await GoalModel.find({ addedBy: userId }).sort({ createdAt: -1 });
    console.log(`Found ${goals.length} goals`);
    
    const mappedGoals = goals.map(goal => mapGoalToResponse(goal));

    console.log('Sending goals response');
    res.json({
      success: true,
      data: mappedGoals
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goals'
    });
  }
});

// Create a new goal
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const goal = new GoalModel({
      ...req.body,
      addedBy: userId,
      achieved: false
    });

    await goal.save();

    res.status(201).json({
      success: true,
      data: mapGoalToResponse(goal)
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating goal'
    });
  }
});

// Update a goal
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const goalId = req.params.id;
    const goal = await GoalModel.findOneAndUpdate(
      { _id: goalId, addedBy: userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      data: mapGoalToResponse(goal)
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating goal'
    });
  }
});

// Toggle goal achievement status
router.patch('/:id/achievement', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { achieved } = req.body;
    if (typeof achieved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'The achieved property must be a boolean'
      });
    }

    const goalId = req.params.id;
    
    // Update object based on whether goal is being achieved or unmarked
    const updateObj = achieved 
      ? { achieved, completedAt: req.body.completedAt || new Date() }
      : { achieved, $unset: { completedAt: "" } };
    
    const goal = await GoalModel.findOneAndUpdate(
      { _id: goalId, addedBy: userId },
      updateObj,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      data: mapGoalToResponse(goal)
    });
  } catch (error) {
    console.error('Error toggling goal achievement:', error);
    res.status(400).json({
      success: false,
      message: 'Error toggling goal achievement'
    });
  }
});

// Delete a goal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const goalId = req.params.id;
    const goal = await GoalModel.findOneAndDelete({ _id: goalId, addedBy: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting goal'
    });
  }
});

export default router;