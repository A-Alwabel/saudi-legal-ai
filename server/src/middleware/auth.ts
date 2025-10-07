import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret as string) as any;
    
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

export const checkLawFirmAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError('Authentication required', 401));
    return;
  }

  const lawFirmId = req.params.lawFirmId || req.body.lawFirmId || req.query.lawFirmId;
  
  if (lawFirmId && lawFirmId !== req.user.lawFirmId.toString()) {
    next(new AppError('Access denied to this law firm', 403));
    return;
  }

  next();
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};
