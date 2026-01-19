/**
 * Assistant API Routes
 * Handles AI assistant queries for channels (NOT available for individual chats)
 */

import { Router, Request, Response } from 'express';
import {
  getChannel,
  getLastMessages,
  getFilesForChannel,
  addMessage,
  getUser,
  generateId,
} from '../services/storage';
import {
  chat,
  buildContext,
  createChannelAssistantPrompt,
  isConfigured,
} from '../services/openai';
import { AskAssistantRequest, ApiResponse, Message, User } from '../types';

const router = Router();

// Assistant user (for messages)
const assistantUser: User = {
  id: 'assistant',
  name: 'AI Assistant',
  email: 'assistant@teams.local',
};

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
      const channel = getChannel(channelId);
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
      const user = getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      console.log(`🤖 Assistant query from ${user.name} in ${channel.name}: "${question}"`);

      // Get context: last 20 messages and all files
      const recentMessages = getLastMessages(channelId, 20);
      const channelFiles = getFilesForChannel(channelId);

      // Build context for RAG
      const context = buildContext(recentMessages, channelFiles);

      // Create system prompt
      const systemPrompt = createChannelAssistantPrompt(channel.name);

      // Call OpenAI
      const response = await chat(systemPrompt, question, context);

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId('msg'),
        content: response,
        sender: assistantUser,
        timestamp: new Date(),
        channelId,
        isAssistant: true,
      };

      // Save the assistant's response as a message
      addMessage(assistantMessage);

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
