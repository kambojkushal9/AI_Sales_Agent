import { Router } from 'express';
import { Lead, Call, Appointment } from '../models';
import { config } from '../config';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { geminiService } from '../services/gemini';
import { demoLeads, demoCalls, demoAppointments } from '../utils/demoData';

const router = Router();
router.use(optionalAuth);

router.get('/dashboard', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const qualifiedLeads = demoLeads.filter((l) => ['qualified', 'proposal', 'converted'].includes(l.status)).length;
    const converted = demoLeads.filter((l) => l.status === 'converted').length;
    return res.json({
      success: true,
      stats: {
        totalCalls: 847 + demoCalls.length,
        totalLeads: 316 + demoLeads.length,
        qualifiedLeads: 150 + qualifiedLeads,
        conversionRate: 23.4,
        appointmentsBooked: 86 + demoAppointments.length,
        avgCallDuration: 285,
        revenuePipeline: 4250000,
        convertedCount: converted,
      },
    });
  }

  const userId = req.user!.id;
  const [totalCalls, totalLeads, qualifiedLeads, convertedLeads, appointmentsBooked, calls] = await Promise.all([
    Call.countDocuments({ userId }),
    Lead.countDocuments({ userId }),
    Lead.countDocuments({ userId, status: { $in: ['qualified', 'proposal', 'converted'] } }),
    Lead.countDocuments({ userId, status: 'converted' }),
    Appointment.countDocuments({ userId, status: { $ne: 'cancelled' } }),
    Call.find({ userId }).select('duration').lean(),
  ]);

  const avgCallDuration = calls.length
    ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length)
    : 0;
  const conversionRate = totalLeads ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

  res.json({
    success: true,
    stats: {
      totalCalls,
      totalLeads,
      qualifiedLeads,
      conversionRate,
      appointmentsBooked,
      avgCallDuration,
      revenuePipeline: qualifiedLeads * 250000,
    },
  });
}));

router.get('/calls', asyncHandler(async (_req: AuthRequest, res) => {
  const activity = [
    { date: 'Mon', calls: 32, qualified: 12 },
    { date: 'Tue', calls: 45, qualified: 18 },
    { date: 'Wed', calls: 38, qualified: 15 },
    { date: 'Thu', calls: 52, qualified: 22 },
    { date: 'Fri', calls: 41, qualified: 16 },
    { date: 'Sat', calls: 18, qualified: 7 },
    { date: 'Sun', calls: 12, qualified: 5 },
  ];
  res.json({ success: true, activity });
}));

router.get('/leads', asyncHandler(async (_req: AuthRequest, res) => {
  const funnel = [
    { stage: 'Total Leads', count: 324, percentage: 100 },
    { stage: 'Contacted', count: 245, percentage: 75.6 },
    { stage: 'Qualified', count: 156, percentage: 48.1 },
    { stage: 'Proposal', count: 89, percentage: 27.5 },
    { stage: 'Converted', count: 76, percentage: 23.4 },
  ];
  res.json({ success: true, funnel });
}));

router.get('/sentiment', asyncHandler(async (_req: AuthRequest, res) => {
  const sentiment = [
    { name: 'Positive', value: 58, color: '#10B981' },
    { name: 'Neutral', value: 28, color: '#F59E0B' },
    { name: 'Negative', value: 14, color: '#EF4444' },
  ];
  res.json({ success: true, sentiment });
}));

router.post('/insights', asyncHandler(async (req: AuthRequest, res) => {
  const leads = config.dbConnected ? await Lead.find({ userId: req.user!.id }).limit(20).lean() : demoLeads;
  const calls = config.dbConnected ? await Call.find({ userId: req.user!.id }).limit(20).lean() : demoCalls;

  const prompt = `Analyze these real CRM leads and sales calls and generate actionable business insights in JSON format:
{
  "salesPerformance": string,
  "painPoints": string[],
  "suggestions": string[],
  "recommendedActions": string[]
}

Leads summary: ${JSON.stringify(leads.map((l: any) => ({ name: l.name, status: l.status, score: l.leadScore, sentiment: l.sentiment, requirements: l.requirements })))}
Calls summary: ${JSON.stringify(calls.map((c: any) => ({ customer: c.customerName, outcome: c.outcome, sentiment: c.sentiment, duration: c.duration })))}`;

  const insights = await geminiService.structuredOutput<{
    salesPerformance: string;
    painPoints: string[];
    suggestions: string[];
    recommendedActions: string[];
  }>(prompt, 'You are a Chief Revenue Officer analyzing sales pipeline data. Return valid JSON.');

  res.json({ success: true, insights });
}));

export default router;
