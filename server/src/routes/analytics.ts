import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// Apply authentication to all analytics routes
router.use(protect);

/**
 * @route GET /api/v1/analytics
 * @desc Get analytics data
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalCases: 0,
      activeCases: 0,
      closedCases: 0,
      successRate: 0,
      revenue: 0,
    },
    message: 'Analytics retrieved successfully',
  });
}));

export { router as analyticsRoutes };
