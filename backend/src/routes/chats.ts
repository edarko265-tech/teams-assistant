/**
 * Chats API Routes
 * Handles 1-on-1 chat listing and details
 */

import { Router, Request, Response } from 'express';
import {
  getChatsForUser,
  getChat,
  getAllUsers,
  createChat,
  findExistingChat,
} from '../services/supabase';
import { ApiResponse, Chat, User } from '../types';

const router = Router();

/**
 * GET /api/chats
 * List all individual chats for current user
 * Query param: userId (required)
 */
router.get('/', async (req: Request, res: Response<ApiResponse<Chat[]>>) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const chats = await getChatsForUser(userId);
    console.log(`💬 Fetched ${chats.length} chats for user: ${userId}`);
    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chats' });
  }
});

/**
 * GET /api/chats/:id
 * Get chat details by ID
 */
router.get('/:id', async (req: Request, res: Response<ApiResponse<Chat>>) => {
  try {
    const { id } = req.params;
    const chat = await getChat(id);

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    console.log(`💬 Fetched chat: ${id}`);
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat' });
  }
});

/**
 * POST /api/chats
 * Create a new chat (or get existing)
 * Body: { participantIds: string[] }
 */
router.post('/', async (req: Request, res: Response<ApiResponse<Chat>>) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || participantIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 participant IDs are required',
      });
    }

    // For 1-on-1 chats, check if one already exists
    if (participantIds.length === 2) {
      const existingChat = await findExistingChat(participantIds[0], participantIds[1]);
      if (existingChat) {
        console.log(`💬 Returning existing chat: ${existingChat.id}`);
        return res.json({ success: true, data: existingChat });
      }
    }

    const chat = await createChat(participantIds);
    if (!chat) {
      return res.status(500).json({ success: false, error: 'Failed to create chat' });
    }

    console.log(`💬 Created new chat: ${chat.id}`);
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ success: false, error: 'Failed to create chat' });
  }
});

/**
 * GET /api/chats/users/all
 * Get all users (for starting new chats)
 */
router.get('/users/all', async (_req: Request, res: Response<ApiResponse<User[]>>) => {
  try {
    const users = await getAllUsers();
    console.log(`👥 Fetched ${users.length} users`);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
