import { Router } from 'express';
import { AgentConfig } from '../models';
import { config } from '../config';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { geminiService } from '../services/gemini';
import { initializeAgentSession, processAgentMessage } from '../services/agentOrchestrator';
import { demoAgentConfig } from '../utils/demoData';

const router = Router();
router.use(optionalAuth);

let inMemoryConfig = { ...demoAgentConfig };

router.post('/initialize', asyncHandler(async (req: AuthRequest, res) => {
  const sessionId = req.body.sessionId || `session-${Date.now()}`;
  const language = req.body.language || 'en';
  const data = await initializeAgentSession(sessionId, req.user!.id, language);
  res.json({
    success: true,
    ...data,
    geminiAvailable: geminiService.available,
    model: geminiService.currentModel,
  });
}));

router.post('/chat', asyncHandler(async (req: AuthRequest, res) => {
  const { message, sessionId, language = 'en' } = req.body;
  if (!message || !sessionId) {
    throw new AppError('message and sessionId are required', 400);
  }

  const result = await processAgentMessage({
    sessionId,
    userId: req.user!.id,
    message,
    language,
  });

  res.json({
    success: true,
    ...result,
    geminiAvailable: geminiService.available,
  });
}));

router.get('/config', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    return res.json({
      success: true,
      config: inMemoryConfig,
      geminiAvailable: geminiService.available,
      model: geminiService.currentModel,
      isDemoMode: !geminiService.available,
    });
  }

  let agentCfg: any = await AgentConfig.findOne({ userId: req.user!.id }).lean();
  if (!agentCfg) {
    agentCfg = await AgentConfig.create({
      userId: req.user!.id,
      ...demoAgentConfig,
    });
  }

  res.json({
    success: true,
    config: agentCfg,
    geminiAvailable: geminiService.available,
    model: geminiService.currentModel,
    isDemoMode: !geminiService.available,
  });
}));

router.put('/config', asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected) {
    inMemoryConfig = { ...inMemoryConfig, ...req.body };
    return res.json({ success: true, config: inMemoryConfig });
  }

  const agentCfg = await AgentConfig.findOneAndUpdate(
    { userId: req.user!.id },
    { ...req.body, userId: req.user!.id },
    { new: true, upsert: true }
  );
  res.json({ success: true, config: agentCfg });
}));

router.post('/voice/session', asyncHandler(async (req: AuthRequest, res) => {
  const sessionId = req.body.sessionId || `voice-${Date.now()}`;
  const language = req.body.language || 'en';
  const initData = await initializeAgentSession(sessionId, req.user!.id, language);
  res.json({
    success: true,
    ...initData,
    voiceMode: geminiService.available ? 'gemini-assisted-web-speech' : 'demo-web-speech',
    liveModel: config.geminiLiveModel,
    geminiAvailable: geminiService.available,
  });
}));

export default router;
