// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from 'shared';
import UserModel, { IUser } from '../models/User';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: User;
}

interface JwtPayload {
  userId: string;
  email: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET!
    ) as JwtPayload;
    
    // Explicitly type the mongoose document
    const user = await UserModel.findById(decoded.userId)
      .select('-password') as IUser | null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform mongoose document to shared User type
    req.user = {
      _id: user._id.toString(), // Convert mongoose ObjectId to string
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};