"use strict";
/**
 * Assistant API Routes
 * Handles AI assistant queries for channels (NOT available for individual chats)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../services/supabase");
const openai_1 = require("../services/openai");
const router = (0, express_1.Router)();
// Assistant user ID (stored in database)
const ASSISTANT_USER_ID = 'assistant';
/**
 * POST /api/assistant/ask
 * Ask the AI assistant a question
 * Body: { question: string, channelId: string, userId: string }
 *
 * IMPORTANT: The assistant is ONLY available in channels, NOT in individual chats
 */
router.post('/ask', async (req, res) => {
    try {
        const { question, channelId, userId } = req.body;
        // Validate request
        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Question is required',
            });
        }
        if (!channelId) {
            return res.status(400).json({
                success: false,
                error: 'Channel ID is required',
            });
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required',
            });
        }
        // Check if OpenAI is configured
        if (!(0, openai_1.isConfigured)()) {
            return res.status(503).json({
                success: false,
                error: 'AI Assistant is not configured. Please set OPENAI_API_KEY environment variable.',
            });
        }
        // Get the channel
        const channel = await (0, supabase_1.getChannel)(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                error: 'Channel not found',
            });
        }
        // Check if assistant is enabled for this channel
        if (!channel.assistantEnabled) {
            return res.status(423).json({
                success: false,
                error: 'Assistant is disabled in this channel',
            });
        }
        // Verify the user exists
        const user = await (0, supabase_1.getUser)(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        console.log(`🤖 Assistant query from ${user.name} in ${channel.name}: "${question}"`);
        // Get context: last 20 messages and all files
        const allMessages = await (0, supabase_1.getMessagesForChannel)(channelId);
        const recentMessages = allMessages.slice(-20);
        const channelFiles = await (0, supabase_1.getFilesForChannel)(channelId);
        // Build context for RAG (only use files with content)
        const textFiles = channelFiles
            .filter((f) => typeof f.content === 'string' && f.content.length > 0)
            .map((f) => ({ name: f.name, content: f.content }));
        const context = (0, openai_1.buildContext)(recentMessages, textFiles, channel.members);
        // Create system prompt
        const systemPrompt = (0, openai_1.createChannelAssistantPrompt)(channel.name);
        // Call OpenAI
        const response = await (0, openai_1.chat)(systemPrompt, question, context);
        // Create assistant message in database
        const assistantMessage = await (0, supabase_1.addMessage)(response, ASSISTANT_USER_ID, {
            channelId,
            isAssistant: true,
        });
        if (!assistantMessage) {
            return res.status(500).json({
                success: false,
                error: 'Failed to save assistant response',
            });
        }
        console.log(`✅ Assistant responded in ${channel.name}`);
        res.json({ success: true, data: assistantMessage });
    }
    catch (error) {
        console.error('❌ Error in assistant:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to get assistant response';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
});
/**
 * GET /api/assistant/status
 * Check if the AI assistant is configured and available
 */
router.get('/status', (_req, res) => {
    const configured = (0, openai_1.isConfigured)();
    res.json({
        success: true,
        data: {
            configured,
            message: configured
                ? 'AI Assistant is ready'
                : 'AI Assistant is not configured. Please set OPENAI_API_KEY.',
        },
    });
});
exports.default = router;
//# sourceMappingURL=assistant.js.map