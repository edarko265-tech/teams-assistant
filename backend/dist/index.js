"use strict";
/**
 * Teams Assistant Backend Server
 * Main entry point for the Express API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const channels_1 = __importDefault(require("./routes/channels"));
const chats_1 = __importDefault(require("./routes/chats"));
const messages_1 = __importDefault(require("./routes/messages"));
const files_1 = __importDefault(require("./routes/files"));
const assistant_1 = __importDefault(require("./routes/assistant"));
// Import Supabase initialization
const supabase_1 = require("./services/supabase");
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// ============================================================
// Middleware
// ============================================================
// Enable CORS for frontend
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));
// Parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
// Request logging middleware
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});
// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', auth_1.default);
app.use('/api/channels', channels_1.default);
app.use('/api/chats', chats_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/files', files_1.default);
app.use('/api/assistant', assistant_1.default);
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ============================================================
// Health Check & Info Endpoints
// ============================================================
/**
 * GET /
 * Root endpoint with API info
 */
app.get('/', (_req, res) => {
    res.json({
        name: 'Teams Assistant API',
        version: '2.0.0',
        description: 'Backend API for Teams Assistant - Microsoft Teams-like chat application with Supabase',
        endpoints: {
            auth: '/api/auth',
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
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
        supabase: process.env.SUPABASE_URL ? 'configured' : 'not configured',
    });
});
// ============================================================
// Error Handling
// ============================================================
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});
// ============================================================
// Start Server
// ============================================================
async function startServer() {
    // Initialize database connection
    await (0, supabase_1.initializeDatabase)();
    app.listen(PORT, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║           🚀 Teams Assistant Backend Started             ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log(`║  Server running on: http://localhost:${PORT}               ║`);
        console.log(`║  OpenAI Status:     ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}                  ║`);
        console.log(`║  Supabase Status:   ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}                  ║`);
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║  API Endpoints:                                          ║');
        console.log('║    POST /api/auth/signup       - Register new user       ║');
        console.log('║    POST /api/auth/signin       - Sign in                 ║');
        console.log('║    GET  /api/auth/me           - Get current user        ║');
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
}
startServer().catch(console.error);
//# sourceMappingURL=index.js.map