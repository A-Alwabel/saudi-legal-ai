import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Appointment, AppointmentType, AppointmentStatus, AppointmentPriority } from '../models/Appointment';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { Case } from '../models/Case';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all appointment routes
router.use(protect);

/**
 * @route GET /api/v1/appointments
 * @desc Get all appointments for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    appointmentType, 
    priority,
    assignedLawyerId,
    clientId,
    caseId,
    startDate,
    endDate,
    view = 'list' // list, calendar, today, week, month
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };

  if (status) filter.status = status;
  if (appointmentType) filter.appointmentType = appointmentType;
  if (priority) filter.priority = priority;
  if (assignedLawyerId) filter.assignedLawyerId = assignedLawyerId;
  if (clientId) filter.clientId = clientId;
  if (caseId) filter.caseId = caseId;

  // Date filtering
  if (startDate || endDate) {
    filter.startDateTime = {};
    if (startDate) filter.startDateTime.$gte = new Date(startDate as string);
    if (endDate) filter.startDateTime.$lte = new Date(endDate as string);
  }

  // View-specific filtering
  const now = new Date();
  switch (view) {
    case 'today':
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      filter.startDateTime = { $gte: todayStart, $lt: todayEnd };
      break;
    case 'week':
      const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      filter.startDateTime = { $gte: weekStart, $lt: weekEnd };
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      filter.startDateTime = { $gte: monthStart, $lt: monthEnd };
      break;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('assignedLawyerId', 'name email')
      .populate('clientId', 'name nameAr email phone')
      .populate('caseId', 'title caseNumber')
      .populate('organizer', 'name email')
      .populate('attendees', 'name email')
      .sort({ startDateTime: 1 })
      .skip(view === 'calendar' ? 0 : skip)
      .limit(view === 'calendar' ? 0 : limitNum),
    Appointment.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: appointments,
    pagination: view === 'calendar' ? undefined : {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Appointments retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/appointments/:id
 * @desc Get a specific appointment
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const appointmentId = req.params.id;

  if (!Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid appointment ID format',
    });
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    lawFirmId: user.lawFirmId
  })
    .populate('assignedLawyerId', 'name email phone')
    .populate('clientId', 'name nameAr email phone address')
    .populate('caseId', 'title caseNumber description')
    .populate('organizer', 'name email')
    .populate('attendees', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  res.json({
    success: true,
    data: appointment,
    message: 'Appointment retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/appointments
 * @desc Create a new appointment
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const {
    title,
    titleAr,
    description,
    descriptionAr,
    appointmentType,
    priority,
    startDateTime,
    endDateTime,
    duration,
    timezone,
    assignedLawyerId,
    clientId,
    attendees,
    location,
    caseId,
    reminders,
    recurring,
    notes,
    isPrivate,
    allowClientReschedule,
  } = req.body;

  // Validate required fields
  if (!title || !appointmentType || !startDateTime || !endDateTime || !assignedLawyerId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, appointmentType, startDateTime, endDateTime, assignedLawyerId',
    });
  }

  // Validate dates
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  
  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'End date/time must be after start date/time',
    });
  }

  // Check if assigned lawyer exists and belongs to law firm
  const assignedLawyer = await User.findOne({
    _id: assignedLawyerId,
    lawFirmId: user.lawFirmId,
    role: { $in: ['lawyer', 'admin'] }
  });

  if (!assignedLawyer) {
    return res.status(404).json({
      success: false,
      message: 'Assigned lawyer not found or does not belong to your law firm',
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

  // Check for scheduling conflicts
  const conflictingAppointments = await Appointment.find({
    lawFirmId: user.lawFirmId,
    assignedLawyerId,
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      {
        startDateTime: { $lt: end },
        endDateTime: { $gt: start }
      }
    ]
  });

  if (conflictingAppointments.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Scheduling conflict detected. The lawyer has another appointment during this time.',
      conflicts: conflictingAppointments.map(apt => ({
        id: apt._id,
        title: apt.title,
        startDateTime: apt.startDateTime,
        endDateTime: apt.endDateTime
      }))
    });
  }

  // Calculate duration if not provided
  const calculatedDuration = duration || Math.round((end.getTime() - start.getTime()) / (1000 * 60));

  const newAppointment = new Appointment({
    title,
    titleAr,
    description,
    descriptionAr,
    appointmentType,
    priority: priority || AppointmentPriority.MEDIUM,
    startDateTime: start,
    endDateTime: end,
    duration: calculatedDuration,
    timezone: timezone || 'Asia/Riyadh',
    organizer: user._id,
    assignedLawyerId,
    clientId,
    attendees: attendees || [],
    location,
    caseId,
    lawFirmId: user.lawFirmId,
    reminders: reminders || [
      { type: 'notification', minutesBefore: 15, sent: false },
      { type: 'email', minutesBefore: 60, sent: false }
    ],
    recurring,
    notes,
    isPrivate: isPrivate || false,
    allowClientReschedule: allowClientReschedule !== undefined ? allowClientReschedule : true,
    createdBy: user._id,
  });

  const savedAppointment = await newAppointment.save();

  // Populate the response
  const populatedAppointment = await Appointment.findById(savedAppointment._id)
    .populate('assignedLawyerId', 'name email')
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber')
    .populate('organizer', 'name email');

  res.status(201).json({
    success: true,
    data: populatedAppointment,
    message: 'Appointment created successfully',
  });
}));

/**
 * @route PUT /api/v1/appointments/:id
 * @desc Update an appointment
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const appointmentId = req.params.id;

  if (!Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid appointment ID format',
    });
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    lawFirmId: user.lawFirmId
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'titleAr', 'description', 'descriptionAr', 'appointmentType', 
    'priority', 'startDateTime', 'endDateTime', 'duration', 'timezone',
    'assignedLawyerId', 'clientId', 'attendees', 'location', 'caseId',
    'reminders', 'notes', 'isPrivate', 'allowClientReschedule', 'status'
  ];

  // Check if dates are being updated and validate
  if (req.body.startDateTime || req.body.endDateTime) {
    const start = new Date(req.body.startDateTime || appointment.startDateTime);
    const end = new Date(req.body.endDateTime || appointment.endDateTime);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date/time must be after start date/time',
      });
    }

    // Check for conflicts if times are changing
    if (req.body.startDateTime || req.body.endDateTime || req.body.assignedLawyerId) {
      const conflictingAppointments = await Appointment.find({
        _id: { $ne: appointmentId },
        lawFirmId: user.lawFirmId,
        assignedLawyerId: req.body.assignedLawyerId || appointment.assignedLawyerId,
        status: { $nin: ['cancelled', 'completed'] },
        $or: [
          {
            startDateTime: { $lt: end },
            endDateTime: { $gt: start }
          }
        ]
      });

      if (conflictingAppointments.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Scheduling conflict detected.',
          conflicts: conflictingAppointments.map(apt => ({
            id: apt._id,
            title: apt.title,
            startDateTime: apt.startDateTime,
            endDateTime: apt.endDateTime
          }))
        });
      }
    }
  }

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      appointment[field] = req.body[field];
    }
  });

  appointment.updatedBy = user._id;

  const updatedAppointment = await appointment.save();

  // Populate the response
  const populatedAppointment = await Appointment.findById(updatedAppointment._id)
    .populate('assignedLawyerId', 'name email')
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber');

  res.json({
    success: true,
    data: populatedAppointment,
    message: 'Appointment updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/appointments/:id
 * @desc Delete/Cancel an appointment
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const { reason } = req.body;

  if (!Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid appointment ID format',
    });
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    lawFirmId: user.lawFirmId
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Mark as cancelled instead of deleting
  appointment.status = AppointmentStatus.CANCELLED;
  appointment.cancelledBy = user._id;
  appointment.cancelledAt = new Date();
  appointment.cancellationReason = reason || 'Cancelled by user';

  await appointment.save();

  res.json({
    success: true,
    message: 'Appointment cancelled successfully',
  });
}));

/**
 * @route GET /api/v1/appointments/availability/:lawyerId
 * @desc Check lawyer availability for a given date range
 * @access Private
 */
router.get('/availability/:lawyerId', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { lawyerId } = req.params;
  const { startDate, endDate, duration = 60 } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required',
    });
  }

  // Get existing appointments for the lawyer
  const existingAppointments = await Appointment.find({
    lawFirmId: user.lawFirmId,
    assignedLawyerId: lawyerId,
    status: { $nin: ['cancelled', 'completed'] },
    startDateTime: { $gte: new Date(startDate as string) },
    endDateTime: { $lte: new Date(endDate as string) }
  }).sort({ startDateTime: 1 });

  // Generate available time slots (simplified - you can enhance this)
  const availableSlots = [];
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  const slotDuration = parseInt(duration as string);

  // Business hours: 9 AM to 5 PM
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    if (day.getDay() === 5 || day.getDay() === 6) continue; // Skip weekends

    const dayStart = new Date(day);
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(17, 0, 0, 0);

    for (let time = new Date(dayStart); time < dayEnd; time.setMinutes(time.getMinutes() + slotDuration)) {
      const slotEnd = new Date(time.getTime() + slotDuration * 60000);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(apt => 
        (time >= apt.startDateTime && time < apt.endDateTime) ||
        (slotEnd > apt.startDateTime && slotEnd <= apt.endDateTime) ||
        (time <= apt.startDateTime && slotEnd >= apt.endDateTime)
      );

      if (!hasConflict) {
        availableSlots.push({
          startDateTime: new Date(time),
          endDateTime: new Date(slotEnd),
          duration: slotDuration
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      availableSlots,
      existingAppointments: existingAppointments.map(apt => ({
        id: apt._id,
        title: apt.title,
        startDateTime: apt.startDateTime,
        endDateTime: apt.endDateTime
      }))
    },
    message: 'Availability retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/appointments/:id/reschedule
 * @desc Reschedule an appointment
 * @access Private
 */
router.post('/:id/reschedule', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const { newStartDateTime, newEndDateTime, reason } = req.body;

  if (!newStartDateTime || !newEndDateTime) {
    return res.status(400).json({
      success: false,
      message: 'New start and end date/time are required',
    });
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    lawFirmId: user.lawFirmId
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Create new appointment with new times
  const rescheduledAppointment = new Appointment({
    ...appointment.toObject(),
    _id: new Types.ObjectId(),
    startDateTime: new Date(newStartDateTime),
    endDateTime: new Date(newEndDateTime),
    status: AppointmentStatus.SCHEDULED,
    notes: `${appointment.notes || ''}\n\nRescheduled from ${appointment.startDateTime} - ${appointment.endDateTime}. Reason: ${reason || 'No reason provided'}`.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Mark original as rescheduled
  appointment.status = AppointmentStatus.RESCHEDULED;
  appointment.notes = `${appointment.notes || ''}\n\nRescheduled to ${newStartDateTime} - ${newEndDateTime}. Reason: ${reason || 'No reason provided'}`.trim();

  await Promise.all([
    appointment.save(),
    rescheduledAppointment.save()
  ]);

  const populatedAppointment = await Appointment.findById(rescheduledAppointment._id)
    .populate('assignedLawyerId', 'name email')
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber');

  res.json({
    success: true,
    data: populatedAppointment,
    message: 'Appointment rescheduled successfully',
  });
}));

export { router as appointmentRoutes };

