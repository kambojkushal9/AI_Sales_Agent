import { Router } from 'express';
import { Appointment, Lead } from '../models';
import { config } from '../config';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { demoAppointments } from '../utils/demoData';

const router = Router();
router.use(optionalAuth);

const ALL_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    return res.json({ success: true, appointments: demoAppointments });
  }
  const appointments = await Appointment.find({ userId: req.user!.id }).sort({ date: 1 }).lean();
  res.json({ success: true, appointments });
}));

router.get('/availability', asyncHandler(async (req: AuthRequest, res) => {
  const { date } = req.query as { date?: string };
  if (!date) throw new AppError('Date query parameter is required (YYYY-MM-DD)', 400);

  let bookedSlots: string[] = [];
  if (!config.dbConnected) {
    bookedSlots = demoAppointments
      .filter((a) => String(a.date).startsWith(date) && a.status !== 'cancelled')
      .map((a) => a.startTime);
  } else {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    const existing = await Appointment.find({
      userId: req.user!.id,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    }).lean();
    bookedSlots = existing.map((a) => a.startTime);
  }

  const availableSlots = ALL_SLOTS.filter((s) => !bookedSlots.includes(s));
  res.json({ success: true, date, availableSlots, bookedSlots });
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { customerName, customerEmail, customerPhone, date, startTime, duration = 30, title, meetingType = 'demo', notes } = req.body;
  if (!customerName || !date || !startTime) {
    throw new AppError('customerName, date, and startTime are required', 400);
  }

  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + Number(duration);
  const endTime = `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
  const dateKey = String(date).split('T')[0];

  if (!config.dbConnected) {
    const conflict = demoAppointments.find(
      (a) => String(a.date).startsWith(dateKey) && a.startTime === startTime && a.status !== 'cancelled'
    );
    if (conflict) throw new AppError('This time slot is already booked', 409);

    const apt = {
      _id: `apt-${Date.now()}`,
      leadId: req.body.leadId || 'lead-1',
      title: title || `${meetingType.toUpperCase()} - ${customerName}`,
      customerName,
      customerEmail,
      customerPhone,
      date: new Date(date).toISOString(),
      startTime,
      endTime,
      duration: Number(duration),
      status: 'scheduled',
      meetingType,
      notes,
      createdByAgent: Boolean(req.body.createdByAgent),
      createdAt: new Date().toISOString(),
    };
    demoAppointments.unshift(apt);
    return res.status(201).json({ success: true, appointment: apt });
  }

  const startOfDay = new Date(`${dateKey}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateKey}T23:59:59.999Z`);
  const conflict = await Appointment.findOne({
    userId: req.user!.id,
    date: { $gte: startOfDay, $lte: endOfDay },
    startTime,
    status: { $ne: 'cancelled' },
  });
  if (conflict) throw new AppError('This time slot is already booked', 409);

  let leadId = req.body.leadId;
  if (!leadId) {
    const existingLead = await Lead.findOne({ userId: req.user!.id });
    if (existingLead) {
      leadId = existingLead._id;
    } else {
      const newLead = await Lead.create({
        userId: req.user!.id,
        name: customerName,
        email: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@prospect.ai`,
        phone: customerPhone,
      });
      leadId = newLead._id;
    }
  }

  const appointment = await Appointment.create({
    leadId,
    userId: req.user!.id,
    title: title || `${meetingType.toUpperCase()} - ${customerName}`,
    customerName,
    customerEmail,
    customerPhone,
    date: new Date(date),
    startTime,
    endTime,
    duration: Number(duration),
    status: 'scheduled',
    meetingType,
    notes,
    createdByAgent: Boolean(req.body.createdByAgent),
  });

  res.status(201).json({ success: true, appointment });
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const idx = demoAppointments.findIndex((a) => a._id === req.params.id);
    if (idx === -1) throw new AppError('Appointment not found', 404);
    demoAppointments[idx] = { ...demoAppointments[idx], ...req.body };
    return res.json({ success: true, appointment: demoAppointments[idx] });
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    req.body,
    { new: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);
  res.json({ success: true, appointment });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const idx = demoAppointments.findIndex((a) => a._id === req.params.id);
    if (idx === -1) throw new AppError('Appointment not found', 404);
    demoAppointments[idx].status = 'cancelled';
    return res.json({ success: true, message: 'Appointment cancelled' });
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { status: 'cancelled' },
    { new: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);
  res.json({ success: true, message: 'Appointment cancelled' });
}));

export default router;
