import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';

const router = Router();

// Apply authentication to all document routes
router.use(protect);

/**
 * @route GET /api/v1/documents
 * @desc Get all documents
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Documents retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/documents
 * @desc Upload a new document
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {},
    message: 'Document uploaded successfully',
  });
}));

export { router as documentRoutes };
