import http from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';
import { globalErrorHandler } from './middleware/errorHandler';
import { geminiService } from './services/gemini';
import { seedDatabaseIfEmpty } from './utils/seed';

import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import callsRoutes from './routes/calls';
import appointmentsRoutes from './routes/appointments';
import knowledgeRoutes from './routes/knowledge';
import analyticsRoutes from './routes/analytics';
import agentRoutes from './routes/agent';

const app = express();
const server = http.createServer(app);

// CORS & Body parsing
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'online',
    dbConnected: config.dbConnected,
    geminiAvailable: geminiService.available,
    model: geminiService.currentModel,
    mode: config.dbConnected && geminiService.available ? 'production' : 'hybrid-demo',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agent', agentRoutes);

// Global error handler
app.use(globalErrorHandler);

// WebSocket server for real-time voice/agent events
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', geminiAvailable: geminiService.available }));
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch {
      // ignore malformed frames
    }
  });
});

async function startServer() {
  try {
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 3000 });
    config.dbConnected = true;
    console.log('✅ Connected to MongoDB');
    await seedDatabaseIfEmpty();
  } catch (err: any) {
    config.dbConnected = false;
    console.warn(`⚠️  MongoDB unavailable (${err.message}). Running with in-memory Demo Store.`);
  }

  server.listen(config.port, () => {
    console.log(`🚀 EchoSales AI Server running on http://localhost:${config.port}`);
    console.log(`   Gemini AI: ${geminiService.available ? 'Active (' + geminiService.currentModel + ')' : 'Demo Fallback'}`);
    console.log(`   Database:  ${config.dbConnected ? 'MongoDB Connected' : 'In-Memory Demo Mode'}`);
  });
}

process.on('SIGINT', async () => {
  if (config.dbConnected) await mongoose.disconnect();
  server.close(() => process.exit(0));
});

startServer();
