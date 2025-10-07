import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { config } from '../config';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/jwt';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import { UserRole } from '@shared/types';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimiter);

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role = UserRole.LAWYER, lawFirmId } = req.body;

  // Validation
  if (!email || !password || !name || !lawFirmId) {
    throw new AppError('Email, password, name, and law firm are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Create new user
  const user = new User({
    email,
    password,
    name,
    role,
    lawFirmId,
  });

  await user.save();

  // Generate JWT token
  const token = generateToken({ 
    id: user._id, 
    email: user.email, 
    role: user.role, 
    lawFirmId: user.lawFirmId 
  });

  logger.info('User registered successfully', {
    userId: user._id,
    email: user.email,
    role: user.role,
    lawFirmId: user.lawFirmId,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lawFirmId: user.lawFirmId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    },
    message: 'User registered successfully',
  });
}));

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user and include password
  const user = await User.findOne({ email }).select('+password') as UserDocument & { password: string };
  
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token
  const token = generateToken({ 
    id: user._id, 
    email: user.email, 
    role: user.role, 
    lawFirmId: user.lawFirmId 
  });

  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
    role: user.role,
    lawFirmId: user.lawFirmId,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lawFirmId: user.lawFirmId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
      token,
    },
    message: 'Login successful',
  });
}));

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Private
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // Server-side logout would require token blacklisting
  
  logger.info('User logged out', {
    userId: req.user?.id,
    email: req.user?.email,
  });

  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lawFirmId: user.lawFirmId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
    message: 'User profile retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  // Verify current password
  const userWithPassword = await User.findById(user._id).select('+password') as UserDocument & { password: string };
  if (!userWithPassword) {
    throw new AppError('User not found', 404);
  }

  const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  userWithPassword.password = newPassword;
  await userWithPassword.save();

  logger.info('Password changed successfully', {
    userId: user._id,
    email: user.email,
  });

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

export { router as authRoutes };
