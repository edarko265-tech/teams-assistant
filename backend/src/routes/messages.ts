/**
 * Messages API Routes
 * Handles message retrieval and sending for channels and chats
 */

import { Router, Request, Response } from 'express';
import {
  getMessagesFor,
  addMessage,
  getUser,
  getChannel,
  getChat,
  generateId,
} from '../services/storage';
import { Message, SendMessageRequest, ApiResponse } from '../types';

const router = Router();

/**
 * GET /api/messages/:channelOrChatId
 * Get all messages for a channel or chat
 */
router.get(
  '/:channelOrChatId',
  (req: Request, res: Response<ApiResponse<Message[]>>) => {
    try {
      const { channelOrChatId } = req.params;
      const messages = getMessagesFor(channelOrChatId);

      console.log(
        `📨 Fetched ${messages.length} messages for: ${channelOrChatId}`
      );
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  }
);

/**
 * POST /api/messages/:channelOrChatId
 * Send a new message to a channel or chat
 * Body: { content: string, userId: string }
 */
router.post(
  '/:channelOrChatId',
  (
    req: Request<{ channelOrChatId: string }, ApiResponse<Message>, SendMessageRequest>,
    res: Response<ApiResponse<Message>>
  ) => {
    try {
      const { channelOrChatId } = req.params;
      const { content, userId } = req.body;

      // Validate request
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      // Get the sender
      const sender = getUser(userId);
      if (!sender) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check if it's a channel or chat
      const isChannel = channelOrChatId.startsWith('channel-');
      const isChat = channelOrChatId.startsWith('chat-');

      if (isChannel) {
        const channel = getChannel(channelOrChatId);
        if (!channel) {
          return res.status(404).json({
            success: false,
            error: 'Channel not found',
          });
        }
      } else if (isChat) {
        const chat = getChat(channelOrChatId);
        if (!chat) {
          return res.status(404).json({
            success: false,
            error: 'Chat not found',
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid channel or chat ID',
        });
      }

      // Create the message
      const message: Message = {
        id: generateId('msg'),
        content: content.trim(),
        sender,
        timestamp: new Date(),
        ...(isChannel
          ? { channelId: channelOrChatId }
          : { chatId: channelOrChatId }),
        isAssistant: false,
      };

      // Save the message
      addMessage(message);

      console.log(
        `📤 New message from ${sender.name} in ${channelOrChatId}: "${content.substring(0, 50)}..."`
      );
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  }
);

export default router;
