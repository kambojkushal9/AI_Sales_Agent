import { Router } from 'express';
import { Lead, Call } from '../models';
import { config } from '../config';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { demoLeads, demoCalls } from '../utils/demoData';

const router = Router();
router.use(optionalAuth);

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { status, search, sort = '-createdAt', page = '1', limit = '50' } = req.query as Record<string, string>;

  if (!config.dbConnected) {
    let filtered = [...demoLeads];
    if (status && status !== 'all') {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.email || '').toLowerCase().includes(q) ||
          (l.company || '').toLowerCase().includes(q)
      );
    }
    if (sort === 'leadScore' || sort === '-leadScore') {
      filtered.sort((a, b) => (sort.startsWith('-') ? b.leadScore - a.leadScore : a.leadScore - b.leadScore));
    }
    return res.json({ success: true, leads: filtered, total: filtered.length });
  }

  const query: Record<string, any> = { userId: req.user!.id };
  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(query),
  ]);

  res.json({ success: true, leads, total });
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const lead = demoLeads.find((l) => l._id === req.params.id);
    if (!lead) throw new AppError('Lead not found', 404);
    return res.json({ success: true, lead });
  }
  const lead = await Lead.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!lead) throw new AppError('Lead not found', 404);
  res.json({ success: true, lead });
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { name, email, phone, company, industry, budget, requirements, purchaseTimeline, status, notes } = req.body;
  if (!name) throw new AppError('Lead name is required', 400);

  if (!config.dbConnected) {
    const newLead = {
      _id: `lead-${Date.now()}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone,
      company,
      industry,
      budget,
      requirements,
      purchaseTimeline,
      leadScore: req.body.leadScore ?? 50,
      sentiment: req.body.sentiment || 'neutral',
      buyingIntent: req.body.buyingIntent || 'medium',
      status: status || 'new',
      notes,
      source: req.body.source || 'Manual Entry',
      lastInteraction: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    demoLeads.unshift(newLead);
    return res.status(201).json({ success: true, lead: newLead });
  }

  const lead = await Lead.create({
    userId: req.user!.id,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@prospect.ai`,
    phone,
    company,
    industry,
    budget,
    requirements,
    purchaseTimeline,
    leadScore: req.body.leadScore ?? 50,
    sentiment: req.body.sentiment || 'neutral',
    buyingIntent: req.body.buyingIntent || 'medium',
    status: status || 'new',
    notes,
    source: req.body.source || 'Manual Entry',
    lastInteraction: new Date(),
  });

  res.status(201).json({ success: true, lead });
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const idx = demoLeads.findIndex((l) => l._id === req.params.id);
    if (idx === -1) throw new AppError('Lead not found', 404);
    demoLeads[idx] = { ...demoLeads[idx], ...req.body, updatedAt: new Date().toISOString() };
    return res.json({ success: true, lead: demoLeads[idx] });
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { ...req.body, lastInteraction: new Date() },
    { new: true, runValidators: true }
  );
  if (!lead) throw new AppError('Lead not found', 404);
  res.json({ success: true, lead });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const idx = demoLeads.findIndex((l) => l._id === req.params.id);
    if (idx === -1) throw new AppError('Lead not found', 404);
    demoLeads.splice(idx, 1);
    return res.json({ success: true, message: 'Lead deleted' });
  }

  const lead = await Lead.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!lead) throw new AppError('Lead not found', 404);
  res.json({ success: true, message: 'Lead deleted' });
}));

router.get('/:id/history', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const calls = demoCalls.filter((c) => c.leadId === req.params.id);
    return res.json({ success: true, calls });
  }
  const calls = await Call.find({ leadId: req.params.id, userId: req.user!.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, calls });
}));

export default router;
