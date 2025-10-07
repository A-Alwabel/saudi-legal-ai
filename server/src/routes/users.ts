import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// Apply authentication to all user routes
router.use(protect);

/**
 * @route GET /api/v1/users
 * @desc Get all users
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Users retrieved successfully',
  });
}));

export { router as userRoutes };
