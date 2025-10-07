import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { PowerOfAttorney, POAType, POAStatus } from '../models/PowerOfAttorney';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/power-of-attorney
 * @desc Create a new power of attorney
 * @access Private (Lawyers, Admin)
 */
router.post('/', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const poaData = req.body;

  const poaNumber = await (PowerOfAttorney as any).generatePOANumber(user.lawFirmId);

  const newPOA = new PowerOfAttorney({
    ...poaData,
    poaNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    handledBy: poaData.handledBy || user._id,
  });

  const savedPOA = await newPOA.save();

  const populatedPOA = await PowerOfAttorney.findById(savedPOA._id)
    .populate('createdBy', 'name email')
    .populate('handledBy', 'name email')
    .populate('supervisedBy', 'name email')
    .populate('relatedCase', 'title caseNumber')
    .populate('relatedClient', 'name email');

  res.status(201).json({
    success: true,
    data: populatedPOA,
    message: 'Power of Attorney created successfully',
  });
}));

/**
 * @route GET /api/v1/power-of-attorney
 * @desc Get power of attorney documents with filters
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    type,
    status,
    handledBy,
    search,
    expiringWithin,
    isActive,
    startDate,
    endDate
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (handledBy) filter.handledBy = handledBy;
  if (isActive === 'true') {
    filter.status = POAStatus.ACTIVE;
    filter['revocation.isRevoked'] = { $ne: true };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { 'grantor.name': { $regex: search, $options: 'i' } },
      { 'attorney.name': { $regex: search, $options: 'i' } },
      { poaNumber: { $regex: search, $options: 'i' } },
    ];
  }

  if (expiringWithin) {
    const days = parseInt(expiringWithin as string);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    filter.expirationDate = { $lte: futureDate, $gte: new Date() };
    filter.isIndefinite = false;
  }

  if (startDate || endDate) {
    filter.effectiveDate = {};
    if (startDate) filter.effectiveDate.$gte = new Date(startDate as string);
    if (endDate) filter.effectiveDate.$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [poas, total] = await Promise.all([
    PowerOfAttorney.find(filter)
      .populate('createdBy', 'name email')
      .populate('handledBy', 'name email')
      .populate('supervisedBy', 'name email')
      .populate('relatedCase', 'title caseNumber')
      .populate('relatedClient', 'name email')
      .sort({ effectiveDate: -1 })
      .skip(skip)
      .limit(limitNum),
    PowerOfAttorney.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: poas,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Power of Attorney documents retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/power-of-attorney/:id/activate
 * @desc Activate a power of attorney
 * @access Private (Lawyers, Admin)
 */
router.put('/:id/activate', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const poaId = req.params.id;

  const poa = await PowerOfAttorney.findOneAndUpdate(
    {
      _id: poaId,
      lawFirmId: user.lawFirmId,
      status: POAStatus.DRAFT,
      isDeleted: false
    },
    {
      status: POAStatus.ACTIVE,
      updatedBy: user._id
    },
    { new: true }
  ).populate('handledBy', 'name email');

  if (!poa) {
    return res.status(404).json({
      success: false,
      message: 'Power of Attorney not found or cannot be activated',
    });
  }

  res.json({
    success: true,
    data: poa,
    message: 'Power of Attorney activated successfully',
  });
}));

/**
 * @route PUT /api/v1/power-of-attorney/:id/revoke
 * @desc Revoke a power of attorney
 * @access Private (Lawyers, Admin)
 */
router.put('/:id/revoke', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const poaId = req.params.id;
  const { reason, reasonAr, affectedParties } = req.body;

  const poa = await PowerOfAttorney.findOneAndUpdate(
    {
      _id: poaId,
      lawFirmId: user.lawFirmId,
      status: POAStatus.ACTIVE,
      isDeleted: false
    },
    {
      status: POAStatus.REVOKED,
      'revocation.isRevoked': true,
      'revocation.revocationDate': new Date(),
      'revocation.revokedBy': user._id,
      'revocation.reason': reason,
      'revocation.reasonAr': reasonAr,
      'revocation.affectedParties': affectedParties || [],
      'revocation.notificationSent': false,
      updatedBy: user._id
    },
    { new: true }
  ).populate('handledBy', 'name email');

  if (!poa) {
    return res.status(404).json({
      success: false,
      message: 'Power of Attorney not found or cannot be revoked',
    });
  }

  res.json({
    success: true,
    data: poa,
    message: 'Power of Attorney revoked successfully',
  });
}));

/**
 * @route POST /api/v1/power-of-attorney/:id/usage
 * @desc Log usage of power of attorney
 * @access Private (All authenticated users)
 */
router.post('/:id/usage', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const poaId = req.params.id;
  const { purpose, purposeAr, outcome, outcomeAr, documentsSigned, transactionAmount, currency } = req.body;

  const poa = await PowerOfAttorney.findOneAndUpdate(
    {
      _id: poaId,
      lawFirmId: user.lawFirmId,
      status: POAStatus.ACTIVE,
      isDeleted: false
    },
    {
      $push: {
        usageLog: {
          usedDate: new Date(),
          usedBy: user._id,
          purpose,
          purposeAr,
          outcome,
          outcomeAr,
          documentsSigned: documentsSigned || [],
          transactionAmount,
          currency
        }
      },
      updatedBy: user._id
    },
    { new: true }
  );

  if (!poa) {
    return res.status(404).json({
      success: false,
      message: 'Active Power of Attorney not found',
    });
  }

  res.json({
    success: true,
    data: poa,
    message: 'Power of Attorney usage logged successfully',
  });
}));

/**
 * @route GET /api/v1/power-of-attorney/expiring
 * @desc Get expiring power of attorney documents
 * @access Private (All authenticated users)
 */
router.get('/expiring', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { days = 30 } = req.query;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days as string));

  const expiringPOAs = await PowerOfAttorney.find({
    lawFirmId: user.lawFirmId,
    status: POAStatus.ACTIVE,
    isIndefinite: false,
    expirationDate: { $lte: futureDate, $gte: new Date() },
    isDeleted: false
  })
    .populate('handledBy', 'name email')
    .populate('relatedCase', 'title caseNumber')
    .sort({ expirationDate: 1 });

  res.json({
    success: true,
    data: expiringPOAs,
    count: expiringPOAs.length,
    message: 'Expiring Power of Attorney documents retrieved successfully',
  });
}));

export { router as powerOfAttorneyRoutes };
