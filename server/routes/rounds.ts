// server/routes/rounds.ts
import express, { Request } from 'express';
import { Round } from 'shared';
import RoundModel from '../models/Round';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

const router = express.Router();

function mapRoundToResponse(round: any): Round {
  return {
    _id: round._id.toString(),
    course: round.course.toString(),
    date: round.date,
    tees: round.tees,
    score: round.score,
    putts: round.putts,
    fairways: round.fairways,
    notes: round.notes,
    addedBy: round.addedBy.toString(),
    createdAt: round.createdAt,
    updatedAt: round.updatedAt
  };
}

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const rounds = await RoundModel.find({ addedBy: userId })
      .populate('course')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: rounds.map(mapRoundToResponse)
    });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rounds'
    });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const roundData = {
      ...req.body,
      addedBy: userId
    };

    const round = new RoundModel(roundData);
    await round.save();

    // Populate the course to get the full course details
    await round.populate('course');

    res.status(201).json({
      success: true,
      data: mapRoundToResponse(round)
    });
  } catch (error) {
    console.error('Error creating round:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating round'
    });
  }
});

export default router;