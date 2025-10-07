import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Task, TaskStatus, TaskPriority, TaskType } from '../models/Task';
import { User } from '../models/User';
import { Client } from '../models/Client';
import { Case } from '../models/Case';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all task routes
router.use(protect);

/**
 * @route GET /api/v1/tasks
 * @desc Get all tasks for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority, 
    taskType,
    assignedTo,
    assignedBy,
    caseId,
    clientId,
    dueDate,
    overdue,
    search,
    view = 'assigned' // assigned, created, all, my
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { 
    lawFirmId: user.lawFirmId,
    isArchived: false,
  };

  // View-specific filtering
  switch (view) {
    case 'assigned':
      filter.assignedTo = user._id;
      break;
    case 'created':
      filter.assignedBy = user._id;
      break;
    case 'my':
      filter.$or = [
        { assignedTo: user._id },
        { assignedBy: user._id },
        { watchers: user._id }
      ];
      break;
    case 'all':
      // No additional filter
      break;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (taskType) filter.taskType = taskType;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (assignedBy) filter.assignedBy = assignedBy;
  if (caseId) filter.caseId = caseId;
  if (clientId) filter.clientId = clientId;

  // Date filtering
  if (dueDate) {
    const date = new Date(dueDate as string);
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    filter.dueDate = { $gte: date, $lt: nextDay };
  }

  // Overdue filtering
  if (overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] };
  }

  // Search filtering
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('clientId', 'name nameAr email')
      .populate('caseId', 'title caseNumber')
      .populate('createdBy', 'name email')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Task.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Tasks retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/tasks/dashboard
 * @desc Get task dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const user = req.user;
  const filter = { lawFirmId: user.lawFirmId, isArchived: false };

  const [
    myTasks,
    totalTasks,
    overdueTasks,
    completedThisWeek,
    tasksByStatus,
    tasksByPriority,
    recentTasks
  ] = await Promise.all([
    Task.countDocuments({ ...filter, assignedTo: user._id, status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } }),
    Task.countDocuments(filter),
    Task.countDocuments({ 
      ...filter, 
      dueDate: { $lt: new Date() },
      status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] }
    }),
    Task.countDocuments({ 
      ...filter, 
      status: TaskStatus.COMPLETED,
      completedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    Task.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Task.find({ ...filter, assignedTo: user._id })
      .populate('assignedBy', 'name')
      .populate('caseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        myTasks,
        totalTasks,
        overdueTasks,
        completedThisWeek,
      },
      charts: {
        tasksByStatus: tasksByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        tasksByPriority: tasksByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
      recentTasks,
    },
    message: 'Task dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/tasks/:id
 * @desc Get a specific task
 * @access Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;

  if (!Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  })
    .populate('assignedTo', 'name email phone')
    .populate('assignedBy', 'name email')
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber description')
    .populate('dependencies', 'title status')
    .populate('dependents', 'title status')
    .populate('watchers', 'name email')
    .populate('comments.author', 'name email')
    .populate('timeEntries.user', 'name email')
    .populate('checklist.completedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.json({
    success: true,
    data: task,
    message: 'Task retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/tasks
 * @desc Create a new task
 * @access Private
 */
router.post('/', asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    title,
    titleAr,
    description,
    descriptionAr,
    taskType,
    priority,
    assignedTo,
    dueDate,
    startDate,
    estimatedHours,
    caseId,
    clientId,
    checklist,
    tags,
    dependencies,
    watchers,
    requiresApproval,
    recurring,
    isTemplate,
    templateName,
  } = req.body;

  // Validate required fields
  if (!title || !taskType || !assignedTo) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, taskType, assignedTo',
    });
  }

  // Verify assigned user exists and belongs to law firm
  const assignedUser = await User.findOne({
    _id: assignedTo,
    lawFirmId: user.lawFirmId,
  });

  if (!assignedUser) {
    return res.status(404).json({
      success: false,
      message: 'Assigned user not found or does not belong to your law firm',
    });
  }

  // Validate client if provided
  if (clientId) {
    const client = await Client.findOne({
      _id: clientId,
      lawFirmId: user.lawFirmId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or does not belong to your law firm',
      });
    }
  }

  // Validate case if provided
  if (caseId) {
    const caseData = await Case.findOne({
      _id: caseId,
      lawFirmId: user.lawFirmId
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found or does not belong to your law firm',
      });
    }
  }

  const newTask = new Task({
    title,
    titleAr,
    description,
    descriptionAr,
    taskType,
    priority: priority || TaskPriority.MEDIUM,
    assignedTo,
    assignedBy: user._id,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    estimatedHours,
    caseId,
    clientId,
    lawFirmId: user.lawFirmId,
    checklist: checklist || [],
    tags: tags || [],
    dependencies: dependencies || [],
    watchers: watchers || [],
    requiresApproval: requiresApproval || false,
    recurring,
    isTemplate: isTemplate || false,
    templateName,
    createdBy: user._id,
  });

  const savedTask = await newTask.save();

  // Populate the response
  const populatedTask = await Task.findById(savedTask._id)
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email')
    .populate('clientId', 'name nameAr email')
    .populate('caseId', 'title caseNumber');

  res.status(201).json({
    success: true,
    data: populatedTask,
    message: 'Task created successfully',
  });
}));

/**
 * @route PUT /api/v1/tasks/:id
 * @desc Update a task
 * @access Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;

  if (!Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'titleAr', 'description', 'descriptionAr', 'taskType', 
    'status', 'priority', 'assignedTo', 'dueDate', 'startDate',
    'estimatedHours', 'actualHours', 'caseId', 'clientId', 'checklist',
    'tags', 'dependencies', 'watchers', 'progressPercentage',
    'requiresApproval', 'recurring'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  task.updatedBy = user._id;

  const updatedTask = await task.save();

  // Populate the response
  const populatedTask = await Task.findById(updatedTask._id)
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email')
    .populate('clientId', 'name nameAr email')
    .populate('caseId', 'title caseNumber');

  res.json({
    success: true,
    data: populatedTask,
    message: 'Task updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/tasks/:id
 * @desc Delete/Archive a task
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;
  const { permanent = false } = req.body;

  if (!Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  if (permanent) {
    await Task.findByIdAndDelete(taskId);
    res.json({
      success: true,
      message: 'Task deleted permanently',
    });
  } else {
    // Archive instead of delete
    task.isArchived = true;
    task.archivedAt = new Date();
    task.archivedBy = user._id;
    await task.save();

    res.json({
      success: true,
      message: 'Task archived successfully',
    });
  }
}));

/**
 * @route POST /api/v1/tasks/:id/comments
 * @desc Add a comment to a task
 * @access Private
 */
router.post('/:id/comments', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;
  const { content, isInternal = true } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Comment content is required',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  task.comments.push({
    content,
    author: user._id,
    createdAt: new Date(),
    isInternal,
  });

  await task.save();

  // Populate the new comment
  const populatedTask = await Task.findById(taskId)
    .populate('comments.author', 'name email');

  const newComment = populatedTask!.comments[populatedTask!.comments.length - 1];

  res.json({
    success: true,
    data: newComment,
    message: 'Comment added successfully',
  });
}));

/**
 * @route POST /api/v1/tasks/:id/time
 * @desc Add time entry to a task
 * @access Private
 */
router.post('/:id/time', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;
  const { startTime, endTime, duration, description, billable = true } = req.body;

  if (!startTime) {
    return res.status(400).json({
      success: false,
      message: 'Start time is required',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Calculate duration if not provided
  let calculatedDuration = duration;
  if (!duration && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
  }

  task.timeEntries.push({
    user: user._id,
    startTime: new Date(startTime),
    endTime: endTime ? new Date(endTime) : undefined,
    duration: calculatedDuration,
    description,
    billable,
  });

  // Update actual hours
  const totalMinutes = task.timeEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
  task.actualHours = Math.round((totalMinutes / 60) * 100) / 100;

  await task.save();

  res.json({
    success: true,
    data: task.timeEntries[task.timeEntries.length - 1],
    message: 'Time entry added successfully',
  });
}));

/**
 * @route PUT /api/v1/tasks/:id/status
 * @desc Update task status
 * @access Private
 */
router.put('/:id/status', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;
  const { status, progressPercentage } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  task.status = status;
  if (progressPercentage !== undefined) {
    task.progressPercentage = progressPercentage;
  }

  if (status === TaskStatus.COMPLETED && !task.completedDate) {
    task.completedDate = new Date();
  }

  task.updatedBy = user._id;
  await task.save();

  const populatedTask = await Task.findById(taskId)
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email');

  res.json({
    success: true,
    data: populatedTask,
    message: 'Task status updated successfully',
  });
}));

/**
 * @route POST /api/v1/tasks/:id/checklist
 * @desc Update task checklist
 * @access Private
 */
router.post('/:id/checklist', asyncHandler(async (req, res) => {
  const user = req.user;
  const taskId = req.params.id;
  const { checklist } = req.body;

  if (!Array.isArray(checklist)) {
    return res.status(400).json({
      success: false,
      message: 'Checklist must be an array',
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    lawFirmId: user.lawFirmId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Update checklist items
  checklist.forEach((item: any, index: number) => {
    if (task.checklist[index]) {
      if (item.completed !== task.checklist[index].completed) {
        task.checklist[index].completed = item.completed;
        if (item.completed) {
          task.checklist[index].completedAt = new Date();
          task.checklist[index].completedBy = user._id;
        } else {
          task.checklist[index].completedAt = undefined;
          task.checklist[index].completedBy = undefined;
        }
      }
    }
  });

  await task.save();

  res.json({
    success: true,
    data: task.checklist,
    message: 'Checklist updated successfully',
  });
}));

/**
 * @route GET /api/v1/tasks/templates
 * @desc Get task templates
 * @access Private
 */
router.get('/templates/list', asyncHandler(async (req, res) => {
  const user = req.user;

  const templates = await Task.find({
    lawFirmId: user.lawFirmId,
    isTemplate: true,
    isArchived: false,
  })
    .populate('createdBy', 'name email')
    .sort({ templateName: 1, createdAt: -1 });

  res.json({
    success: true,
    data: templates,
    message: 'Task templates retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/tasks/templates/:id/use
 * @desc Create a task from template
 * @access Private
 */
router.post('/templates/:id/use', asyncHandler(async (req, res) => {
  const user = req.user;
  const templateId = req.params.id;
  const { assignedTo, dueDate, caseId, clientId } = req.body;

  const template = await Task.findOne({
    _id: templateId,
    lawFirmId: user.lawFirmId,
    isTemplate: true,
  });

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found',
    });
  }

  // Create new task from template
  const newTask = new Task({
    ...template.toObject(),
    _id: new Types.ObjectId(),
    assignedTo: assignedTo || template.assignedTo,
    assignedBy: user._id,
    dueDate: dueDate ? new Date(dueDate) : template.dueDate,
    caseId: caseId || template.caseId,
    clientId: clientId || template.clientId,
    status: TaskStatus.TODO,
    progressPercentage: 0,
    isTemplate: false,
    templateName: undefined,
    completedDate: undefined,
    actualHours: undefined,
    timeEntries: [],
    comments: [],
    createdBy: user._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const savedTask = await newTask.save();

  const populatedTask = await Task.findById(savedTask._id)
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email')
    .populate('clientId', 'name nameAr email')
    .populate('caseId', 'title caseNumber');

  res.status(201).json({
    success: true,
    data: populatedTask,
    message: 'Task created from template successfully',
  });
}));

export { router as taskRoutes };

