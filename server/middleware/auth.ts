// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from 'shared';
import UserModel, { IUser } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
}

// Helper function to convert MongoDB document to User type
export function mapUserToResponse(user: IUser): User {
  const userObj = user.toObject();
  return {
    _id: userObj._id.toString(),
    email: userObj.email,
    name: userObj.name,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
    savedCourses: (userObj.savedCourses || []).map((course: any) => ({
      ...course,
      _id: course._id.toString(),
      addedBy: course.addedBy.toString()
    })),
    rounds: (userObj.rounds || []).map((round: any) => ({
      ...round,
      _id: round._id.toString(),
      addedBy: round.addedBy.toString(),
      course: {
        ...round.course,
        _id: round.course._id.toString(),
        addedBy: round.course.addedBy.toString()
      }
    }))
  };
}

export const authenticateToken = async (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) => {
  console.log('Authenticating token...');

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log('Token decoded:', decoded);

    const user = await UserModel.findById(decoded.userId)
      .select('-password')
      .populate({
        path: 'rounds',
        populate: {
          path: 'course'
        }
      })
      .populate('savedCourses');

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);
    req.user = mapUserToResponse(user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};