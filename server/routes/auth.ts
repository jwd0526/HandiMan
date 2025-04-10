// server/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from 'shared';
import UserModel, { IUser } from '../models/User';
import GoalModel from '../models/Goal';
import { authenticateToken, mapUserToResponse } from '../middleware/auth';
import { Request } from 'express';

const router = express.Router();

async function getPopulatedUser(userId: string) {
  return await UserModel.findById(userId)
    .select('-password')
    .populate({
      path: 'rounds',
      populate: {
        path: 'course'
      }
    })
    .populate('savedCourses');
}

router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.path);
  console.log('Headers:', req.headers);
  next();
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function generateToken(user: IUser): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Extended token expiration to 30 days
  );
}

router.get('/validate', authenticateToken, async (req: Request & { user?: IUser }, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user with populated data including rounds and courses
    const user = await getPopulatedUser(req.user._id.toString());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Also fetch the user's goals
    const goals = await GoalModel.find({ addedBy: req.user._id });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject({
            transform: (doc, ret) => {
              ret._id = ret._id.toString();
              ret.rounds = ret.rounds.map((round: any) => ({
                ...round,
                _id: round._id.toString(),
                addedBy: round.addedBy.toString(),
                course: {
                  ...round.course,
                  _id: round.course._id.toString(),
                  addedBy: round.course.addedBy.toString()
                }
              }));
              ret.savedCourses = ret.savedCourses.map((course: any) => ({
                ...course,
                _id: course._id.toString(),
                addedBy: course.addedBy.toString()
              }));
              return ret;
            }
          }),
          goals: goals.map((goal: any) => ({
            ...goal.toObject(),
            _id: goal._id.toString(),
            addedBy: goal.addedBy.toString()
          }))
        },
        token: req.headers.authorization?.split(' ')[1]
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const existingUser = await UserModel.findOne({
      email: { $regex: new RegExp(`^${validatedData.email}$`, 'i') }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = new UserModel(validatedData);
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: mapUserToResponse(user),
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await UserModel.findOne({
      email: { $regex: new RegExp(`^${validatedData.email}$`, 'i') }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await user.comparePassword(validatedData.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: mapUserToResponse(user),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;