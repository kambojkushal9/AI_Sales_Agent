import { Router } from 'express';
import { Call } from '../models';
import { config } from '../config';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { geminiService } from '../services/gemini';
import { demoCalls } from '../utils/demoData';

const router = Router();
router.use(optionalAuth);

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.query as Record<string, string>;

  if (!config.dbConnected) {
    let calls = [...demoCalls];
    if (status && status !== 'all') calls = calls.filter((c) => c.status === status);
    return res.json({ success: true, calls });
  }

  const query: Record<string, any> = { userId: req.user!.id };
  if (status && status !== 'all') query.status = status;

  const calls = await Call.find(query).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, calls });
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const call = demoCalls.find((c) => c._id === req.params.id);
    if (!call) throw new AppError('Call not found', 404);
    return res.json({ success: true, call });
  }

  const call = await Call.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!call) throw new AppError('Call not found', 404);
  res.json({ success: true, call });
}));

router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { customerName, customerPhone, language = 'en', transcript = [], duration = 0, status = 'active' } = req.body;
  if (!customerName) throw new AppError('Customer name is required', 400);

  if (!config.dbConnected) {
    const newCall = {
      _id: `call-${Date.now()}`,
      customerName,
      customerPhone,
      duration,
      status,
      sentiment: req.body.sentiment || 'neutral',
      buyingIntent: req.body.buyingIntent || 'medium',
      leadScore: req.body.leadScore || 50,
      outcome: req.body.outcome || 'In progress',
      transcript,
      language,
      conversationStage: req.body.conversationStage || 'Introduction',
      createdAt: new Date().toISOString(),
    };
    demoCalls.unshift(newCall);
    return res.status(201).json({ success: true, call: newCall });
  }

  const call = await Call.create({
    userId: req.user!.id,
    customerName,
    customerPhone,
    duration,
    status,
    sentiment: req.body.sentiment || 'neutral',
    buyingIntent: req.body.buyingIntent || 'medium',
    leadScore: req.body.leadScore || 50,
    outcome: req.body.outcome || 'In progress',
    transcript,
    language,
    conversationStage: req.body.conversationStage || 'Introduction',
  });

  res.status(201).json({ success: true, call });
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    const idx = demoCalls.findIndex((c) => c._id === req.params.id);
    if (idx === -1) throw new AppError('Call not found', 404);
    demoCalls[idx] = { ...demoCalls[idx], ...req.body };
    return res.json({ success: true, call: demoCalls[idx] });
  }

  const call = await Call.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    req.body,
    { new: true }
  );
  if (!call) throw new AppError('Call not found', 404);
  res.json({ success: true, call });
}));

router.post('/:id/summarize', asyncHandler(async (req: AuthRequest, res) => {
  let call: any;
  if (!config.dbConnected) {
    call = demoCalls.find((c) => c._id === req.params.id);
  } else {
    call = await Call.findOne({ _id: req.params.id, userId: req.user!.id });
  }

  if (!call) throw new AppError('Call not found', 404);

  const transcriptText = (call.transcript || [])
    .map((t: any) => `${t.role}: ${t.content}`)
    .join('\n') || `Sales call with ${call.customerName}, outcome: ${call.outcome || 'completed'}`;

  const prompt = `Summarize this sales call transcript into structured JSON with keys:
{
  "summary": string,
  "painPoints": string[],
  "objections": string[],
  "buyingSignals": string[],
  "nextAction": string,
  "sentiment": "positive" | "neutral" | "negative",
  "buyingIntent": "high" | "medium" | "low"
}

Transcript:
${transcriptText}`;

  const summary = await geminiService.structuredOutput<Record<string, any>>(
    prompt,
    'You are a sales call analyst. Return valid JSON only.'
  );

  call.summary = summary;
  if (config.dbConnected && typeof call.save === 'function') {
    await call.save();
  }

  res.json({ success: true, summary, call });
}));

export default router;
