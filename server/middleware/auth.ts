// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from 'shared';
import UserModel from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
}

export const authenticateToken = async (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) => {
  console.log('Authenticating token...');
  console.log('Auth header:', req.headers.authorization);

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token found:', token.substring(0, 10) + '...');
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log('Token decoded:', decoded);

    const user = await UserModel.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

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