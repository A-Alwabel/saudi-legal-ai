import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { LegalResource, ResourceType, Jurisdiction, AccessLevel, ResourceStatus } from '../models/LegalLibrary';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected
router.use(protect);

/**
 * @route POST /api/v1/legal-library/resources
 * @desc Create a new legal resource
 * @access Private (Admin, Manager, Lawyer, Librarian)
 */
router.post('/resources', authorize(['admin', 'manager', 'lawyer', 'librarian']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceData = req.body;

  // Generate resource number
  const resourceNumber = await (LegalResource as any).generateResourceNumber(
    user.lawFirmId,
    resourceData.resourceType
  );

  const newResource = new LegalResource({
    ...resourceData,
    resourceNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    changeLog: [{
      version: resourceData.version || '1.0',
      changeDate: new Date(),
      changedBy: user._id,
      changeDescription: 'Resource created',
      changeDescriptionAr: 'تم إنشاء المورد',
      changeType: 'created'
    }]
  });

  const savedResource = await newResource.save();

  const populatedResource = await LegalResource.findById(savedResource._id)
    .populate('createdBy', 'name email')
    .populate('authorizedUsers', 'name email')
    .populate('authorizedRoles', 'roleName roleCode')
    .populate('parentResource', 'title titleAr resourceNumber')
    .populate('childResources', 'title titleAr resourceNumber');

  res.status(201).json({
    success: true,
    data: populatedResource,
    message: 'Legal resource created successfully',
  });
}));

/**
 * @route GET /api/v1/legal-library/resources
 * @desc Get all legal resources with filters and pagination
 * @access Private (All authenticated users)
 */
router.get('/resources', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    resourceType,
    jurisdiction,
    practiceArea,
    status,
    accessLevel,
    language,
    search,
    tags,
    author,
    publishedAfter,
    publishedBefore,
    sortBy = 'publishedDate',
    sortOrder = 'desc'
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    status: { $ne: ResourceStatus.ARCHIVED }
  };

  // Apply filters
  if (resourceType) filter.resourceType = resourceType;
  if (jurisdiction) filter.jurisdiction = { $in: (jurisdiction as string).split(',') };
  if (practiceArea) filter.practiceAreas = practiceArea;
  if (status) filter.status = status;
  if (accessLevel) filter.accessLevel = accessLevel;
  if (language) filter.language = language;
  if (author) {
    filter.$or = [
      { author: { $regex: author, $options: 'i' } },
      { authorAr: { $regex: author, $options: 'i' } }
    ];
  }

  // Date range filter
  if (publishedAfter || publishedBefore) {
    filter.publishedDate = {};
    if (publishedAfter) filter.publishedDate.$gte = new Date(publishedAfter as string);
    if (publishedBefore) filter.publishedDate.$lte = new Date(publishedBefore as string);
  }

  // Tags filter
  if (tags) {
    const tagsArray = (tags as string).split(',').map(tag => tag.trim());
    filter.tags = { $in: tagsArray };
  }

  // Text search
  if (search) {
    filter.$text = { $search: search as string };
  }

  // Access control - users can only see resources they have access to
  const accessFilter = {
    $or: [
      { accessLevel: AccessLevel.PUBLIC },
      { accessLevel: AccessLevel.FIRM_WIDE },
      { createdBy: user._id },
      { authorizedUsers: user._id },
      // Add role-based and department-based access
    ]
  };

  const finalFilter = { ...filter, ...accessFilter };

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sort: any = {};
  if (search) {
    sort.score = { $meta: 'textScore' };
  } else {
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
  }

  const [resources, total] = await Promise.all([
    LegalResource.find(finalFilter)
      .populate('createdBy', 'name email')
      .populate('parentResource', 'title titleAr resourceNumber')
      .populate('relatedCases', 'title titleAr caseNumber')
      .populate('relatedClients', 'name nameAr')
      .select('-fullText -fullTextAr -searchableContent -searchableContentAr')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    LegalResource.countDocuments(finalFilter)
  ]);

  res.json({
    success: true,
    data: resources,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Legal resources retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/legal-library/resources/dashboard
 * @desc Get legal library dashboard data
 * @access Private (Admin, Manager, Librarian)
 */
router.get('/resources/dashboard', authorize(['admin', 'manager', 'librarian']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalResources,
    activeResources,
    resourcesByType,
    resourcesByJurisdiction,
    resourcesByStatus,
    topViewedResources,
    recentResources,
    expiringResources,
    popularTags
  ] = await Promise.all([
    LegalResource.countDocuments(filter),
    LegalResource.countDocuments({ ...filter, status: ResourceStatus.ACTIVE }),
    LegalResource.aggregate([
      { $match: filter },
      { $group: { _id: '$resourceType', count: { $sum: 1 } } }
    ]),
    LegalResource.aggregate([
      { $match: filter },
      { $unwind: '$jurisdiction' },
      { $group: { _id: '$jurisdiction', count: { $sum: 1 } } }
    ]),
    LegalResource.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    LegalResource.find(filter)
      .sort({ viewCount: -1 })
      .limit(10)
      .select('title titleAr resourceType viewCount downloadCount')
      .populate('createdBy', 'name'),
    LegalResource.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title titleAr resourceType status createdAt')
      .populate('createdBy', 'name'),
    LegalResource.find({
      ...filter,
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Next 90 days
      }
    })
      .select('title titleAr expiryDate')
      .limit(10),
    LegalResource.aggregate([
      { $match: filter },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalResources,
        activeResources,
      },
      charts: {
        resourcesByType: resourcesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        resourcesByJurisdiction: resourcesByJurisdiction.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        resourcesByStatus: resourcesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
      topViewedResources,
      recentResources,
      expiringResources,
      popularTags: popularTags.map(tag => ({ tag: tag._id, count: tag.count })),
    },
    message: 'Legal library dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/legal-library/resources/:id
 * @desc Get a specific legal resource
 * @access Private (Based on access permissions)
 */
router.get('/resources/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceId = req.params.id;

  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID format',
    });
  }

  const resource = await LegalResource.findOne({
    _id: resourceId,
    lawFirmId: user.lawFirmId,
    $or: [
      { accessLevel: AccessLevel.PUBLIC },
      { accessLevel: AccessLevel.FIRM_WIDE },
      { createdBy: user._id },
      { authorizedUsers: user._id },
    ]
  })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('authorizedUsers', 'name email')
    .populate('authorizedRoles', 'roleName roleCode')
    .populate('parentResource', 'title titleAr resourceNumber resourceType')
    .populate('childResources', 'title titleAr resourceNumber resourceType')
    .populate('relatedResources.resourceId', 'title titleAr resourceNumber resourceType')
    .populate('citations.resourceId', 'title titleAr resourceNumber')
    .populate('relatedCases', 'title titleAr caseNumber status')
    .populate('relatedClients', 'name nameAr email')
    .populate('annotations.userId', 'name email')
    .populate('rating.ratings.userId', 'name email')
    .populate('subscribers', 'name email')
    .populate('changeLog.changedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Legal resource not found or access denied',
    });
  }

  // Increment view count
  resource.viewCount += 1;
  await resource.save();

  res.json({
    success: true,
    data: resource,
    message: 'Legal resource retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/legal-library/resources/:id
 * @desc Update a legal resource
 * @access Private (Admin, Manager, Librarian, Creator)
 */
router.put('/resources/:id', authorize(['admin', 'manager', 'librarian']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceId = req.params.id;

  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID format',
    });
  }

  const resource = await LegalResource.findOne({
    _id: resourceId,
    lawFirmId: user.lawFirmId
  });

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Legal resource not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'titleAr', 'subtitle', 'subtitleAr', 'resourceType', 'jurisdiction',
    'practiceAreas', 'keywords', 'keywordsAr', 'tags', 'lawNumber', 'regulationNumber',
    'decreeNumber', 'caseNumber', 'courtName', 'courtNameAr', 'judgeName', 'judgeNameAr',
    'publishedDate', 'effectiveDate', 'expiryDate', 'lastAmendmentDate', 'publisher',
    'publisherAr', 'publicationSource', 'publicationSourceAr', 'author', 'authorAr',
    'coAuthors', 'coAuthorsAr', 'editor', 'editorAr', 'translator', 'translatorAr',
    'abstract', 'abstractAr', 'summary', 'summaryAr', 'fullText', 'fullTextAr',
    'language', 'pageCount', 'wordCount', 'accessLevel', 'authorizedUsers',
    'authorizedRoles', 'authorizedDepartments', 'authorizedBranches', 'status',
    'relatedCases', 'relatedClients', 'isbn', 'doi', 'url', 'sourceUrl',
    'copyrightInfo', 'copyrightInfoAr', 'licenseType', 'notes', 'notesAr', 'internalNotes'
  ];

  const oldVersion = resource.version;
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      resource[field] = req.body[field];
    }
  });

  // Update version and change log
  if (req.body.version && req.body.version !== oldVersion) {
    resource.version = req.body.version;
    resource.changeLog.push({
      version: req.body.version,
      changeDate: new Date(),
      changedBy: user._id,
      changeDescription: req.body.changeDescription || 'Resource updated',
      changeDescriptionAr: req.body.changeDescriptionAr || 'تم تحديث المورد',
      changeType: 'updated'
    });
  }

  resource.updatedBy = user._id;

  const updatedResource = await resource.save();

  const populatedResource = await LegalResource.findById(updatedResource._id)
    .populate('authorizedUsers', 'name email')
    .populate('authorizedRoles', 'roleName roleCode');

  res.json({
    success: true,
    data: populatedResource,
    message: 'Legal resource updated successfully',
  });
}));

/**
 * @route POST /api/v1/legal-library/resources/:id/rate
 * @desc Rate a legal resource
 * @access Private (All authenticated users)
 */
router.post('/resources/:id/rate', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceId = req.params.id;
  const { rating, review, reviewAr } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5',
    });
  }

  const resource = await LegalResource.findOne({
    _id: resourceId,
    lawFirmId: user.lawFirmId
  });

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Legal resource not found',
    });
  }

  // Check if user already rated this resource
  const existingRatingIndex = resource.rating.ratings.findIndex(
    r => r.userId.toString() === user._id.toString()
  );

  if (existingRatingIndex >= 0) {
    // Update existing rating
    resource.rating.ratings[existingRatingIndex] = {
      userId: user._id,
      rating,
      review,
      reviewAr,
      createdAt: new Date()
    };
  } else {
    // Add new rating
    resource.rating.ratings.push({
      userId: user._id,
      rating,
      review,
      reviewAr,
      createdAt: new Date()
    });
  }

  await resource.save();

  res.json({
    success: true,
    data: resource.rating,
    message: 'Rating submitted successfully',
  });
}));

/**
 * @route POST /api/v1/legal-library/resources/:id/annotate
 * @desc Add annotation to a legal resource
 * @access Private (All authenticated users)
 */
router.post('/resources/:id/annotate', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceId = req.params.id;
  const { content, contentAr, annotationType, isPrivate } = req.body;

  if (!content || !annotationType) {
    return res.status(400).json({
      success: false,
      message: 'Content and annotation type are required',
    });
  }

  const resource = await LegalResource.findOne({
    _id: resourceId,
    lawFirmId: user.lawFirmId
  });

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Legal resource not found',
    });
  }

  resource.annotations.push({
    userId: user._id,
    content,
    contentAr,
    annotationType,
    isPrivate: isPrivate !== false, // Default to private
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await resource.save();

  res.json({
    success: true,
    data: resource.annotations[resource.annotations.length - 1],
    message: 'Annotation added successfully',
  });
}));

/**
 * @route POST /api/v1/legal-library/resources/:id/subscribe
 * @desc Subscribe to updates for a legal resource
 * @access Private (All authenticated users)
 */
router.post('/resources/:id/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceId = req.params.id;

  const resource = await LegalResource.findOne({
    _id: resourceId,
    lawFirmId: user.lawFirmId
  });

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Legal resource not found',
    });
  }

  if (!resource.subscribers.includes(user._id)) {
    resource.subscribers.push(user._id);
    await resource.save();
  }

  res.json({
    success: true,
    message: 'Subscribed to resource updates successfully',
  });
}));

/**
 * @route DELETE /api/v1/legal-library/resources/:id/subscribe
 * @desc Unsubscribe from updates for a legal resource
 * @access Private (All authenticated users)
 */
router.delete('/resources/:id/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const resourceId = req.params.id;

  const resource = await LegalResource.findOne({
    _id: resourceId,
    lawFirmId: user.lawFirmId
  });

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Legal resource not found',
    });
  }

  resource.subscribers = resource.subscribers.filter(
    id => id.toString() !== user._id.toString()
  );
  await resource.save();

  res.json({
    success: true,
    message: 'Unsubscribed from resource updates successfully',
  });
}));

/**
 * @route GET /api/v1/legal-library/search/advanced
 * @desc Advanced search in legal library
 * @access Private (All authenticated users)
 */
router.get('/search/advanced', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    query,
    resourceTypes,
    jurisdictions,
    practiceAreas,
    authors,
    publishers,
    dateFrom,
    dateTo,
    tags,
    hasFiles,
    language,
    minRating,
    page = 1,
    limit = 20
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    status: ResourceStatus.ACTIVE,
    $or: [
      { accessLevel: AccessLevel.PUBLIC },
      { accessLevel: AccessLevel.FIRM_WIDE },
      { createdBy: user._id },
      { authorizedUsers: user._id },
    ]
  };

  // Apply advanced filters
  if (resourceTypes) {
    filter.resourceType = { $in: (resourceTypes as string).split(',') };
  }
  if (jurisdictions) {
    filter.jurisdiction = { $in: (jurisdictions as string).split(',') };
  }
  if (practiceAreas) {
    filter.practiceAreas = { $in: (practiceAreas as string).split(',') };
  }
  if (authors) {
    const authorList = (authors as string).split(',');
    filter.$or = [
      { author: { $in: authorList.map(a => new RegExp(a, 'i')) } },
      { authorAr: { $in: authorList.map(a => new RegExp(a, 'i')) } }
    ];
  }
  if (publishers) {
    const publisherList = (publishers as string).split(',');
    filter.$or = [
      { publisher: { $in: publisherList.map(p => new RegExp(p, 'i')) } },
      { publisherAr: { $in: publisherList.map(p => new RegExp(p, 'i')) } }
    ];
  }
  if (dateFrom || dateTo) {
    filter.publishedDate = {};
    if (dateFrom) filter.publishedDate.$gte = new Date(dateFrom as string);
    if (dateTo) filter.publishedDate.$lte = new Date(dateTo as string);
  }
  if (tags) {
    filter.tags = { $in: (tags as string).split(',') };
  }
  if (hasFiles === 'true') {
    filter['files.0'] = { $exists: true };
  }
  if (language) {
    filter.language = language;
  }
  if (minRating) {
    filter['rating.averageRating'] = { $gte: parseFloat(minRating as string) };
  }

  // Text search
  if (query) {
    filter.$text = { $search: query as string };
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sort: any = query ? { score: { $meta: 'textScore' } } : { publishedDate: -1 };

  const [results, total] = await Promise.all([
    LegalResource.find(filter)
      .populate('createdBy', 'name')
      .populate('parentResource', 'title titleAr resourceNumber')
      .select('-fullText -fullTextAr -searchableContent -searchableContentAr')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    LegalResource.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Advanced search completed successfully',
  });
}));

/**
 * @route GET /api/v1/legal-library/reports/usage
 * @desc Get usage analytics report
 * @access Private (Admin, Manager, Librarian)
 */
router.get('/reports/usage', authorize(['admin', 'manager', 'librarian']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { startDate, endDate, resourceType, jurisdiction } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };
  if (resourceType) filter.resourceType = resourceType;
  if (jurisdiction) filter.jurisdiction = jurisdiction;

  const [
    totalViews,
    totalDownloads,
    mostViewedResources,
    mostDownloadedResources,
    usageByType,
    usageByJurisdiction,
    topRatedResources
  ] = await Promise.all([
    LegalResource.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]),
    LegalResource.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]),
    LegalResource.find(filter)
      .sort({ viewCount: -1 })
      .limit(10)
      .select('title titleAr resourceType viewCount')
      .populate('createdBy', 'name'),
    LegalResource.find(filter)
      .sort({ downloadCount: -1 })
      .limit(10)
      .select('title titleAr resourceType downloadCount')
      .populate('createdBy', 'name'),
    LegalResource.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$resourceType',
          totalViews: { $sum: '$viewCount' },
          totalDownloads: { $sum: '$downloadCount' },
          count: { $sum: 1 }
        }
      }
    ]),
    LegalResource.aggregate([
      { $match: filter },
      { $unwind: '$jurisdiction' },
      {
        $group: {
          _id: '$jurisdiction',
          totalViews: { $sum: '$viewCount' },
          totalDownloads: { $sum: '$downloadCount' },
          count: { $sum: 1 }
        }
      }
    ]),
    LegalResource.find(filter)
      .sort({ 'rating.averageRating': -1, 'rating.totalRatings': -1 })
      .limit(10)
      .select('title titleAr resourceType rating')
      .populate('createdBy', 'name')
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
      },
      mostViewedResources,
      mostDownloadedResources,
      usageByType,
      usageByJurisdiction,
      topRatedResources,
    },
    message: 'Usage analytics report generated successfully',
  });
}));

export { router as legalLibraryRoutes };