import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// Apply authentication to all law firm routes
router.use(protect);

/**
 * @route GET /api/v1/law-firms
 * @desc Get all law firms
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Law firms retrieved successfully',
  });
}));

export { router as lawFirmRoutes };
