// server/routes/rounds.ts
import express, { Request } from 'express';
import { Round, Course } from 'shared';
import RoundModel, { IRound } from '../models/Round';
import { ICourse } from '../models/Course';
import { authenticateToken } from '../middleware/auth';
import { Document, PopulatedDoc } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

// Define an interface for a populated round document
interface PopulatedRound extends Omit<IRound, 'course'> {
  course: ICourse;
}

const router = express.Router();

function calculateDifferential(round: PopulatedRound): number {
  const tee = round.course.tees.find(t => t.name === round.tees);
  if (!tee) {
    throw new Error('Selected tee not found on course');
  }

  const differential = ((round.score - tee.rating) * 113) / tee.slope;
  return Math.round(differential * 10) / 10;
}

function mapCourseToResponse(course: any) {
  return {
    _id: course._id.toString(),
    name: course.name,
    location: course.location,
    tees: course.tees,
    addedBy: course.addedBy.toString(),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  };
}

function mapRoundToResponse(round: PopulatedRound): Round {
  return {
    _id: round._id.toString(),
    course: mapCourseToResponse(round.course),
    date: round.date,
    tees: round.tees,
    score: round.score,
    putts: round.putts,
    fairways: round.fairways,
    greens: round.greens,
    notes: round.notes,
    differential: round.differential,
    addedBy: round.addedBy.toString(),
    createdAt: round.createdAt,
    updatedAt: round.updatedAt
  };
}

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Create round instance but don't save yet
    const round = new RoundModel({
      ...req.body,
      addedBy: userId
    });

    // Populate course data for differential calculation
    await round.populate<{ course: ICourse }>('course');

    // Now we can safely access the populated course data
    const populatedRound = round as unknown as PopulatedRound;
    
    // Calculate and set differential
    const differential = calculateDifferential(populatedRound);
    round.differential = differential;

    // Save the round with the calculated differential
    await round.save();

    res.status(201).json({
      success: true,
      data: mapRoundToResponse(populatedRound)
    });
  } catch (error) {
    console.error('Error creating round:', {
      error,
      roundData: req.body,
      userId: req.user?._id
    });
    
    if (error instanceof Error) {
      const errorMessage = error.message || 'Error creating round';
      res.status(400).json({
        success: false,
        message: errorMessage
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error creating round'
      });
    }
  }
});

interface PopulatedRound extends Omit<IRound, 'course'> {
  course: ICourse;
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
      .populate<{ course: ICourse }>('course')
      .sort({ date: -1 });

    const mappedRounds = rounds.map(round => {
      const roundObj = round.toObject();
      return {
        ...roundObj,
        _id: roundObj._id.toString(),
        course: {
          ...roundObj.course,
          _id: roundObj.course._id.toString(),
          addedBy: roundObj.course.addedBy.toString()
        },
        addedBy: roundObj.addedBy.toString()
      };
    });

    res.json({
      success: true,
      data: mappedRounds
    });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rounds'
    });
  }
});

// DELETE a round
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const roundId = req.params.id;
    
    // Find the round and make sure it belongs to the user
    const round = await RoundModel.findOne({ 
      _id: roundId,
      addedBy: userId 
    });
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found or you do not have permission to delete it'
      });
    }
    
    // Delete the round
    await RoundModel.deleteOne({ _id: roundId });
    
    res.json({
      success: true,
      message: 'Round deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting round:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting round'
    });
  }
});

export default router;