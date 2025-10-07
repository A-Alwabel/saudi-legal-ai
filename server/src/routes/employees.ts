import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Employee, EmployeeStatus, EmploymentType, EmployeeRole } from '../models/Employee';
import { User } from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all employee routes
router.use(protect);

/**
 * @route GET /api/v1/employees
 * @desc Get all employees for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    role,
    department,
    employmentType,
    managerId,
    search,
    sortBy = 'hireDate',
    sortOrder = 'desc'
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };

  if (status) filter.status = status;
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (employmentType) filter.employmentType = employmentType;
  if (managerId) filter.managerId = managerId;

  // Search filtering
  if (search) {
    filter.$or = [
      { employeeId: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { firstNameAr: { $regex: search, $options: 'i' } },
      { lastNameAr: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { positionAr: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('managerId', 'firstName lastName firstNameAr lastNameAr position')
      .populate('directReports', 'firstName lastName firstNameAr lastNameAr position')
      .populate('userId', 'name email isActive lastLogin')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Employee.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: employees,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Employees retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/employees/dashboard
 * @desc Get employee dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalEmployees,
    activeEmployees,
    newHires,
    employeesByRole,
    employeesByDepartment,
    employeesByStatus,
    recentHires,
    upcomingReviews
  ] = await Promise.all([
    Employee.countDocuments(filter),
    Employee.countDocuments({ ...filter, status: EmployeeStatus.ACTIVE }),
    Employee.countDocuments({ 
      ...filter, 
      hireDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }),
    Employee.aggregate([
      { $match: filter },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    Employee.aggregate([
      { $match: filter },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]),
    Employee.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Employee.find(filter)
      .sort({ hireDate: -1 })
      .limit(5)
      .select('firstName lastName firstNameAr lastNameAr position role hireDate'),
    Employee.find({
      ...filter,
      'performanceReviews.reviewDate': { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    })
      .limit(10)
      .select('firstName lastName position performanceReviews')
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalEmployees,
        activeEmployees,
        newHires,
        averageTenure: 0, // Would need additional calculation
      },
      charts: {
        employeesByRole: employeesByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        employeesByDepartment: employeesByDepartment.reduce((acc, item) => {
          acc[item._id || 'Unassigned'] = item.count;
          return acc;
        }, {} as Record<string, number>),
        employeesByStatus: employeesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
      recentHires,
      upcomingReviews,
    },
    message: 'Employee dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/employees/:id
 * @desc Get a specific employee
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeId = req.params.id;

  if (!Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID format',
    });
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId
  })
    .populate('managerId', 'firstName lastName firstNameAr lastNameAr position email')
    .populate('directReports', 'firstName lastName firstNameAr lastNameAr position')
    .populate('userId', 'name email isActive lastLogin')
    .populate('performanceReviews.reviewer', 'firstName lastName')
    .populate('disciplinaryActions.issuedBy', 'firstName lastName')
    .populate('documents.uploadedBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found',
    });
  }

  res.json({
    success: true,
    data: employee,
    message: 'Employee retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/employees
 * @desc Create a new employee
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeData = req.body;

  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'position', 'employmentType', 'hireDate'];
  for (const field of requiredFields) {
    if (!employeeData[field]) {
      return res.status(400).json({
        success: false,
        message: `Missing required field: ${field}`,
      });
    }
  }

  // Check if email already exists
  const existingEmployee = await Employee.findOne({ email: employeeData.email });
  if (existingEmployee) {
    return res.status(409).json({
      success: false,
      message: 'Employee with this email already exists',
    });
  }

  // Validate manager if provided
  if (employeeData.managerId) {
    const manager = await Employee.findOne({
      _id: employeeData.managerId,
      lawFirmId: user.lawFirmId,
      status: EmployeeStatus.ACTIVE
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found or inactive',
      });
    }
  }

  // Generate employee ID
  const employeeId = await (Employee as any).generateEmployeeId(user.lawFirmId);

  const newEmployee = new Employee({
    ...employeeData,
    employeeId,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    // Set default salary if not provided
    salary: employeeData.salary || {
      amount: 0,
      currency: 'SAR',
      frequency: 'monthly',
      effectiveDate: new Date(),
    },
    // Set default work schedule if not provided
    workSchedule: employeeData.workSchedule || {
      workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      startTime: '08:00',
      endTime: '17:00',
      breakDuration: 60,
      hoursPerWeek: 40,
    },
    // Set default system access
    systemAccess: employeeData.systemAccess || {
      hasAccess: false,
      roles: [],
      permissions: [],
      accountStatus: 'inactive',
    },
  });

  const savedEmployee = await newEmployee.save();

  // Update manager's direct reports
  if (employeeData.managerId) {
    await Employee.findByIdAndUpdate(
      employeeData.managerId,
      { $addToSet: { directReports: savedEmployee._id } }
    );
  }

  // Populate the response
  const populatedEmployee = await Employee.findById(savedEmployee._id)
    .populate('managerId', 'firstName lastName position')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedEmployee,
    message: 'Employee created successfully',
  });
}));

/**
 * @route PUT /api/v1/employees/:id
 * @desc Update an employee
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeId = req.params.id;

  if (!Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID format',
    });
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found',
    });
  }

  // Check if email is being changed and if it already exists
  if (req.body.email && req.body.email !== employee.email) {
    const existingEmployee = await Employee.findOne({ 
      email: req.body.email,
      _id: { $ne: employeeId }
    });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists',
      });
    }
  }

  // Update allowed fields
  const allowedFields = [
    'firstName', 'lastName', 'firstNameAr', 'lastNameAr', 'email', 'phone', 'alternatePhone',
    'dateOfBirth', 'nationality', 'nationalId', 'passportNumber', 'address', 'emergencyContact',
    'status', 'employmentType', 'role', 'department', 'position', 'positionAr', 'managerId',
    'salary', 'benefits', 'workSchedule', 'qualifications', 'certifications', 'skills',
    'languages', 'systemAccess', 'notes', 'notesAr'
  ];

  // Handle manager change
  const oldManagerId = employee.managerId?.toString();
  const newManagerId = req.body.managerId;

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      employee[field] = req.body[field];
    }
  });

  employee.updatedBy = user._id;

  const updatedEmployee = await employee.save();

  // Update manager relationships if changed
  if (oldManagerId !== newManagerId) {
    // Remove from old manager's direct reports
    if (oldManagerId) {
      await Employee.findByIdAndUpdate(
        oldManagerId,
        { $pull: { directReports: employeeId } }
      );
    }
    
    // Add to new manager's direct reports
    if (newManagerId) {
      await Employee.findByIdAndUpdate(
        newManagerId,
        { $addToSet: { directReports: employeeId } }
      );
    }
  }

  // Populate the response
  const populatedEmployee = await Employee.findById(updatedEmployee._id)
    .populate('managerId', 'firstName lastName position')
    .populate('directReports', 'firstName lastName position');

  res.json({
    success: true,
    data: populatedEmployee,
    message: 'Employee updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/employees/:id
 * @desc Deactivate an employee (soft delete)
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeId = req.params.id;
  const { terminationDate, reason } = req.body;

  if (!Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID format',
    });
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found',
    });
  }

  // Update employee status to terminated
  employee.status = EmployeeStatus.TERMINATED;
  employee.terminationDate = terminationDate ? new Date(terminationDate) : new Date();
  employee.lastWorkingDay = employee.terminationDate;
  employee.systemAccess.hasAccess = false;
  employee.systemAccess.accountStatus = 'inactive';
  
  if (reason) {
    employee.notes = `${employee.notes || ''}\nTermination reason: ${reason}`.trim();
  }

  await employee.save();

  // Remove from manager's direct reports
  if (employee.managerId) {
    await Employee.findByIdAndUpdate(
      employee.managerId,
      { $pull: { directReports: employeeId } }
    );
  }

  // Reassign direct reports to manager's manager or remove manager
  if (employee.directReports && employee.directReports.length > 0) {
    await Employee.updateMany(
      { _id: { $in: employee.directReports } },
      { $unset: { managerId: 1 } }
    );
  }

  res.json({
    success: true,
    message: 'Employee terminated successfully',
  });
}));

/**
 * @route POST /api/v1/employees/:id/performance-review
 * @desc Add performance review
 * @access Private
 */
router.post('/:id/performance-review', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeId = req.params.id;
  const { rating, goals, achievements, areasForImprovement, comments } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating is required and must be between 1 and 5',
    });
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found',
    });
  }

  const newReview = {
    reviewDate: new Date(),
    reviewer: user._id,
    rating,
    goals: goals || [],
    achievements: achievements || [],
    areasForImprovement: areasForImprovement || [],
    comments,
  };

  employee.performanceReviews.push(newReview);
  await employee.save();

  res.json({
    success: true,
    data: newReview,
    message: 'Performance review added successfully',
  });
}));

/**
 * @route POST /api/v1/employees/:id/disciplinary-action
 * @desc Add disciplinary action
 * @access Private
 */
router.post('/:id/disciplinary-action', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeId = req.params.id;
  const { type, reason, description } = req.body;

  if (!type || !reason || !description) {
    return res.status(400).json({
      success: false,
      message: 'Type, reason, and description are required',
    });
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found',
    });
  }

  const newAction = {
    date: new Date(),
    type,
    reason,
    description,
    issuedBy: user._id,
    acknowledged: false,
  };

  employee.disciplinaryActions.push(newAction);
  await employee.save();

  res.json({
    success: true,
    data: newAction,
    message: 'Disciplinary action added successfully',
  });
}));

/**
 * @route POST /api/v1/employees/:id/salary-adjustment
 * @desc Add salary adjustment
 * @access Private
 */
router.post('/:id/salary-adjustment', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const employeeId = req.params.id;
  const { amount, currency, frequency, effectiveDate, reason } = req.body;

  if (!amount || !effectiveDate) {
    return res.status(400).json({
      success: false,
      message: 'Amount and effective date are required',
    });
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found',
    });
  }

  // Save current salary to history
  if (!employee.salaryHistory) {
    employee.salaryHistory = [];
  }
  
  employee.salaryHistory.push({
    amount: employee.salary.amount,
    currency: employee.salary.currency,
    frequency: employee.salary.frequency,
    effectiveDate: employee.salary.effectiveDate,
    reason: 'Previous salary before adjustment',
  });

  // Update current salary
  employee.salary = {
    amount,
    currency: currency || employee.salary.currency,
    frequency: frequency || employee.salary.frequency,
    effectiveDate: new Date(effectiveDate),
  };

  if (reason) {
    employee.notes = `${employee.notes || ''}\nSalary adjustment: ${reason}`.trim();
  }

  await employee.save();

  res.json({
    success: true,
    data: employee.salary,
    message: 'Salary adjusted successfully',
  });
}));

/**
 * @route GET /api/v1/employees/hierarchy
 * @desc Get organizational hierarchy
 * @access Private
 */
router.get('/hierarchy/tree', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  const employees = await Employee.find({
    lawFirmId: user.lawFirmId,
    status: EmployeeStatus.ACTIVE
  })
    .populate('managerId', 'firstName lastName position')
    .populate('directReports', 'firstName lastName position')
    .select('firstName lastName position role managerId directReports');

  // Build hierarchy tree
  const buildHierarchy = (employees: any[], parentId: any = null): any[] => {
    return employees
      .filter(emp => {
        if (parentId === null) {
          return !emp.managerId;
        }
        return emp.managerId && emp.managerId._id.toString() === parentId.toString();
      })
      .map(emp => ({
        ...emp.toObject(),
        children: buildHierarchy(employees, emp._id)
      }));
  };

  const hierarchy = buildHierarchy(employees);

  res.json({
    success: true,
    data: hierarchy,
    message: 'Organizational hierarchy retrieved successfully',
  });
}));

export { router as employeeRoutes };
