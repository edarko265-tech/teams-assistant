/**
 * Chats API Routes
 * Handles 1-on-1 chat listing and details
 */

import { Router, Request, Response } from 'express';
import { getChatsForUser, getChat, getAllUsers } from '../services/storage';
import { ApiResponse, Chat } from '../types';

const router = Router();

/**
 * GET /api/chats
 * List all individual chats for current user
 * Query param: userId (required for demo, in production would use auth)
 */
router.get('/', (req: Request, res: Response<ApiResponse<Chat[]>>) => {
  try {
    // In a real app, userId would come from authentication
    // For demo, we accept it as a query param, defaulting to user-1 (Alice)
    const userId = (req.query.userId as string) || 'user-1';

    const chats = getChatsForUser(userId);
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
router.get('/:id', (req: Request, res: Response<ApiResponse<Chat>>) => {
  try {
    const { id } = req.params;
    const chat = getChat(id);

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
 * GET /api/chats/users/all
 * Get all users (for starting new chats - demo endpoint)
 */
router.get('/users/all', (_req: Request, res: Response) => {
  try {
    const users = getAllUsers();
    console.log(`👥 Fetched ${users.length} users`);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
