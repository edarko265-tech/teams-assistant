/**
 * Teams Assistant Backend Server
 * Main entry point for the Express API
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import channelsRouter from './routes/channels';
import chatsRouter from './routes/chats';
import messagesRouter from './routes/messages';
import filesRouter from './routes/files';
import assistantRouter from './routes/assistant';

// Import storage to initialize demo data
import './services/storage';

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================

// Enable CORS for frontend
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// API Routes
// ============================================================

app.use('/api/channels', channelsRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/files', filesRouter);
app.use('/api/assistant', assistantRouter);

// ============================================================
// Health Check & Info Endpoints
// ============================================================

/**
 * GET /
 * Root endpoint with API info
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Teams Assistant API',
    version: '1.0.0',
    description: 'Backend API for Teams Assistant - Microsoft Teams-like chat application',
    endpoints: {
      channels: '/api/channels',
      chats: '/api/chats',
      messages: '/api/messages/:channelOrChatId',
      files: '/api/files/:channelId',
      assistant: '/api/assistant',
    },
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
  });
});

// ============================================================
// Error Handling
// ============================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           🚀 Teams Assistant Backend Started             ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Server running on: http://localhost:${PORT}               ║`);
  console.log(`║  OpenAI Status:     ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}                  ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  API Endpoints:                                          ║');
  console.log('║    GET  /api/channels          - List all channels       ║');
  console.log('║    GET  /api/channels/:id      - Get channel details     ║');
  console.log('║    POST /api/channels/:id/toggle-assistant               ║');
  console.log('║    GET  /api/chats             - List user chats         ║');
  console.log('║    GET  /api/chats/:id         - Get chat details        ║');
  console.log('║    GET  /api/messages/:id      - Get messages            ║');
  console.log('║    POST /api/messages/:id      - Send message            ║');
  console.log('║    GET  /api/files/:channelId  - Get channel files       ║');
  console.log('║    POST /api/files/:channelId  - Upload file             ║');
  console.log('║    POST /api/assistant/ask     - Ask AI assistant        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
