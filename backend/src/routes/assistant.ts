/**
 * Assistant API Routes
 * Handles AI assistant queries for channels (NOT available for individual chats)
 */

import { Router, Request, Response } from 'express';
import {
  getChannel,
  getMessagesForChannel,
  getFilesForChannel,
  addMessage,
  getUser,
} from '../services/supabase';
import {
  chat,
  buildContext,
  createChannelAssistantPrompt,
  isConfigured,
} from '../services/openai';
import { AskAssistantRequest, ApiResponse, Message, User } from '../types';

const router = Router();

// Assistant user ID (stored in database)
const ASSISTANT_USER_ID = 'assistant';

/**
 * POST /api/assistant/ask
 * Ask the AI assistant a question
 * Body: { question: string, channelId: string, userId: string }
 * 
 * IMPORTANT: The assistant is ONLY available in channels, NOT in individual chats
 */
router.post(
  '/ask',
  async (
    req: Request<{}, ApiResponse<Message>, AskAssistantRequest>,
    res: Response<ApiResponse<Message>>
  ) => {
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
      if (!isConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'AI Assistant is not configured. Please set OPENAI_API_KEY environment variable.',
        });
      }

      // Get the channel
      const channel = await getChannel(channelId);
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
      const user = await getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      console.log(`🤖 Assistant query from ${user.name} in ${channel.name}: "${question}"`);

      // Get context: last 20 messages and all files
      const allMessages = await getMessagesForChannel(channelId);
      const recentMessages = allMessages.slice(-20);
      const channelFiles = await getFilesForChannel(channelId);

      // Build context for RAG (only use files with content)
      const textFiles = channelFiles
        .filter((f) => typeof f.content === 'string' && f.content.length > 0)
        .map((f) => ({ name: f.name, content: f.content! }));
      const context = buildContext(recentMessages, textFiles, channel.members);

      // Create system prompt
      const systemPrompt = createChannelAssistantPrompt(channel.name);

      // Call OpenAI
      const response = await chat(systemPrompt, question, context);

      // Create assistant message in database
      const assistantMessage = await addMessage(response, ASSISTANT_USER_ID, {
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
    } catch (error) {
      console.error('❌ Error in assistant:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to get assistant response';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
);

/**
 * GET /api/assistant/status
 * Check if the AI assistant is configured and available
 */
router.get('/status', (_req: Request, res: Response) => {
  const configured = isConfigured();
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

export default router;
